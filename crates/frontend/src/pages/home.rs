use leptos::prelude::*;
use crate::components::listing_card::ListingCard;
use crate::server_fns::listings::list_listings;
use crate::server_fns::trending::get_trending_leaderboard;

#[component]
pub fn HomePage() -> impl IntoView {
    let (category, set_category) = signal("All".to_string());

    let categories = vec![
        "All", "Model", "Chatbot", "Assistant", "Workflow", "Prompt", "Dataset",
    ];

    let listings_resource = Resource::new(
        move || category.get(),
        |cat| async move {
            let cat_filter = if cat == "All" { None } else { Some(cat) };
            list_listings(None, cat_filter, None, None, None, Some(20)).await
        },
    );

    let trending_resource = Resource::new(
        || (),
        |_| async move { get_trending_leaderboard(Some(3)).await },
    );

    view! {
        <div class="home-page animate-fade-in">
            <section class="hero">
                <div class="container">
                    <h1 class="hero-title">
                        "Welcome to " <span class="hero-title-gradient">"Bin Bag"</span>
                    </h1>
                    <p class="hero-subtitle">
                        "The premier AI marketplace for models, chatbots, assistants, workflows, prompts, and datasets."
                    </p>
                    <div class="hero-actions">
                        <a href="/listings" class="btn btn-primary btn-lg">"Browse Marketplace"</a>
                        <a href="/signup" class="btn btn-secondary btn-lg">"Start Selling"</a>
                    </div>
                    <div class="hero-stats">
                        <div class="hero-stat">
                            <div class="hero-stat-value">"10,000+"</div>
                            <div class="hero-stat-label">"AI Assets"</div>
                        </div>
                        <div class="hero-stat">
                            <div class="hero-stat-value">"99.8%"</div>
                            <div class="hero-stat-label">"Verified Quality"</div>
                        </div>
                        <div class="hero-stat">
                            <div class="hero-stat-value">"$2.5M+"</div>
                            <div class="hero-stat-label">"Creator Earnings"</div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="container mt-8 mb-8">
                <div class="section-header">
                    <div class="flex items-center gap-2">
                        <h2 class="section-title">"🔥 Trending AI Models"</h2>
                        <span class="badge badge-model">"24h Leaderboard"</span>
                    </div>
                    <a href="/trending" class="btn btn-ghost btn-sm">
                        "View Full Leaderboard →"
                    </a>
                </div>
                <Suspense fallback=move || view! { <div class="text-center py-6 text-tertiary">"Loading trending models..."</div> }>
                    {move || trending_resource.get().map(|res| match res {
                        Ok(items) => {
                            if items.is_empty() {
                                view! { <div class="text-center py-6 text-tertiary">"No trending assets yet."</div> }.into_any()
                            } else {
                                view! {
                                    <div class="flex flex-col gap-3">
                                        <For
                                            each=move || items.clone()
                                            key=|i| i.listing.id
                                            let:item
                                        >
                                            <crate::components::trending_card::TrendingCard item=item />
                                        </For>
                                    </div>
                                }.into_any()
                            }
                        }
                        Err(_) => view! {}.into_any(),
                    })}
                </Suspense>
            </section>

            <section class="container mt-8 mb-8">
                <div class="section-header">
                    <h2 class="section-title">"Latest Listings"</h2>
                    <div class="category-filter">
                        <For
                            each=move || categories.clone()
                            key=|c| c.to_string()
                            let:cat
                        >
                            <button
                                class=move || {
                                    if category.get() == cat {
                                        "category-btn active"
                                    } else {
                                        "category-btn"
                                    }
                                }
                                on:click=move |_| set_category.set(cat.to_string())
                            >
                                {cat.to_string()}
                            </button>
                        </For>
                    </div>
                </div>

                <Suspense fallback=move || view! { <div class="text-center py-10">"Loading listings..."</div> }>
                    {move || listings_resource.get().map(|result| match result {
                        Ok(data) => {
                            if data.items.is_empty() {
                                view! { <div class="text-center py-10 text-secondary">"No listings found."</div> }.into_any()
                            } else {
                                view! {
                                    <div class="grid grid-listings stagger-children">
                                        <For
                                            each=move || data.items.clone()
                                            key=|listing| listing.id.clone()
                                            let:listing
                                        >
                                            <ListingCard listing=listing />
                                        </For>
                                    </div>
                                }.into_any()
                            }
                        },
                        Err(e) => view! { <div class="alert alert-error">{format!("Error loading listings: {}", e)}</div> }.into_any(),
                    })}
                </Suspense>
            </section>
        </div>
    }
}
