//! ListingCard component — card showing listing summary for grids.

use leptos::prelude::*;
use bin_bag_core::models::listing::ListingWithTags;
use crate::components::type_badge::TypeBadge;

#[component]
pub fn ListingCard(listing: ListingWithTags) -> impl IntoView {
    let price_display = if listing.price_cents == 0 {
        "Free".to_string()
    } else {
        format!("${:.2}", listing.price_cents as f64 / 100.0)
    };
    let price_class = if listing.price_cents == 0 {
        "listing-card-price free"
    } else {
        "listing-card-price paid"
    };
    let href = format!("/listings/{}", listing.id);
    let listing_type = listing.listing_type.clone();
    let tags = listing.tags.clone();

    view! {
        <a href=href class="listing-card">
            <div class="listing-card-header">
                <h3 class="listing-card-title">{listing.title}</h3>
                <TypeBadge listing_type=listing_type/>
            </div>
            <p class="listing-card-description">{listing.description}</p>
            <Show when={
                let tags = tags.clone();
                move || !tags.is_empty()
            }>
                <div class="listing-card-tags">
                    {
                        let tags = tags.clone();
                        tags.iter().map(|t| {
                            let t = t.clone();
                            view! { <span class="badge badge-tag">{t}</span> }
                        }).collect::<Vec<_>>()
                    }
                </div>
            </Show>
            <div class="listing-card-footer">
                <span class=price_class>{price_display}</span>
                <span class="listing-card-seller">{listing.category}</span>
            </div>
        </a>
    }
}
