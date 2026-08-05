//! TypeBadge component — colored badge for listing type.

use leptos::prelude::*;
use bin_bag_core::models::listing::ListingType;

#[component]
pub fn TypeBadge(listing_type: ListingType) -> impl IntoView {
    let (label, class) = match listing_type {
        ListingType::Model => ("Model", "badge badge-model"),
        ListingType::Chatbot => ("Chatbot", "badge badge-chatbot"),
        ListingType::Assistant => ("Assistant", "badge badge-assistant"),
        ListingType::Workflow => ("Workflow", "badge badge-workflow"),
        ListingType::Prompt => ("Prompt", "badge badge-prompt"),
        ListingType::Dataset => ("Dataset", "badge badge-dataset"),
    };

    view! {
        <span class=class>{label}</span>
    }
}
