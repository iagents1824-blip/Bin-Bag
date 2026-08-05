use leptos::prelude::*;
use crate::components::analytics_card::AnalyticsCard;
use crate::server_fns::admin::{
    get_platform_analytics, list_expert_applications, review_expert_application,
};

#[component]
pub fn AdminPage() -> impl IntoView {
    let (active_tab, set_active_tab) = signal("overview".to_string());
    let (status_filter, set_status_filter) = signal("pending".to_string());
    let (action_message, set_action_message) = signal(Option::<String>::None);

    let analytics_res = Resource::new(move || (), |_| async move { get_platform_analytics().await });
    let apps_res = Resource::new(
        move || (status_filter.get(), action_message.get()),
        move |(filter, _)| async move { list_expert_applications(Some(filter)).await },
    );

    let tab_class = move |tab_name: &str| {
        if active_tab.get() == tab_name {
            "px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg transition"
        } else {
            "px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        }
    };

    let on_review = move |id: String, approve: bool| {
        leptos::task::spawn_local(async move {
            match review_expert_application(id, approve, None).await {
                Ok(ea) => {
                    let status = if approve { "approved" } else { "rejected" };
                    set_action_message.set(Some(format!(
                        "Application for {} was {}.",
                        ea.expertise_area, status
                    )));
                }
                Err(e) => {
                    set_action_message.set(Some(format!("Error: {}", e)));
                }
            }
        });
    };

    view! {
        <div class="container py-8">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-extrabold text-white tracking-tight">
                        "🛡️ Platform Admin Panel"
                    </h1>
                    <p class="text-slate-400 text-sm mt-1">
                        "System metrics, expert verifications, and content moderation"
                    </p>
                </div>
            </div>

            <div class="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-8">
                <button class=move || tab_class("overview") on:click=move |_| set_active_tab.set("overview".to_string())>
                    "📊 Overview & Analytics"
                </button>
                <button class=move || tab_class("experts") on:click=move |_| set_active_tab.set("experts".to_string())>
                    "🎖️ Expert Applications"
                </button>
            </div>

            {move || {
                if let Some(msg) = action_message.get() {
                    view! {
                        <div class="mb-6 p-4 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-sm flex items-center justify-between">
                            <span>{msg}</span>
                            <button class="text-xs text-indigo-400 hover:text-white" on:click=move |_| set_action_message.set(None)>
                                "Dismiss"
                            </button>
                        </div>
                    }.into_any()
                } else {
                    view! { <span></span> }.into_any()
                }
            }}

            <Show when=move || active_tab.get() == "overview">
                <Suspense fallback=move || view! { <div class="py-12 text-center text-slate-400">"Loading platform analytics..."</div> }>
                    {move || {
                        analytics_res.get().map(|res| match res {
                            Ok(stats) => {
                                let gmv_dollars = format!("${:.2}", stats.total_gmv_cents as f64 / 100.0);
                                let users_sub = format!("+{} in last 7 days", stats.new_users_7d);
                                let gmv_sub = format!("+${:.2} in last 7 days", stats.gmv_7d_cents as f64 / 100.0);
                                view! {
                                    <div class="space-y-8">
                                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <AnalyticsCard
                                                title="Total GMV".to_string()
                                                value=gmv_dollars
                                                subtitle=gmv_sub
                                                icon="💰"
                                                is_currency=true
                                            />
                                            <AnalyticsCard
                                                title="Total Users".to_string()
                                                value=stats.total_users.to_string()
                                                subtitle=users_sub
                                                icon="👥"
                                                is_currency=false
                                            />
                                            <AnalyticsCard
                                                title="Active Sellers".to_string()
                                                value=stats.total_sellers.to_string()
                                                subtitle=format!("{} verified experts", stats.total_experts)
                                                icon="🏪"
                                                is_currency=false
                                            />
                                            <AnalyticsCard
                                                title="Completed Orders".to_string()
                                                value=stats.total_orders.to_string()
                                                subtitle=format!("+{} this week", stats.completed_orders_7d)
                                                icon="🛍️"
                                                is_currency=false
                                            />
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <AnalyticsCard
                                                title="Active Listings".to_string()
                                                value=stats.active_listings.to_string()
                                                subtitle=format!("{} total listings", stats.total_listings)
                                                icon="📦"
                                                is_currency=false
                                            />
                                            <AnalyticsCard
                                                title="Community Discussions".to_string()
                                                value=stats.total_threads.to_string()
                                                subtitle=format!("{} expert answers", stats.expert_answers)
                                                icon="💬"
                                                is_currency=false
                                            />
                                            <AnalyticsCard
                                                title="Indexed News Articles".to_string()
                                                value=stats.total_news_articles.to_string()
                                                subtitle="Daily auto-scraper active".to_string()
                                                icon="📰"
                                                is_currency=false
                                            />
                                        </div>
                                    </div>
                                }.into_any()
                            },
                            Err(e) => view! {
                                <div class="p-6 bg-red-950/40 border border-red-800 rounded-xl text-red-300">
                                    {format!("Failed to load analytics: {}", e)}
                                </div>
                            }.into_any(),
                        })
                    }}
                </Suspense>
            </Show>

            <Show when=move || active_tab.get() == "experts">
                <div class="space-y-6">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-slate-400">"Filter by Status:"</span>
                        <select
                            class="form-select text-sm bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                            on:change=move |ev| set_status_filter.set(event_target_value(&ev))
                        >
                            <option value="pending" selected>"Pending Review"</option>
                            <option value="approved">"Approved"</option>
                            <option value="rejected">"Rejected"</option>
                            <option value="all">"All Applications"</option>
                        </select>
                    </div>

                    <Suspense fallback=move || view! { <div class="py-12 text-center text-slate-400">"Loading expert applications..."</div> }>
                        {move || {
                            apps_res.get().map(|res| match res {
                                Ok(apps) => {
                                    if apps.is_empty() {
                                        view! {
                                            <div class="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400">
                                                "No applications matching this filter."
                                            </div>
                                        }.into_any()
                                    } else {
                                        view! {
                                            <div class="space-y-4">
                                                <For
                                                    each=move || apps.clone()
                                                    key=|a| a.id.to_string()
                                                    let:app
                                                >
                                                    {
                                                        let app_id = app.id.to_string();
                                                        let is_pending = app.status == "pending";
                                                        let id_for_approve = app_id.clone();
                                                        let id_for_reject = app_id.clone();
                                                        view! {
                                                            <div class="p-6 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                <div>
                                                                    <div class="flex items-center space-x-3 mb-2">
                                                                        <span class="font-bold text-white text-lg">
                                                                            {app.display_name.clone().unwrap_or_else(|| app.username.clone())}
                                                                        </span>
                                                                        <span class="text-xs text-slate-400">
                                                                            {format!("(@{})", app.username)}
                                                                        </span>
                                                                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                                                                            {format!("Domain: {}", app.expertise_area)}
                                                                        </span>
                                                                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-slate-800 text-slate-300">
                                                                            {app.status.clone()}
                                                                        </span>
                                                                    </div>
                                                                    <p class="text-sm text-slate-300 mb-2">{app.statement.clone()}</p>
                                                                    {
                                                                        if let Some(cred) = app.credentials_url.clone() {
                                                                            view! {
                                                                                <a href=cred target="_blank" class="text-xs text-sky-400 hover:underline">
                                                                                    "🔗 View Verification Credentials / Profile"
                                                                                </a>
                                                                            }.into_any()
                                                                        } else {
                                                                            view! { <span></span> }.into_any()
                                                                        }
                                                                    }
                                                                </div>

                                                                <Show when=move || is_pending>
                                                                    {
                                                                        let id_for_approve = id_for_approve.clone();
                                                                        let id_for_reject = id_for_reject.clone();
                                                                        view! {
                                                                            <div class="flex items-center space-x-2 shrink-0">
                                                                                <button
                                                                                    class="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                                                                                    on:click=move |_| on_review(id_for_approve.clone(), true)
                                                                                >
                                                                                    "Approve Expert"
                                                                                </button>
                                                                                <button
                                                                                    class="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition"
                                                                                    on:click=move |_| on_review(id_for_reject.clone(), false)
                                                                                >
                                                                                    "Reject"
                                                                                </button>
                                                                            </div>
                                                                        }
                                                                    }
                                                                </Show>
                                                            </div>
                                                        }
                                                    }
                                                </For>
                                            </div>
                                        }.into_any()
                                    }
                                },
                                Err(e) => view! {
                                    <div class="p-6 bg-red-950/40 border border-red-800 rounded-xl text-red-300">
                                        {format!("Error loading applications: {}", e)}
                                    </div>
                                }.into_any(),
                            })
                        }}
                    </Suspense>
                </div>
            </Show>
        </div>
    }
}
