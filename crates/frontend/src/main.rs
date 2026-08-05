//! Bin Bag — Axum SSR Entry Point

#![recursion_limit = "512"]

#[cfg(feature = "ssr")]
#[tokio::main]
async fn main() {
    use axum::Router;
    use leptos::prelude::*;
    use leptos_axum::{generate_route_list, LeptosRoutes};
    use sqlx::postgres::PgPoolOptions;
    use tracing_subscriber::EnvFilter;

    use bin_bag_frontend::app::App;
    use bin_bag_frontend::state::AppState;

    // Load .env file (ignore if missing — production uses real env vars)
    let _ = dotenvy::dotenv();

    // Initialize structured logging
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_target(true)
        .init();

    tracing::info!("Starting Bin Bag server...");

    // Database connection pool
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(20)
        .min_connections(2)
        .acquire_timeout(std::time::Duration::from_secs(5))
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    tracing::info!("Connected to PostgreSQL");

    // Run migrations
    sqlx::migrate!("../../migrations")
        .run(&pool)
        .await
        .expect("Failed to run database migrations");

    tracing::info!("Database migrations applied");

    // JWT secret
    let jwt_secret = std::env::var("JWT_SECRET")
        .expect("JWT_SECRET must be set");

    // Leptos configuration
    let conf = get_configuration(None).unwrap();
    let leptos_options = conf.leptos_options;
    let addr = leptos_options.site_addr;
    let routes = generate_route_list(App);

    let app_state = AppState {
        db: pool,
        jwt_secret,
        leptos_options: leptos_options.clone(),
        ws_hub: bin_bag_frontend::state::WsHub::new(),
    };

    let api_routes = Router::new()
        .route("/api/webhooks/stripe", axum::routing::post(bin_bag_frontend::routes::stripe_webhook::handle_stripe_webhook))
        .route("/api/ws", axum::routing::get(bin_bag_frontend::routes::websocket::handle_ws_upgrade))
        .with_state(app_state.clone());

    use tower_http::services::ServeDir;

    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let style_dir = format!("{}/style", manifest_dir);
    let public_dir = format!("{}/public", manifest_dir);

    // Build Axum router
    let app = Router::new()
        .nest_service("/pkg", ServeDir::new(&style_dir))
        .nest_service("/style", ServeDir::new(&style_dir))
        .nest_service("/public", ServeDir::new(&public_dir))
        .merge(api_routes)
        .leptos_routes_with_context(
            &leptos_options,
            routes,
            {
                let app_state = app_state.clone();
                move || {
                    leptos::context::provide_context(app_state.clone());
                }
            },
            {
                let leptos_options = leptos_options.clone();
                move || shell(leptos_options.clone())
            },
        )
        .fallback(leptos_axum::file_and_error_handler::<leptos::prelude::LeptosOptions, _>(shell))
        .with_state(leptos_options);

    // Start server
    tracing::info!("Listening on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");
    axum::serve(listener, app.into_make_service())
        .await
        .expect("Server error");
}

#[cfg(feature = "ssr")]
fn shell(options: leptos::prelude::LeptosOptions) -> impl leptos::prelude::IntoView {
    use leptos::prelude::*;
    use leptos_meta::*;
    use bin_bag_frontend::app::App;

    view! {
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <AutoReload options=options.clone()/>
                <HydrationScripts options=options.clone()/>
                <MetaTags/>
            </head>
            <body>
                <App/>
            </body>
        </html>
    }
}

#[cfg(not(feature = "ssr"))]
fn main() {
    // This binary is only used with the SSR feature.
    // Client-side hydration is handled by lib.rs.
}
