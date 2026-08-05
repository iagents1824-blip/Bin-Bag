use leptos::prelude::*;
use crate::server_fns::orders::get_buyer_orders;
use crate::server_fns::reviews::create_review;
use crate::components::star_rating::StarRating;

#[component]
pub fn BuyerOrdersPage() -> impl IntoView {
    // Auth guard for logged in users
    let auth = expect_context::<crate::app::AuthContext>();
    Effect::new(move || {
        if auth.user.get().is_none() {
            let navigate = leptos_router::hooks::use_navigate();
            navigate("/login", Default::default());
        }
    });

    let (refresh_trigger, set_refresh_trigger) = signal(0);

    let orders_res = Resource::new(
        move || refresh_trigger.get(),
        |_| async move { get_buyer_orders(None, Some(20)).await }
    );

    // State for leaving a review
    let (reviewing_listing_id, set_reviewing_listing_id) = signal(Option::<String>::None);
    let (rating_input, set_rating_input) = signal(5_i32);
    let (comment_input, set_comment_input) = signal(String::new());
    let (review_error, set_review_error) = signal(String::new());
    let (review_success, set_review_success) = signal(String::new());
    let (submitting_review, set_submitting_review) = signal(false);

    let on_submit_review = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        let Some(listing_id) = reviewing_listing_id.get() else { return; };
        let rating = rating_input.get();
        let comment = comment_input.get();

        set_submitting_review.set(true);
        set_review_error.set(String::new());
        set_review_success.set(String::new());

        leptos::task::spawn_local(async move {
            match create_review(listing_id, rating, comment).await {
                Ok(_) => {
                    set_review_success.set("Review published successfully!".to_string());
                    set_comment_input.set(String::new());
                    set_reviewing_listing_id.set(None);
                    set_refresh_trigger.update(|n| *n += 1);
                }
                Err(e) => set_review_error.set(e.to_string()),
            }
            set_submitting_review.set(false);
        });
    };

    view! {
        <div class="container mx-auto px-4 py-8 max-w-5xl">
            <div class="mb-8">
                <h1 class="text-3xl font-extrabold text-white tracking-tight">"My Orders"</h1>
                <p class="text-gray-400 mt-1">"View your purchased AI assets, download license keys, and leave feedback."</p>
            </div>

            <Show when=move || !review_success.get().is_empty()>
                <div class="alert alert-success mb-6">
                    {move || review_success.get()}
                </div>
            </Show>

            <Show when=move || !review_error.get().is_empty()>
                <div class="alert alert-error mb-6">
                    {move || review_error.get()}
                </div>
            </Show>

            // Review Modal / Inline Box
            <Show when=move || reviewing_listing_id.get().is_some()>
                <div class="mb-8 p-6 rounded-2xl bg-gray-900 border border-blue-500/40 shadow-2xl">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-white">"Leave a Review"</h3>
                        <button
                            class="text-gray-400 hover:text-white text-sm"
                            on:click=move |_| set_reviewing_listing_id.set(None)
                        >
                            "✕ Close"
                        </button>
                    </div>
                    <form on:submit=on_submit_review class="space-y-4">
                        <div>
                            <label class="form-label">"Rating (1 to 5 stars)"</label>
                            <div class="mt-1">
                                <StarRating
                                    rating=rating_input.get() as f64
                                    interactive=true
                                    on_select=Callback::new(move |val| set_rating_input.set(val))
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">"Your Feedback"</label>
                            <textarea
                                class="form-textarea w-full h-24"
                                placeholder="How was this AI model or prompt? Did it meet your expectations?"
                                prop:value=move || comment_input.get()
                                on:input=move |ev| set_comment_input.set(event_target_value(&ev))
                                required
                            />
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button
                                type="button"
                                class="btn btn-secondary px-4 py-2"
                                on:click=move |_| set_reviewing_listing_id.set(None)
                            >
                                "Cancel"
                            </button>
                            <button
                                type="submit"
                                class="btn btn-primary px-5 py-2"
                                disabled=move || submitting_review.get()
                            >
                                {move || if submitting_review.get() { "Submitting..." } else { "Post Review" }}
                            </button>
                        </div>
                    </form>
                </div>
            </Show>

            // Orders Grid
            <div class="space-y-4">
                <Suspense fallback=move || view! { <div class="text-gray-400">"Loading your orders..."</div> }>
                    {move || {
                        orders_res.get().map(|res| match res {
                            Ok(page) => {
                                if page.items.is_empty() {
                                    view! {
                                        <div class="p-12 text-center rounded-2xl bg-gray-900/40 border border-gray-800 text-gray-400">
                                            "You haven't purchased any listings yet."
                                            <div class="mt-4">
                                                <a href="/" class="btn btn-primary">"Explore Marketplace"</a>
                                            </div>
                                        </div>
                                    }.into_any()
                                } else {
                                    view! {
                                        <div class="space-y-4">
                                            {page.items.into_iter().map(|item| {
                                                let listing_url = format!("/listings/{}", item.order.listing_id);
                                                let listing_id = item.order.listing_id.to_string();
                                                let date_str = item.order.created_at.format("%b %d, %Y").to_string();
                                                let price_str = if item.order.price_cents == 0 {
                                                    "Free".to_string()
                                                } else {
                                                    format!("${:.2}", item.order.price_cents as f64 / 100.0)
                                                };

                                                let status_class = match item.order.status {
                                                    bin_bag_core::models::order::OrderStatus::Completed => "badge badge-success",
                                                    bin_bag_core::models::order::OrderStatus::Pending => "badge badge-warning",
                                                    bin_bag_core::models::order::OrderStatus::Refunded => "badge",
                                                    bin_bag_core::models::order::OrderStatus::Failed => "badge badge-error",
                                                };

                                                let external_link = item.external_link.clone();

                                                view! {
                                                    <div class="card flex flex-col md:flex-row md:items-center justify-between gap-4" style="padding: var(--space-6);">
                                                        <div class="space-y-1">
                                                            <div class="flex items-center space-x-3">
                                                                <span class=status_class>
                                                                    {format!("{:?}", item.order.status)}
                                                                </span>
                                                                <span class="text-xs text-secondary">{date_str}</span>
                                                            </div>
                                                            <h3 class="text-lg font-bold text-primary hover:text-link transition-colors">
                                                                <a href=listing_url>{item.listing_title.clone()}</a>
                                                            </h3>
                                                            <p class="text-xs text-secondary">
                                                                "Sold by " <span class="text-primary font-medium">{item.seller_username.clone()}</span>
                                                                " • " <span class="text-primary">{price_str.clone()}</span>
                                                            </p>
                                                        </div>

                                                        <div class="flex items-center space-x-3">
                                                            {if let Some(link) = external_link {
                                                                view! {
                                                                    <a
                                                                        href=link
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        class="btn btn-secondary px-4 py-2 text-sm font-semibold flex items-center space-x-1"
                                                                    >
                                                                        <span>"📥 Access Asset"</span>
                                                                    </a>
                                                                }.into_any()
                                                            } else {
                                                                view! { <span class="text-xs text-secondary">"No download link"</span> }.into_any()
                                                            }}

                                                            {if item.order.status == bin_bag_core::models::order::OrderStatus::Completed {
                                                                let id_clone = listing_id.clone();
                                                                view! {
                                                                    <button
                                                                        class="btn btn-primary px-4 py-2 text-sm font-semibold"
                                                                        on:click=move |_| {
                                                                            set_reviewing_listing_id.set(Some(id_clone.clone()));
                                                                        }
                                                                    >
                                                                        "★ Leave Review"
                                                                    </button>
                                                                }.into_any()
                                                            } else {
                                                                view! { <span></span> }.into_any()
                                                            }}
                                                        </div>
                                                    </div>
                                                }
                                            }).collect::<Vec<_>>()}
                                        </div>
                                    }.into_any()
                                }
                            },
                            Err(e) => view! { <div class="alert alert-error">{e.to_string()}</div> }.into_any(),
                        })
                    }}
                </Suspense>
            </div>
        </div>
    }
}
