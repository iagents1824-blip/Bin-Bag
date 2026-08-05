use leptos::prelude::*;
use crate::server_fns::orders::{get_seller_earnings, get_seller_orders, get_seller_analytics};
use crate::server_fns::listings::list_listings;
use crate::components::type_badge::TypeBadge;
use crate::components::revenue_chart::RevenueChart;
use crate::components::category_chart::CategoryChart;

#[component]
pub fn SellerDashboardPage() -> impl IntoView {
    // Auth guard for seller/admin
    let auth = expect_context::<crate::app::AuthContext>();
    Effect::new(move || {
        if auth.user.get().is_none() {
            let navigate = leptos_router::hooks::use_navigate();
            navigate("/login", Default::default());
        }
    });

    let earnings_res = Resource::new(
        || (),
        |_| async move { get_seller_earnings().await }
    );

    let sales_res = Resource::new(
        || (),
        |_| async move { get_seller_orders(None, Some(20)).await }
    );

    let listings_res = Resource::new(
        || (),
        |_| async move {
            list_listings(None, None, None, None, None, Some(50)).await
        }
    );

    let analytics_res = Resource::new(
        || (),
        |_| async move { get_seller_analytics().await }
    );

    view! {
        <div class="container mx-auto px-4 py-8 max-w-6xl">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-extrabold text-white tracking-tight">"Seller Dashboard"</h1>
                    <p class="text-gray-400 mt-1">"Manage your AI models, track earnings, and view order history."</p>
                </div>
                <a
                    href="/listings/new"
                    class="btn btn-primary px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform"
                >
                    "+ Create Listing"
                </a>
            </div>

            // Stat Cards Grid — 4 columns
            <div class="grid grid-4 mb-8" style="gap: var(--space-6);">
                <div class="stat-card">
                    <span class="text-sm font-semibold text-secondary uppercase tracking-wider">"Total Earnings"</span>
                    <Suspense fallback=move || view! { <div class="text-3xl font-bold text-tertiary mt-2">"Loading..."</div> }>
                        {move || earnings_res.get().map(|res| match res {
                            Ok(summary) => {
                                let dollars = summary.total_earnings_cents as f64 / 100.0;
                                view! {
                                    <div class="text-4xl font-extrabold mt-2">
                                        {format!("${:.2}", dollars)}
                                    </div>
                                }.into_any()
                            },
                            Err(e) => view! { <div class="text-error mt-2">{e.to_string()}</div> }.into_any(),
                        })}
                    </Suspense>
                </div>

                <div class="stat-card">
                    <span class="text-sm font-semibold text-secondary uppercase tracking-wider">"Completed Sales"</span>
                    <Suspense fallback=move || view! { <div class="text-3xl font-bold text-tertiary mt-2">"Loading..."</div> }>
                        {move || earnings_res.get().map(|res| match res {
                            Ok(summary) => {
                                view! {
                                    <div class="text-4xl font-extrabold mt-2">
                                        {summary.completed_orders_count.to_string()}
                                    </div>
                                }.into_any()
                            },
                            Err(e) => view! { <div class="text-error mt-2">{e.to_string()}</div> }.into_any(),
                        })}
                    </Suspense>
                </div>

                <div class="stat-card">
                    <span class="text-sm font-semibold text-secondary uppercase tracking-wider">"Conversion Rate"</span>
                    <Suspense fallback=move || view! { <div class="text-3xl font-bold text-tertiary mt-2">"Loading..."</div> }>
                        {move || analytics_res.get().map(|res| match res {
                            Ok(analytics) => {
                                view! {
                                    <div class="text-4xl font-extrabold mt-2">
                                        {format!("{:.1}%", analytics.conversion_rate_pct)}
                                    </div>
                                    <p class="text-xs text-secondary mt-1">
                                        {format!("{} listings", analytics.total_listings)}
                                    </p>
                                }.into_any()
                            },
                            Err(e) => view! { <div class="text-error mt-2">{e.to_string()}</div> }.into_any(),
                        })}
                    </Suspense>
                </div>

                <div class="stat-card">
                    <span class="text-sm font-semibold text-secondary uppercase tracking-wider">"Avg Order Value"</span>
                    <Suspense fallback=move || view! { <div class="text-3xl font-bold text-tertiary mt-2">"Loading..."</div> }>
                        {move || analytics_res.get().map(|res| match res {
                            Ok(analytics) => {
                                let avg = analytics.avg_order_value_cents as f64 / 100.0;
                                view! {
                                    <div class="text-4xl font-extrabold mt-2">
                                        {format!("${:.2}", avg)}
                                    </div>
                                }.into_any()
                            },
                            Err(e) => view! { <div class="text-error mt-2">{e.to_string()}</div> }.into_any(),
                        })}
                    </Suspense>
                </div>
            </div>

            // Analytics Charts
            <div class="grid grid-2 mb-8" style="gap: var(--space-6);">
                <Suspense fallback=move || view! { <div class="chart-container p-8 text-center text-tertiary">"Loading revenue chart..."</div> }>
                    {move || analytics_res.get().map(|res| match res {
                        Ok(analytics) => {
                            view! { <RevenueChart data=analytics.daily_revenue /> }.into_any()
                        },
                        Err(e) => view! { <div class="chart-container p-6 text-error">{e.to_string()}</div> }.into_any(),
                    })}
                </Suspense>

                <Suspense fallback=move || view! { <div class="chart-container p-8 text-center text-tertiary">"Loading category chart..."</div> }>
                    {move || analytics_res.get().map(|res| match res {
                        Ok(analytics) => {
                            view! { <CategoryChart data=analytics.category_breakdown /> }.into_any()
                        },
                        Err(e) => view! { <div class="chart-container p-6 text-error">{e.to_string()}</div> }.into_any(),
                    })}
                </Suspense>
            </div>

            // My Active Listings Section
            <div class="mb-8">
                <div class="section-header mb-4">
                    <h2 class="section-title">"My Listings"</h2>
                </div>
                <div class="card overflow-hidden">
                    <Suspense fallback=move || view! { <div class="p-6 text-tertiary">"Loading listings..."</div> }>
                        {move || {
                            listings_res.get().map(|res| match res {
                                Ok(page) => {
                                    if page.items.is_empty() {
                                        view! {
                                            <div class="p-8 text-center text-secondary">
                                                "You have no listings yet."
                                            </div>
                                        }.into_any()
                                    } else {
                                        view! {
                                            <table class="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>"Title"</th>
                                                        <th>"Type"</th>
                                                        <th>"Price"</th>
                                                        <th>"Status"</th>
                                                        <th class="text-right">"Actions"</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {page.items.into_iter().map(|item| {
                                                        let id = item.id.to_string();
                                                        let edit_url = format!("/listings/{}/edit", id);
                                                        let view_url = format!("/listings/{}", id);
                                                        let price_str = if item.price_cents == 0 {
                                                            "Free".to_string()
                                                        } else {
                                                            format!("${:.2}", item.price_cents as f64 / 100.0)
                                                        };
                                                        let status_badge = match item.status {
                                                            bin_bag_core::models::listing::ListingStatus::Active => "badge badge-success",
                                                            bin_bag_core::models::listing::ListingStatus::Draft => "badge badge-warning",
                                                            bin_bag_core::models::listing::ListingStatus::Delisted => "badge badge-error",
                                                        };
                                                        view! {
                                                            <tr>
                                                                <td class="font-medium">
                                                                    <a href=view_url class="hover:underline">{item.title}</a>
                                                                </td>
                                                                <td>
                                                                    <TypeBadge listing_type=item.listing_type />
                                                                </td>
                                                                <td class="font-semibold">{price_str}</td>
                                                                <td>
                                                                    <span class=status_badge>
                                                                        {item.status.to_string()}
                                                                    </span>
                                                                </td>
                                                                <td class="text-right space-x-3">
                                                                    <a href=edit_url class="text-sm text-link font-medium">"Edit"</a>
                                                                </td>
                                                            </tr>
                                                        }
                                                    }).collect::<Vec<_>>()}
                                                </tbody>
                                            </table>
                                        }.into_any()
                                    }
                                },
                                Err(e) => view! { <div class="p-6 text-error">{e.to_string()}</div> }.into_any(),
                            })
                        }}
                    </Suspense>
                </div>
            </div>

            // Recent Sales Table
            <div>
                <div class="section-header mb-4">
                    <h2 class="section-title">"Recent Sales"</h2>
                </div>
                <div class="card overflow-hidden">
                    <Suspense fallback=move || view! { <div class="p-6 text-tertiary">"Loading sales..."</div> }>
                        {move || {
                            sales_res.get().map(|res| match res {
                                Ok(page) => {
                                    if page.items.is_empty() {
                                        view! {
                                            <div class="p-8 text-center text-secondary">
                                                "No sales recorded yet."
                                            </div>
                                        }.into_any()
                                    } else {
                                        view! {
                                            <table class="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>"Date"</th>
                                                        <th>"Listing"</th>
                                                        <th>"Buyer"</th>
                                                        <th>"Amount"</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {page.items.into_iter().map(|item| {
                                                        let date_str = item.order.created_at.format("%b %d, %Y %H:%M").to_string();
                                                        let price_str = if item.order.price_cents == 0 {
                                                            "Free".to_string()
                                                        } else {
                                                            format!("${:.2}", item.order.price_cents as f64 / 100.0)
                                                        };
                                                        let buyer = item.buyer_username.unwrap_or_else(|| "Anonymous".to_string());
                                                        view! {
                                                            <tr>
                                                                <td class="text-sm text-secondary">{date_str}</td>
                                                                <td class="font-medium">{item.listing_title}</td>
                                                                <td>{buyer}</td>
                                                                <td class="font-semibold text-success">{price_str}</td>
                                                            </tr>
                                                        }
                                                    }).collect::<Vec<_>>()}
                                                </tbody>
                                            </table>
                                        }.into_any()
                                    }
                                },
                                Err(e) => view! { <div class="p-6 text-error">{e.to_string()}</div> }.into_any(),
                            })
                        }}
                    </Suspense>
                </div>
            </div>
        </div>
    }
}
