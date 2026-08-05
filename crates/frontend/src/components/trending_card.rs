use leptos::prelude::*;
use bin_bag_core::models::trending::TrendingLeaderboardItem;
use crate::components::type_badge::TypeBadge;

#[component]
pub fn TrendingCard(
    item: TrendingLeaderboardItem,
) -> impl IntoView {
    let rank = item.rank;
    let rank_change_str = item.format_rank_change();
    let is_new = item.is_new();
    let rank_change = item.rank_change;

    let listing = item.listing.clone();
    let listing_id_str = listing.id.to_string();
    let title = listing.title.clone();
    let description = listing.description.clone();
    let listing_type = listing.listing_type;
    let category = listing.category.clone();
    let price_cents = listing.price_cents;

    let seller_username = item.seller_username.clone();
    let rating_avg = listing.rating_avg;
    let review_count = listing.review_count;

    let rank_badge_class = match rank {
        1 => "w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-extrabold flex items-center justify-center shadow-lg shadow-amber-500/20 text-base",
        2 => "w-9 h-9 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 font-extrabold flex items-center justify-center shadow-md text-base",
        3 => "w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-extrabold flex items-center justify-center shadow-md text-base",
        _ => "w-9 h-9 rounded-xl bg-card border border-border text-foreground font-bold flex items-center justify-center text-sm",
    };

    let change_badge_class = if is_new {
        "px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
    } else if rank_change > 0 {
        "px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
    } else if rank_change < 0 {
        "px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30"
    } else {
        "px-2 py-0.5 text-xs font-medium rounded-full bg-muted/20 text-muted border border-border/50"
    };

    let price_display = if price_cents == 0 {
        "Free".to_string()
    } else {
        format!("${:.2}", price_cents as f64 / 100.0)
    };

    let rating_display = match rating_avg {
        Some(r) => format!("{:.1} ★ ({})", r, review_count),
        None => "No reviews yet".to_string(),
    };

    view! {
        <div class="trending-card card p-4 hover:border-primary/50 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-4 flex-1">
                <div class="flex flex-col items-center gap-1.5 min-w-[56px]">
                    <span class=rank_badge_class>
                        {format!("#{}", rank)}
                    </span>
                    <span class=change_badge_class>
                        {rank_change_str}
                    </span>
                </div>

                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <a
                            href=format!("/listings/{}", listing_id_str)
                            class="text-lg font-bold text-foreground hover:text-primary transition-colors"
                        >
                            {title}
                        </a>
                        <TypeBadge listing_type=listing_type />
                        <span class="text-xs px-2 py-0.5 rounded bg-muted/30 text-muted">
                            {category}
                        </span>
                    </div>

                    <p class="text-sm text-muted line-clamp-1 mb-2">
                        {description}
                    </p>

                    <div class="flex items-center gap-4 text-xs text-muted">
                        <span>
                            "by "
                            <a
                                href=format!("/profile/{}", seller_username.clone())
                                class="text-foreground hover:underline font-medium"
                            >
                                {seller_username.clone()}
                            </a>
                        </span>
                        <span>"•"</span>
                        <span class="text-amber-400 font-medium">{rating_display}</span>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/50">
                <div class="text-right">
                    <span class="text-xs text-muted block">"Price"</span>
                    <span class="text-base font-bold text-foreground">{price_display}</span>
                </div>

                <a
                    href=format!("/listings/{}", listing_id_str)
                    class="btn btn-sm btn-outline hover:btn-primary transition-all flex items-center gap-1"
                >
                    <span>"View Asset"</span>
                    <span>"→"</span>
                </a>
            </div>
        </div>
    }
}
