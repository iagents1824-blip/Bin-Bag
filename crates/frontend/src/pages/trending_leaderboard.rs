use leptos::prelude::*;
use crate::components::trending_card::TrendingCard;
use crate::server_fns::trending::{get_trending_leaderboard, recalculate_trending_admin};
use bin_bag_core::models::user::UserRole;

#[component]
pub fn TrendingLeaderboardPage() -> impl IntoView {
    let auth = expect_context::<crate::app::AuthContext>();
    let is_admin = move || {
        auth.user.get().map(|u| u.role == UserRole::Admin).unwrap_or(false)
    };

    let (trigger_msg, set_trigger_msg) = signal(String::new());
    let (refresh_trigger, set_refresh_trigger) = signal(0u32);

    let leaderboard_resource = Resource::new(
        move || refresh_trigger.get(),
        |_| async move { get_trending_leaderboard(Some(25)).await },
    );

    let on_recalc_click = move |_| {
        set_trigger_msg.set("Recalculating leaderboard scores in background...".to_string());
        leptos::task::spawn_local(async move {
            match recalculate_trending_admin().await {
                Ok(count) => {
                    set_trigger_msg.set(format!("Successfully recalculated rankings for {} active listings!", count));
                    set_refresh_trigger.update(|n| *n += 1);
                }
                Err(e) => {
                    set_trigger_msg.set(format!("Recalculation error: {}", e));
                }
            }
        });
    };

    view! {
        <div class="container py-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-3xl font-extrabold text-foreground tracking-tight mb-2 flex items-center gap-2">
                        <span>"🔥 Trending AI Models Leaderboard"</span>
                    </h1>
                    <p class="text-muted text-sm max-w-2xl">
                        "Real-time ranking of AI assets on Bin Bag based on transparent community signals, verified sales, and review satisfaction."
                    </p>
                </div>

                <div>
                    <Show when=is_admin fallback=|| view! {}>
                        <button
                            on:click=on_recalc_click
                            class="btn btn-sm btn-secondary flex items-center gap-1.5"
                        >
                            <span>"⚡"</span>
                            <span>"Recalculate Leaderboard"</span>
                        </button>
                    </Show>
                </div>
            </div>

            <div class="card bg-card/60 border border-border/60 p-4 mb-8 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-xs text-muted">
                    <span class="font-bold text-foreground">"Scoring Formula:"</span>
                    <code class="px-2 py-0.5 rounded bg-muted/20 text-foreground font-mono text-xs">
                        "Score = (10 × Purchases 7d) + (5 × Review Sat.) + (2 × Discussion 7d) + (15 × Newness)"
                    </code>
                </div>
                <span class="text-xs text-muted italic">
                    "Recalculates automatically every 24 hours at midnight UTC."
                </span>
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
                <div class="flex flex-col gap-4 animate-pulse">
                    <div class="h-24 bg-card rounded-xl"></div>
                    <div class="h-24 bg-card rounded-xl"></div>
                    <div class="h-24 bg-card rounded-xl"></div>
                </div>
            }>
                {move || leaderboard_resource.get().map(|res| match res {
                    Ok(items) => {
                        if items.is_empty() {
                            view! {
                                <div class="card p-12 text-center text-muted">
                                    <p class="text-base mb-2 font-medium">"No trending assets found yet."</p>
                                    <p class="text-xs">"Listings appear here once marketplace activity is recorded."</p>
                                </div>
                            }.into_any()
                        } else {
                            view! {
                                <div class="flex flex-col gap-3">
                                    <For
                                        each=move || items.clone()
                                        key=|i| i.listing.id
                                        let:item
                                    >
                                        <TrendingCard item=item />
                                    </For>
                                </div>
                            }.into_any()
                        }
                    }
                    Err(e) => view! {
                        <div class="alert alert-error">
                            {format!("Failed to load leaderboard: {}", e)}
                        </div>
                    }.into_any(),
                })}
            </Suspense>
        </div>
    }
}
