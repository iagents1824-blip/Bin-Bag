//! SVG line chart component for daily revenue visualization.

use leptos::prelude::*;
use crate::server_fns::orders::DailyRevenue;

#[component]
pub fn RevenueChart(data: Vec<DailyRevenue>) -> impl IntoView {
    if data.is_empty() {
        return view! {
            <div class="chart-container">
                <div class="p-8 text-center text-secondary">"No revenue data available yet."</div>
            </div>
        }.into_any();
    }

    let chart_w: f64 = 700.0;
    let chart_h: f64 = 220.0;
    let pad_left: f64 = 55.0;
    let pad_right: f64 = 15.0;
    let pad_top: f64 = 20.0;
    let pad_bottom: f64 = 35.0;
    let inner_w = chart_w - pad_left - pad_right;
    let inner_h = chart_h - pad_top - pad_bottom;

    let max_rev = data.iter().map(|d| d.revenue_cents).max().unwrap_or(100).max(100);
    let n = data.len();
    let step_x = if n > 1 { inner_w / (n as f64 - 1.0) } else { inner_w };

    // Build polyline points
    let mut line_points = String::new();
    let mut area_points = String::new();
    let mut dots: Vec<(f64, f64, String, i64)> = Vec::new();

    for (i, d) in data.iter().enumerate() {
        let x = pad_left + (i as f64) * step_x;
        let y = pad_top + inner_h - (d.revenue_cents as f64 / max_rev as f64 * inner_h);
        line_points.push_str(&format!("{:.1},{:.1} ", x, y));
        if i == 0 {
            area_points.push_str(&format!("{:.1},{:.1} ", pad_left, pad_top + inner_h));
        }
        area_points.push_str(&format!("{:.1},{:.1} ", x, y));
        // Short date label (e.g. "Aug 01")
        let label = if d.date.len() >= 10 {
            let parts: Vec<&str> = d.date.split('-').collect();
            if parts.len() == 3 {
                let month = match parts[1] {
                    "01" => "Jan", "02" => "Feb", "03" => "Mar", "04" => "Apr",
                    "05" => "May", "06" => "Jun", "07" => "Jul", "08" => "Aug",
                    "09" => "Sep", "10" => "Oct", "11" => "Nov", "12" => "Dec",
                    _ => parts[1],
                };
                format!("{} {}", month, parts[2])
            } else {
                d.date.clone()
            }
        } else {
            d.date.clone()
        };
        dots.push((x, y, label, d.revenue_cents));
    }
    // Close area polygon
    area_points.push_str(&format!("{:.1},{:.1}", pad_left + (n as f64 - 1.0) * step_x, pad_top + inner_h));

    // Y-axis labels (5 ticks)
    let y_ticks: Vec<(f64, String)> = (0..=4).map(|i| {
        let frac = i as f64 / 4.0;
        let val = (max_rev as f64 * frac) / 100.0;
        let y = pad_top + inner_h - (frac * inner_h);
        (y, format!("${:.0}", val))
    }).collect();

    // X-axis labels (show every other label to avoid crowding)
    let x_labels: Vec<(f64, String)> = dots.iter().enumerate()
        .filter(|(i, _)| n <= 7 || i % 2 == 0 || *i == n - 1)
        .map(|(_, (x, _, label, _))| (*x, label.clone()))
        .collect();

    let total_period_rev = data.iter().map(|d| d.revenue_cents).sum::<i64>();
    let total_period_orders: i64 = data.iter().map(|d| d.order_count).sum();

    view! {
        <div class="chart-container">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="text-lg font-bold text-primary">"📈 Revenue — Last 14 Days"</h3>
                    <p class="text-xs text-secondary mt-1">
                        "Period total: "
                        <span class="font-bold text-primary">{format!("${:.2}", total_period_rev as f64 / 100.0)}</span>
                        " across "
                        <span class="font-bold text-primary">{total_period_orders.to_string()}</span>
                        " orders"
                    </p>
                </div>
            </div>
            <svg
                viewBox=format!("0 0 {} {}", chart_w, chart_h)
                class="w-full"
                style="max-height: 260px;"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(99,102,241,0.4)" />
                        <stop offset="100%" stop-color="rgba(99,102,241,0.02)" />
                    </linearGradient>
                </defs>

                // Grid lines
                {y_ticks.iter().map(|(y, _)| {
                    view! {
                        <line
                            x1=format!("{}", pad_left)
                            y1=format!("{:.1}", y)
                            x2=format!("{}", chart_w - pad_right)
                            y2=format!("{:.1}", y)
                            stroke="rgba(148,163,184,0.1)"
                            stroke-dasharray="4,4"
                        />
                    }
                }).collect::<Vec<_>>()}

                // Y-axis labels
                {y_ticks.iter().map(|(y, label)| {
                    view! {
                        <text
                            x=format!("{}", pad_left - 8.0)
                            y=format!("{:.1}", y + 4.0)
                            fill="#94a3b8"
                            font-size="10"
                            text-anchor="end"
                            font-family="var(--font-mono)"
                        >
                            {label.clone()}
                        </text>
                    }
                }).collect::<Vec<_>>()}

                // X-axis labels
                {x_labels.iter().map(|(x, label)| {
                    view! {
                        <text
                            x=format!("{:.1}", x)
                            y=format!("{}", chart_h - 5.0)
                            fill="#94a3b8"
                            font-size="9"
                            text-anchor="middle"
                            font-family="var(--font-mono)"
                        >
                            {label.clone()}
                        </text>
                    }
                }).collect::<Vec<_>>()}

                // Area fill
                <polygon
                    points=area_points
                    fill="url(#revGrad)"
                />

                // Line
                <polyline
                    points=line_points
                    fill="none"
                    stroke="#6366f1"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                // Dots with hover titles
                {dots.iter().map(|(x, y, label, rev)| {
                    let title_text = format!("{}: ${:.2}", label, *rev as f64 / 100.0);
                    view! {
                        <circle
                            cx=format!("{:.1}", x)
                            cy=format!("{:.1}", y)
                            r="4"
                            fill="#6366f1"
                            stroke="#0f172a"
                            stroke-width="2"
                            class="chart-dot"
                        >
                            <title>{title_text}</title>
                        </circle>
                    }
                }).collect::<Vec<_>>()}
            </svg>
        </div>
    }.into_any()
}
