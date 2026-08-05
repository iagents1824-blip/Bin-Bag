//! RoleBadge component — colored badge for user role.

use leptos::prelude::*;
use bin_bag_core::models::user::UserRole;

#[component]
pub fn RoleBadge(role: UserRole) -> impl IntoView {
    let (label, class) = match role {
        UserRole::Buyer => ("Buyer", "badge badge-buyer"),
        UserRole::Seller => ("Seller", "badge badge-seller"),
        UserRole::Expert => ("Expert", "badge badge-expert"),
        UserRole::Admin => ("Admin", "badge badge-admin"),
    };

    view! {
        <span class=class>{label}</span>
    }
}
