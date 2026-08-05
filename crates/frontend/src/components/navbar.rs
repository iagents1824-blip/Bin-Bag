//! Navbar component — sticky top bar with logo, nav links, and auth state.

use leptos::prelude::*;
use crate::app::AuthContext;
use crate::server_fns::auth::logout;
use bin_bag_core::models::user::UserRole;

#[component]
pub fn Navbar() -> impl IntoView {
    let auth = expect_context::<AuthContext>();
    let (dropdown_open, set_dropdown_open) = signal(false);

    let on_logout = move |_| {
        set_dropdown_open.set(false);
        leptos::task::spawn_local(async move {
            let _ = logout().await;
            auth.set_user.set(None);
            let navigate = leptos_router::hooks::use_navigate();
            navigate("/", Default::default());
        });
    };

    let toggle_dropdown = move |_| {
        set_dropdown_open.update(|v| *v = !*v);
    };

    view! {
        <nav class="navbar">
            <div class="container navbar-inner">
                <a href="/" class="navbar-logo" style="display: flex; align-items: center; gap: 8px;">
                    <img src="/logo.jpg" alt="Bin Bag Logo" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                    <span>"Bin Bag"</span>
                </a>

                <div class="navbar-links flex items-center space-x-6">
                    <a href="/listings" class="navbar-link">"Browse"</a>
                    <a href="/trending" class="navbar-link">"Trending"</a>
                    <a href="/news" class="navbar-link">"News"</a>
                    <a href="/community" class="navbar-link">"Community"</a>
                </div>

                <div class="hidden lg:flex items-center mx-4">
                    <crate::components::search_bar::SearchBar />
                </div>

                <div class="navbar-actions">
                    {move || {
                        if let Some(user) = auth.user.get() {
                            let initial = user.username.chars().next().unwrap_or('?').to_uppercase().to_string();
                            let username = user.username.clone();
                            let is_seller = user.role == UserRole::Seller || user.role == UserRole::Admin;
                            let is_admin = user.role == UserRole::Admin;
                            view! {
                                <div class="navbar-user flex items-center space-x-2">
                                    <crate::components::notification_bell::NotificationBell />
                                    <button class="navbar-avatar" on:click=toggle_dropdown type="button">
                                        {initial}
                                    </button>
                                    <span class="navbar-username" style="cursor: pointer;" on:click=toggle_dropdown>
                                        {username.clone()}
                                    </span>

                                    <div class=move || {
                                        if dropdown_open.get() { "navbar-dropdown open" } else { "navbar-dropdown" }
                                    }>
                                        <a href=format!("/u/{}", username) class="navbar-dropdown-item"
                                            on:click=move |_| set_dropdown_open.set(false)>
                                            "👤 Profile"
                                        </a>
                                        <a href="/orders" class="navbar-dropdown-item"
                                            on:click=move |_| set_dropdown_open.set(false)>
                                            "🛍️ My Orders"
                                        </a>
                                        <a href="/settings" class="navbar-dropdown-item"
                                            on:click=move |_| set_dropdown_open.set(false)>
                                            "⚙️ Settings"
                                        </a>
                                        <a href="/apply-expert" class="navbar-dropdown-item"
                                            on:click=move |_| set_dropdown_open.set(false)>
                                            "🎖️ Apply for Expert"
                                        </a>
                                        <Show when=move || is_seller>
                                            <a href="/dashboard" class="navbar-dropdown-item"
                                                on:click=move |_| set_dropdown_open.set(false)>
                                                "📊 Dashboard"
                                            </a>
                                            <a href="/listings/new" class="navbar-dropdown-item"
                                                on:click=move |_| set_dropdown_open.set(false)>
                                                "➕ New Listing"
                                            </a>
                                        </Show>
                                        <Show when=move || is_admin>
                                            <a href="/admin" class="navbar-dropdown-item text-indigo-400 font-semibold"
                                                on:click=move |_| set_dropdown_open.set(false)>
                                                "🛡️ Admin Panel"
                                            </a>
                                        </Show>
                                        <div class="navbar-dropdown-divider"></div>
                                        <button class="navbar-dropdown-item" on:click=on_logout type="button">
                                            "🚪 Log Out"
                                        </button>
                                    </div>
                                </div>
                            }.into_any()
                        } else {
                            view! {
                                <a href="/login" class="btn btn-ghost">"Log In"</a>
                                <a href="/signup" class="btn btn-primary btn-sm">"Sign Up"</a>
                            }.into_any()
                        }
                    }}
                </div>

                <button class="navbar-mobile-toggle" type="button">"☰"</button>
            </div>
        </nav>
    }
}
