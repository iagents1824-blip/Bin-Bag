use leptos::prelude::*;
use leptos_router::hooks::{use_params_map, use_navigate};
use crate::server_fns::listings::{get_listing, get_listing_seller};
use crate::server_fns::orders::create_checkout_session;
use crate::server_fns::reviews::{list_reviews, create_review};
use crate::components::type_badge::TypeBadge;
use crate::components::star_rating::StarRating;
use crate::components::review_card::ReviewCard;
use crate::components::playground::Playground;
use crate::app::AuthContext;

#[component]
pub fn ListingDetail() -> impl IntoView {
    let params = use_params_map();
    let id = move || params.get().get("id").unwrap_or_default();
    
    let auth = expect_context::<AuthContext>();
    let navigate = use_navigate();

    let (refresh_trigger, set_refresh_trigger) = signal(0);

    let listing_resource = Resource::new(
        move || (id(), refresh_trigger.get()),
        |(id, _)| async move { get_listing(id).await },
    );

    let seller_resource = Resource::new(
        move || id(),
        |id| async move {
            if let Ok(listing) = get_listing(id).await {
                get_listing_seller(listing.seller_id.to_string()).await
            } else {
                Err(ServerFnError::new("Listing not found"))
            }
        },
    );

    let reviews_resource = Resource::new(
        move || (id(), refresh_trigger.get()),
        |(id, _)| async move {
            list_reviews(id, None, Some(10)).await
        }
    );

    let (buying, set_buying) = signal(false);
    let (buy_error, set_buy_error) = signal(String::new());

    // Review Form state
    let (show_review_modal, set_show_review_modal) = signal(false);
    let (rating_input, set_rating_input) = signal(5_i32);
    let (comment_input, set_comment_input) = signal(String::new());
    let (review_error, set_review_error) = signal(String::new());
    let (review_success, set_review_success) = signal(String::new());
    let (submitting_review, set_submitting_review) = signal(false);

    let on_submit_review = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        let listing_id = id();
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
                    set_show_review_modal.set(false);
                    set_refresh_trigger.update(|n| *n += 1);
                }
                Err(e) => set_review_error.set(e.to_string()),
            }
            set_submitting_review.set(false);
        });
    };

    view! {
        <div class="container mt-8 mb-8 animate-fade-in">
            <Suspense fallback=move || view! { <div class="text-center py-20 text-tertiary">"Loading listing details..."</div> }>
                {move || {
                    let auth_user_id = auth.user.get().map(|u| u.id);
                    listing_resource.get().map(|res| match res {
                        Ok(listing) => {
                            let is_owner = auth_user_id.map(|uid| uid == listing.seller_id).unwrap_or(false);
                            let edit_url = format!("/listings/{}/edit", listing.id);
                            let listing_id_str = listing.id.to_string();

                            let avg_rating = listing.rating_avg.unwrap_or(0.0);
                            let rev_count = listing.review_count;

                            view! {
                                <div class="listing-detail">
                                    <div class="main-content space-y-8">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h1 class="text-4xl font-bold mb-2">{listing.title.clone()}</h1>
                                                <div class="flex items-center gap-3">
                                                    <TypeBadge listing_type=listing.listing_type.clone() />
                                                    <span class="badge badge-secondary">{listing.category.clone()}</span>
                                                    <div class="flex items-center space-x-1 ml-2">
                                                        <StarRating rating=avg_rating />
                                                        <span class="text-sm text-secondary">
                                                            {format!("({} {})", rev_count, if rev_count == 1 { "review" } else { "reviews" })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Show when=move || is_owner>
                                                <a href=edit_url.clone() class="btn btn-secondary btn-sm">
                                                    "Edit Listing"
                                                </a>
                                            </Show>
                                        </div>
                                        
                                        <div class="card p-6">
                                            <h3 class="text-xl font-semibold mb-4 pb-2 border-b border-border">"Description"</h3>
                                            <p class="whitespace-pre-wrap text-secondary">{listing.description.clone()}</p>
                                        </div>

                                        <Show when={
                                            let tags = listing.tags.clone();
                                            move || !tags.is_empty()
                                        }>
                                            <div class="flex flex-wrap gap-2">
                                                <For each={
                                                    let tags = listing.tags.clone();
                                                    move || tags.clone()
                                                } key=|tag| tag.clone() let:tag>
                                                    <span class="badge badge-primary">
                                                        {format!("#{}", tag)}
                                                    </span>
                                                </For>
                                            </div>
                                        </Show>

                                        // Interactive AI Playground Sandbox
                                        <Playground
                                            listing_id=listing.id.to_string()
                                            listing_title=listing.title.clone()
                                            listing_type=listing.listing_type.clone()
                                        />

                                        // Reviews & Feedback Section
                                        <div class="card p-6 space-y-6">
                                            <div class="flex items-center justify-between pb-4 border-b border-border">
                                                <div>
                                                    <h3 class="text-xl font-bold">"Customer Reviews"</h3>
                                                    <p class="text-sm text-secondary">"Verified purchases and feedback from buyers."</p>
                                                </div>
                                                {if auth.user.get().is_some() && !is_owner {
                                                    view! {
                                                        <button
                                                            class="btn btn-secondary btn-sm"
                                                            on:click=move |_| set_show_review_modal.set(true)
                                                        >
                                                            "★ Leave a Review"
                                                        </button>
                                                    }.into_any()
                                                } else {
                                                    view! { <span></span> }.into_any()
                                                }}
                                            </div>

                                            <Show when=move || !review_success.get().is_empty()>
                                                <div class="alert alert-success">
                                                    {move || review_success.get()}
                                                </div>
                                            </Show>

                                            <Show when=move || show_review_modal.get()>
                                                <div class="card p-6 bg-card-hover border-primary">
                                                    <div class="flex items-center justify-between mb-4">
                                                        <h4 class="font-bold">"Write Your Review"</h4>
                                                        <button
                                                            class="text-secondary hover:text-primary text-xs"
                                                            on:click=move |_| set_show_review_modal.set(false)
                                                        >
                                                            "✕ Close"
                                                        </button>
                                                    </div>
                                                    <Show when=move || !review_error.get().is_empty()>
                                                        <div class="alert alert-error mb-4">
                                                            {move || review_error.get()}
                                                        </div>
                                                    </Show>
                                                    <form on:submit=on_submit_review class="space-y-4">
                                                        <div>
                                                            <label class="form-label text-xs">"Your Rating"</label>
                                                            <div class="mt-1">
                                                                <StarRating
                                                                    rating=rating_input.get() as f64
                                                                    interactive=true
                                                                    on_select=Callback::new(move |val| set_rating_input.set(val))
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label class="form-label text-xs">"Comment"</label>
                                                            <textarea
                                                                class="form-textarea w-full h-20 text-sm"
                                                                placeholder="Share your experience using this item..."
                                                                prop:value=move || comment_input.get()
                                                                on:input=move |ev| set_comment_input.set(event_target_value(&ev))
                                                                required
                                                            />
                                                        </div>
                                                        <div class="flex justify-end space-x-2">
                                                            <button
                                                                type="submit"
                                                                class="btn btn-primary btn-sm"
                                                                disabled=move || submitting_review.get()
                                                            >
                                                                {move || if submitting_review.get() { "Submitting..." } else { "Post Review" }}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </Show>

                                            <Suspense fallback=move || view! { <div class="text-tertiary text-sm">"Loading reviews..."</div> }>
                                                {move || reviews_resource.get().map(|res| match res {
                                                    Ok(page) => {
                                                        if page.items.is_empty() {
                                                            view! {
                                                                <div class="py-6 text-center text-secondary text-sm">
                                                                    "No reviews yet. Be the first to leave one after purchasing!"
                                                                </div>
                                                            }.into_any()
                                                        } else {
                                                            view! {
                                                                <div class="space-y-4">
                                                                    {page.items.into_iter().map(|item| {
                                                                        view! { <ReviewCard review=item /> }
                                                                    }).collect::<Vec<_>>()}
                                                                </div>
                                                            }.into_any()
                                                        }
                                                    },
                                                    Err(e) => view! { <div class="text-error text-sm">{e.to_string()}</div> }.into_any(),
                                                })}
                                            </Suspense>
                                        </div>

                                        <div class="card p-6 mt-8">
                                            <div class="flex items-center justify-between mb-4">
                                                <div>
                                                    <h2 class="text-xl font-bold">"💬 Community & Q&A"</h2>
                                                    <p class="text-xs text-secondary">"Ask questions about this listing or discuss fine-tuning and benchmarks."</p>
                                                </div>
                                                <a href="/community/new" class="btn btn-secondary btn-xs">
                                                    "＋ Start Discussion"
                                                </a>
                                            </div>

                                            <div class="pt-2">
                                                <a href="/community" class="text-sm font-semibold text-primary hover:underline">
                                                    "View all Q&A threads in the community forum →"
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <aside class="sidebar space-y-6">
                                        <div class="price-card">
                                            <div class="text-3xl font-bold mb-2">
                                                {if listing.price_cents == 0 {
                                                    "Free".to_string()
                                                } else {
                                                    format!("${:.2}", listing.price_cents as f64 / 100.0)
                                                }}
                                            </div>
                                            <div class="text-sm text-secondary mb-6">"License: "{format!("{:?}", listing.license)}</div>
                                            
                                            <Show when=move || !buy_error.get().is_empty()>
                                                <div class="alert alert-error text-xs mb-4">
                                                    {move || buy_error.get()}
                                                </div>
                                            </Show>

                                            {if is_owner {
                                                view! {
                                                    <div class="p-4 rounded-lg bg-card-hover text-secondary text-sm">
                                                        "You are the creator of this listing."
                                                    </div>
                                                }.into_any()
                                            } else {
                                                let id_clone = listing_id_str.clone();
                                                let nav = navigate.clone();
                                                view! {
                                                    <button
                                                        class="btn btn-primary w-full"
                                                        disabled=move || buying.get()
                                                        on:click=move |_| {
                                                            let id_val = id_clone.clone();
                                                            let nav_fn = nav.clone();
                                                            set_buying.set(true);
                                                            set_buy_error.set(String::new());
                                                            leptos::task::spawn_local(async move {
                                                                match create_checkout_session(id_val).await {
                                                                    Ok(url) => {
                                                                        nav_fn(&url, Default::default());
                                                                    }
                                                                    Err(e) => {
                                                                        set_buy_error.set(e.to_string());
                                                                    }
                                                                }
                                                                set_buying.set(false);
                                                            });
                                                        }
                                                    >
                                                        {move || if buying.get() { "Processing..." } else { "Buy Now" }}
                                                    </button>
                                                }.into_any()
                                            }}
                                        </div>

                                        <Suspense fallback=move || view! { <div class="card p-6 text-center text-sm text-tertiary">"Loading seller..."</div> }>
                                            {move || seller_resource.get().map(|s_res| match s_res {
                                                Ok(seller) => {
                                                    let profile_url = format!("/profile/{}", seller.username);
                                                    view! {
                                                        <div class="seller-card">
                                                            <h3 class="text-sm font-semibold text-secondary uppercase tracking-wider mb-4 pb-2 border-b border-border">"Created By"</h3>
                                                            <a href=profile_url class="flex items-center gap-4 group">
                                                                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                                                                    {if let Some(avatar) = seller.avatar_url {
                                                                        view! { <img src=avatar class="w-full h-full object-cover" /> }.into_any()
                                                                    } else {
                                                                        view! { {seller.username.chars().next().unwrap_or('?').to_uppercase().to_string()} }.into_any()
                                                                    }}
                                                                </div>
                                                                <div>
                                                                    <div class="font-bold group-hover:text-primary transition-colors">
                                                                        {seller.display_name.unwrap_or(seller.username.clone())}
                                                                    </div>
                                                                    <div class="text-sm text-secondary">
                                                                        {format!("@{}", seller.username)}
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        </div>
                                                    }.into_any()
                                                },
                                                Err(_) => view! { <div class="text-error text-sm">"Seller not found"</div> }.into_any(),
                                            })}
                                        </Suspense>
                                    </aside>
                                </div>
                            }.into_any()
                        },
                        Err(e) => view! { <div class="alert alert-error text-center py-20">{e.to_string()}</div> }.into_any(),
                    })
                }}
            </Suspense>
        </div>
    }
}
