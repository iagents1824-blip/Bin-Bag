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
        <div class="bg-slate-900 text-white text-[10px] md:text-xs py-2 px-4 flex justify-between items-center font-light tracking-wide">
            <span class="hidden md:inline">"Global Model Coverage 99.9% Uptime"</span>
            <div class="mx-auto md:mx-0 flex gap-6">
                <span>"Summer Infrastructure Sale: 40% Off API Credits"</span>
                <span class="hidden sm:inline">"|"</span>
                <span class="hidden sm:inline">"Limited Time Enterprise Trial"</span>
            </div>
            <span class="hidden md:inline">"Support: 24/7 Priority"</span>
        </div>

        <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <a href="/" class="text-xl font-bold tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="/logo.jpg" alt="Bin Bag Logo" class="w-6 h-6 rounded-sm object-cover" />
                    "BINBAG"
                </a>
                
                <ul class="hidden lg:flex gap-8 text-sm font-medium text-slate-600">
                    <li><a href="/listings" class="hover:text-black transition-colors">"Browse"</a></li>
                    <li><a href="/trending" class="hover:text-black transition-colors">"Trending"</a></li>
                    <li><a href="/news" class="hover:text-black transition-colors">"News"</a></li>
                    <li><a href="/community" class="hover:text-black transition-colors">"Community"</a></li>
                </ul>

                <div class="flex items-center gap-5">
                    <div class="hidden lg:flex items-center">
                        <crate::components::search_bar::SearchBar />
                    </div>

                    {move || {
                        if let Some(user) = auth.user.get() {
                            let initial = user.username.chars().next().unwrap_or('?').to_uppercase().to_string();
                            let username = user.username.clone();
                            let is_seller = user.role == UserRole::Seller || user.role == UserRole::Admin;
                            let is_admin = user.role == UserRole::Admin;
                            view! {
                                <div class="flex items-center space-x-4 relative">
                                    <crate::components::notification_bell::NotificationBell />
                                    
                                    <button class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-200 transition-colors" on:click=toggle_dropdown type="button">
                                        {initial}
                                    </button>

                                    <div class=move || {
                                        if dropdown_open.get() {
                                            "absolute top-10 right-0 w-48 bg-white border border-slate-100 shadow-xl rounded-lg py-2 flex flex-col z-50 transition-opacity opacity-100 visible"
                                        } else {
                                            "absolute top-10 right-0 w-48 bg-white border border-slate-100 shadow-xl rounded-lg py-2 flex flex-col z-50 transition-opacity opacity-0 invisible"
                                        }
                                    }>
                                        <div class="px-4 py-2 border-b border-slate-100 mb-1">
                                            <p class="text-xs text-slate-400">"Signed in as"</p>
                                            <p class="text-sm font-bold text-slate-900 truncate">{username.clone()}</p>
                                        </div>
                                        <a href=format!("/u/{}", username) class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" on:click=move |_| set_dropdown_open.set(false)>
                                            "Profile"
                                        </a>
                                        <a href="/orders" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" on:click=move |_| set_dropdown_open.set(false)>
                                            "My Orders"
                                        </a>
                                        <a href="/settings" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" on:click=move |_| set_dropdown_open.set(false)>
                                            "Settings"
                                        </a>
                                        <Show when=move || is_seller>
                                            <a href="/dashboard" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" on:click=move |_| set_dropdown_open.set(false)>
                                                "Dashboard"
                                            </a>
                                            <a href="/listings/new" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" on:click=move |_| set_dropdown_open.set(false)>
                                                "New Listing"
                                            </a>
                                        </Show>
                                        <Show when=move || is_admin>
                                            <a href="/admin" class="px-4 py-2 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors" on:click=move |_| set_dropdown_open.set(false)>
                                                "Admin Panel"
                                            </a>
                                        </Show>
                                        <div class="border-t border-slate-100 mt-1 pt-1"></div>
                                        <button class="px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors" on:click=on_logout type="button">
                                            "Log Out"
                                        </button>
                                    </div>
                                </div>
                            }.into_any()
                        } else {
                            view! {
                                <a href="/login" class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">"Log In"</a>
                                <a href="/signup" class="bg-slate-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                                    "Sign Up"
                                </a>
                            }.into_any()
                        }
                    }}
                </div>
            </div>
        </nav>
    }
}
