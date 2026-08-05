use leptos::prelude::*;
use leptos_router::hooks::use_query_map;
use bin_bag_core::models::search::{SearchQuery, SearchResultItem};
use crate::server_fns::search::global_search;

#[component]
pub fn SearchPage() -> impl IntoView {
    let query_map = use_query_map();
    let (active_tab, set_active_tab) = signal("all".to_string());

    let search_res = Resource::new(
        move || (
            query_map.get().get("q").unwrap_or_default(),
            active_tab.get(),
        ),
        move |(q_val, tab)| async move {
            global_search(SearchQuery {
                q: q_val,
                content_type: if tab == "all" { None } else { Some(tab.clone()) },
                limit: Some(40),
                ..Default::default()
            })
            .await
        },
    );

    let tab_class = move |tab_name: &str| {
        if active_tab.get() == tab_name {
            "px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg transition"
        } else {
            "px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        }
    };

    view! {
        <div class="container py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-extrabold text-white tracking-tight">
                    "Search Results"
                </h1>
                <p class="text-slate-400 text-sm mt-1">
                    "Search across AI models, prompts, community discussions, and daily news"
                </p>
            </div>

            <div class="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-6">
                <button class=move || tab_class("all") on:click=move |_| set_active_tab.set("all".to_string())>
                    "All Content"
                </button>
                <button class=move || tab_class("listings") on:click=move |_| set_active_tab.set("listings".to_string())>
                    "📦 Listings"
                </button>
                <button class=move || tab_class("threads") on:click=move |_| set_active_tab.set("threads".to_string())>
                    "💬 Discussions"
                </button>
                <button class=move || tab_class("news") on:click=move |_| set_active_tab.set("news".to_string())>
                    "📰 News"
                </button>
            </div>

            <Suspense fallback=move || view! {
                <div class="py-16 text-center text-slate-400">
                    "Searching across AI marketplace..."
                </div>
            }>
                {move || {
                    search_res.get().map(|res| match res {
                        Ok(data) => {
                            let items = data.items.clone();
                            let count = data.total_count;
                            if items.is_empty() {
                                view! {
                                    <div class="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
                                        <p class="text-xl font-semibold text-white mb-2">"No results found"</p>
                                        <p class="text-sm text-slate-400">
                                            "We couldn't find anything matching your search. Try adjusting your query or filter tabs."
                                        </p>
                                    </div>
                                }.into_any()
                            } else {
                                view! {
                                    <div>
                                        <div class="flex items-center justify-between mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <span>{format!("Found {} total items", count)}</span>
                                            <span class="space-x-4">
                                                <span>{format!("{} listings", data.listings_count)}</span>
                                                <span>"•"</span>
                                                <span>{format!("{} discussions", data.threads_count)}</span>
                                                <span>"•"</span>
                                                <span>{format!("{} news", data.news_count)}</span>
                                            </span>
                                        </div>

                                        <div class="space-y-6">
                                            <For
                                                each=move || items.clone()
                                                key=|item| match item {
                                                    SearchResultItem::Listing(l) => l.id.to_string(),
                                                    SearchResultItem::Thread(t) => t.thread.id.to_string(),
                                                    SearchResultItem::News(n) => n.id.to_string(),
                                                }
                                                let:item
                                            >
                                                {
                                                    let item_clone = item.clone();
                                                    view! {
                                                        <div>
                                                            {match item_clone {
                                                                SearchResultItem::Listing(l) => view! {
                                                                    <div class="mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">"Marketplace Listing"</div>
                                                                    <crate::components::listing_card::ListingCard listing=l />
                                                                }.into_any(),
                                                                SearchResultItem::Thread(tw) => view! {
                                                                    <div class="mb-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">"Community Discussion"</div>
                                                                    <div class="p-5 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition">
                                                                        <div class="flex items-center justify-between mb-2">
                                                                            <span class="text-xs text-slate-400">
                                                                                {format!("By @{} • {} replies • {} upvotes", tw.author_username, tw.reply_count, tw.thread.upvote_count)}
                                                                            </span>
                                                                            <span class="text-xs text-indigo-400 font-semibold">{tw.thread.thread_type.to_string()}</span>
                                                                        </div>
                                                                        <h3 class="text-lg font-bold text-white hover:text-indigo-400 transition">
                                                                            <a href=format!("/community/thread/{}", tw.thread.id)>{tw.thread.title.clone()}</a>
                                                                        </h3>
                                                                        <p class="text-sm text-slate-300 mt-1 line-clamp-2">{tw.thread.content.clone()}</p>
                                                                    </div>
                                                                }.into_any(),
                                                                SearchResultItem::News(n) => view! {
                                                                    <div class="mb-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">"AI News & Insight"</div>
                                                                    <crate::components::news_card::NewsCard article=n />
                                                                }.into_any(),
                                                            }}
                                                        </div>
                                                    }
                                                }
                                            </For>
                                        </div>
                                    </div>
                                }.into_any()
                            }
                        },
                        Err(e) => view! {
                            <div class="p-6 bg-red-950/40 border border-red-800 rounded-xl text-red-300">
                                {format!("Search error: {}", e)}
                            </div>
                        }.into_any(),
                    })
                }}
            </Suspense>
        </div>
    }
}
