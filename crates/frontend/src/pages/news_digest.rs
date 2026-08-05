use leptos::prelude::*;
use crate::components::news_card::NewsCard;
use crate::server_fns::news::{get_daily_digest, trigger_news_scrape_admin};
use bin_bag_core::models::user::UserRole;

#[component]
pub fn NewsDigestPage() -> impl IntoView {
    let auth = expect_context::<crate::app::AuthContext>();
    let is_admin = move || {
        auth.user.get().map(|u| u.role == UserRole::Admin).unwrap_or(false)
    };

    let (trigger_msg, set_trigger_msg) = signal(String::new());
    let (refresh_trigger, set_refresh_trigger) = signal(0u32);

    let digest_resource = Resource::new(
        move || refresh_trigger.get(),
        |_| async move { get_daily_digest(None).await },
    );

    let on_scrape_click = move |_| {
        set_trigger_msg.set("Scraping RSS feeds in background...".to_string());
        leptos::task::spawn_local(async move {
            match trigger_news_scrape_admin().await {
                Ok(count) => {
                    set_trigger_msg.set(format!("Successfully ingested {} new articles!", count));
                    set_refresh_trigger.update(|n| *n += 1);
                }
                Err(e) => {
                    set_trigger_msg.set(format!("Scrape error: {}", e));
                }
            }
        });
    };

    view! {
        <div class="container py-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-3xl font-extrabold text-foreground tracking-tight mb-2">
                        "Daily AI News Digest"
                    </h1>
                    <p class="text-muted text-sm max-w-2xl">
                        "Curated AI research, releases, and industry updates aggregated automatically. All external feed content is sanitized and isolated safely as data."
                    </p>
                </div>

                <div class="flex items-center gap-3">
                    <Show when=is_admin fallback=|| view! {}>
                        <button
                            on:click=on_scrape_click
                            class="btn btn-sm btn-secondary flex items-center gap-1.5"
                        >
                            <span>"⚡"</span>
                            <span>"Trigger RSS Scrape"</span>
                        </button>
                    </Show>
                    <a
                        href="/news/archive"
                        class="btn btn-sm btn-outline"
                    >
                        "View Full Archive →"
                    </a>
                </div>
            </div>

            <Show
                when=move || !trigger_msg.get().is_empty()
                fallback=|| view! {}
            >
                <div class="alert alert-info mb-6">
                    {move || trigger_msg.get()}
                </div>
            </Show>

            <Suspense fallback=move || view! {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    <div class="h-48 bg-card rounded-xl"></div>
                    <div class="h-48 bg-card rounded-xl"></div>
                    <div class="h-48 bg-card rounded-xl"></div>
                </div>
            }>
                {move || digest_resource.get().map(|res| match res {
                    Ok(digest) => {
                        let articles = digest.articles.clone();
                        if articles.is_empty() {
                            view! {
                                <div class="card p-12 text-center text-muted">
                                    <p class="text-base mb-2 font-medium">"No news articles found for today yet."</p>
                                    <p class="text-xs">"The background worker aggregates new RSS feeds every 6 hours."</p>
                                </div>
                            }.into_any()
                        } else {
                            view! {
                                <div>
                                    <div class="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
                                        <span class="text-xs font-semibold text-muted uppercase tracking-wider">
                                            {format!("Digest Date: {}", digest.date_str)}
                                        </span>
                                        <span class="text-xs text-muted">
                                            {format!("{} articles", digest.total_count)}
                                        </span>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <For
                                            each=move || articles.clone()
                                            key=|a| a.id
                                            let:article
                                        >
                                            <NewsCard article=article />
                                        </For>
                                    </div>
                                </div>
                            }.into_any()
                        }
                    }
                    Err(e) => view! {
                        <div class="alert alert-error">
                            {format!("Failed to load daily digest: {}", e)}
                        </div>
                    }.into_any(),
                })}
            </Suspense>
        </div>
    }
}
