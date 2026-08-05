#[cfg(feature = "ssr")]
pub async fn handle_stripe_webhook(
    axum::extract::State(state): axum::extract::State<crate::state::AppState>,
    headers: axum::http::HeaderMap,
    body: String,
) -> axum::http::StatusCode {
    use bin_bag_core::stripe::verify_webhook_signature;
    use serde_json::Value;

    let secret = match std::env::var("STRIPE_WEBHOOK_SECRET") {
        Ok(s) => s,
        Err(_) => {
            tracing::warn!("STRIPE_WEBHOOK_SECRET not set, ignoring webhook");
            return axum::http::StatusCode::OK;
        }
    };

    let sig_header = match headers.get("Stripe-Signature").and_then(|v| v.to_str().ok()) {
        Some(s) => s,
        None => return axum::http::StatusCode::BAD_REQUEST,
    };

    match verify_webhook_signature(&body, sig_header, &secret) {
        Ok(true) => {},
        Ok(false) => {
            tracing::error!("Invalid Stripe webhook signature");
            return axum::http::StatusCode::BAD_REQUEST;
        }
        Err(e) => {
            tracing::error!("Error verifying Stripe webhook signature: {}", e);
            return axum::http::StatusCode::BAD_REQUEST;
        }
    }

    let payload: Value = match serde_json::from_str(&body) {
        Ok(v) => v,
        Err(_) => return axum::http::StatusCode::BAD_REQUEST,
    };

    let event_type = payload["type"].as_str().unwrap_or_default();
    if event_type == "checkout.session.completed" {
        if let Some(session_id) = payload["data"]["object"]["id"].as_str() {
            tracing::info!("Completing order for Stripe checkout session: {}", session_id);
            let _ = sqlx::query(
                r#"
                UPDATE orders
                SET status = 'completed', completed_at = NOW()
                WHERE stripe_checkout_session_id = $1
                "#
            )
            .bind(session_id)
            .execute(&state.db)
            .await;
        }
    }

    axum::http::StatusCode::OK
}
