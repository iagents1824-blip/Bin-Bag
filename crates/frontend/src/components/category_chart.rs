//! Horizontal bar chart component for category sales breakdown.

use leptos::prelude::*;
use crate::server_fns::orders::CategoryBreakdown;

/// Color palette for category bars.
fn category_color(idx: usize) -> &'static str {
    const COLORS: &[&str] = &[
        "#6366f1", // indigo
        "#8b5cf6", // violet
        "#06b6d4", // cyan
        "#10b981", // emerald
        "#f59e0b", // amber
        "#ef4444", // red
        "#ec4899", // pink
        "#3b82f6", // blue
    ];
    COLORS[idx % COLORS.len()]
}

/// Emoji icon for known listing categories.
fn category_icon(cat: &str) -> &'static str {
    match cat.to_lowercase().as_str() {
        "model" => "🤖",
        "chatbot" => "💬",
        "assistant" => "🧑‍💼",
        "workflow" => "⚙️",
        "prompt" => "✍️",
        "dataset" => "📊",
        _ => "📦",
    }
}

#[component]
pub fn CategoryChart(data: Vec<CategoryBreakdown>) -> impl IntoView {
    if data.is_empty() {
        return view! {
            <div class="chart-container">
                <div class="p-8 text-center text-secondary">"No category data available yet."</div>
            </div>
        }.into_any();
    }

    let max_sales = data.iter().map(|d| d.sales_count).max().unwrap_or(1).max(1);
    let total_sales: i64 = data.iter().map(|d| d.sales_count).sum();

    view! {
        <div class="chart-container">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="text-lg font-bold text-primary">"📊 Sales by Category"</h3>
                    <p class="text-xs text-secondary mt-1">
                        "Breakdown of " <span class="font-bold text-primary">{total_sales.to_string()}</span> " total sales by listing type"
                    </p>
                </div>
            </div>
            <div class="space-y-3">
                {data.into_iter().enumerate().map(|(idx, cat)| {
                    let pct = if total_sales > 0 {
                        (cat.sales_count as f64 / total_sales as f64 * 100.0)
                    } else {
                        0.0
                    };
                    let fill_width = format!("{}%", (cat.sales_count as f64 / max_sales as f64 * 100.0).max(4.0));
                    let color = category_color(idx);
                    let icon = category_icon(&cat.category);
                    let rev_str = format!("${:.2}", cat.revenue_cents as f64 / 100.0);

                    view! {
                        <div class="bar-chart-row">
                            <div class="bar-chart-label">
                                <span class="text-sm">{icon}</span>
                                <span class="text-sm font-semibold text-primary">{cat.category.clone()}</span>
                            </div>
                            <div class="bar-chart-track">
                                <div
                                    class="bar-fill"
                                    style=format!("width: {}; background: {};", fill_width, color)
                                ></div>
                            </div>
                            <div class="bar-chart-meta">
                                <span class="text-xs font-bold text-primary">{cat.sales_count.to_string()}</span>
                                <span class="text-xs text-secondary">{format!("({:.0}%)", pct)}</span>
                                <span class="text-xs text-secondary">{rev_str}</span>
                            </div>
                        </div>
                    }
                }).collect::<Vec<_>>()}
            </div>
        </div>
    }.into_any()
}
