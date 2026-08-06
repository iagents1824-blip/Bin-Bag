use leptos::prelude::*;
use bin_bag_core::models::listing::ListingWithTags;

#[component]
pub fn ListingCard(listing: ListingWithTags) -> impl IntoView {
    let url = format!("/listings/{}", listing.id);
    let price_display = if listing.price_cents == 0 {
        "Free".to_string()
    } else {
        format!("${:.2}", listing.price_cents as f64 / 100.0)
    };

    let title = listing.title.clone();
    
    // Create a deterministic pseudo-random visual element based on the listing ID
    // Since we don't have images for listings, we use the geometric shapes from the design
    let type_label = format!("{:?}", listing.listing_type);

    view! {
        <a href=url class="group block">
            <div class="aspect-[4/5] bg-slate-100 mb-4 relative overflow-hidden flex items-center justify-center">
                <span class="absolute top-4 left-4 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-slate-900 shadow-sm z-10">
                    {type_label}
                </span>
                
                <div class="w-32 h-32 border-4 border-slate-200 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center relative z-0">
                    <div class="w-16 h-16 bg-slate-900 rounded-lg transform rotate-45"></div>
                </div>
                
                <div class="absolute bottom-4 left-4 right-4 bg-slate-900 text-white text-xs py-3 text-center translate-y-12 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100 uppercase font-bold tracking-widest z-10">
                    "View Asset"
                </div>
            </div>
            <div class="flex justify-between items-start mb-1">
                <h4 class="font-bold text-sm text-slate-900 truncate pr-2">{title}</h4>
                <span class="text-sm font-medium text-slate-900 shrink-0">{price_display}</span>
            </div>
            
            <div class="flex gap-1 mb-2 overflow-hidden flex-wrap">
                <For
                    each=move || listing.tags.clone()
                    key=|tag| tag.clone()
                    let:tag
                >
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        {tag}
                    </span>
                </For>
            </div>
            
            <div class="flex items-center gap-2">
                <div class="flex text-yellow-400 text-[10px]">"★★★★★"</div>
                <span class="text-[10px] text-slate-400">"(New)"</span>
            </div>
        </a>
    }
}
