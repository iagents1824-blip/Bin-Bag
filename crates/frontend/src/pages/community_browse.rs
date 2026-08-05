use leptos::prelude::*;
use crate::server_fns::community::list_threads;
use crate::components::upvote_button::UpvoteButton;
use crate::components::role_badge::RoleBadge;
use bin_bag_core::models::community::TopicTag;

#[component]
pub fn CommunityBrowse() -> impl IntoView {
    let (selected_type, set_selected_type) = signal(Option::<String>::None);
    let (selected_tag, set_selected_tag) = signal(Option::<String>::None);

    let threads_resource = Resource::new(
        move || (selected_type.get(), selected_tag.get()),
        |(t_type, tag)| async move {
            list_threads(t_type, None, tag, None, Some(30)).await
        },
    );

    view! {
        <div class="container py-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-3xl font-extrabold text-white">"Community & Expert Q&A"</h1>
                    <p class="text-gray-400 mt-1">
                        "Ask AI experts, discuss model fine-tuning, benchmarks, and accuracy."
                    </p>
                </div>
                <a
                    href="/community/new"
                    class="btn btn-primary inline-flex items-center space-x-2"
                >
                    <span>"＋ New Thread"</span>
                </a>
            </div>

            <div class="flex flex-wrap items-center gap-2 mb-6 p-4 bg-gray-900/60 border border-gray-800 rounded-2xl">
                <span class="text-xs font-semibold text-gray-400 mr-2">"Type:"</span>
                <button
                    type="button"
                    on:click=move |_| set_selected_type.set(None)
                    class=move || {
                        if selected_type.get().is_none() {
                            "px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white"
                        } else {
                            "px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 hover:text-white"
                        }
                    }
                >
                    "All"
                </button>
                <button
                    type="button"
                    on:click=move |_| set_selected_type.set(Some("qa".to_string()))
                    class=move || {
                        if selected_type.get().as_deref() == Some("qa") {
                            "px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white"
                        } else {
                            "px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 hover:text-white"
                        }
                    }
                >
                    "❓ Q&A"
                </button>
                <button
                    type="button"
                    on:click=move |_| set_selected_type.set(Some("general".to_string()))
                    class=move || {
                        if selected_type.get().as_deref() == Some("general") {
                            "px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white"
                        } else {
                            "px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 hover:text-white"
                        }
                    }
                >
                    "💬 General"
                </button>

                <span class="text-xs font-semibold text-gray-400 ml-4 mr-2">"Topic:"</span>
                <button
                    type="button"
                    on:click=move |_| set_selected_tag.set(None)
                    class=move || {
                        if selected_tag.get().is_none() {
                            "px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white"
                        } else {
                            "px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 hover:text-white"
                        }
                    }
                >
                    "All Topics"
                </button>
                {TopicTag::all().iter().map(|tag| {
                    let tag_str = tag.as_str().to_string();
                    let tag_name = tag.display_name().to_string();
                    let t_val = tag_str.clone();
                    view! {
                        <button
                            type="button"
                            on:click=move |_| set_selected_tag.set(Some(t_val.clone()))
                            class=move || {
                                if selected_tag.get().as_deref() == Some(&tag_str) {
                                    "px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white"
                                } else {
                                    "px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 hover:text-white"
                                }
                            }
                        >
                            {tag_name}
                        </button>
                    }
                }).collect::<Vec<_>>()}
            </div>

            <Suspense fallback=move || view! { <div class="text-gray-400 py-12 text-center">"Loading community threads..."</div> }>
                {move || threads_resource.get().map(|res| match res {
                    Ok(page) => {
                        if page.items.is_empty() {
                            view! {
                                <div class="p-12 text-center bg-gray-900/40 rounded-2xl border border-gray-800">
                                    <p class="text-gray-400">"No threads found matching your filters."</p>
                                </div>
                            }.into_any()
                        } else {
                            view! {
                                <div class="space-y-4">
                                    {page.items.into_iter().map(|t| {
                                        let t_id = t.thread.id.to_string();
                                        let title = t.thread.title.clone();
                                        let author_name = t.author_username.clone();
                                        let author_role_str = t.author_role.clone();
                                        let avatar = t.author_avatar_url.clone().unwrap_or_else(|| {
                                            "https://api.dicebear.com/7.x/bottts/svg?seed=default".to_string()
                                        });
                                        let is_qa = t.thread.thread_type == bin_bag_core::models::community::ThreadType::Qa;
                                        let replies = t.reply_count;
                                        let upvotes = t.thread.upvote_count;
                                        let voted = t.user_has_upvoted;
                                        let tags = t.thread.tags.clone();
                                        let listing_title = t.listing_title.clone();
                                        let date_str = t.thread.created_at.format("%b %d, %Y").to_string();

                                        let role_enum = match author_role_str.to_lowercase().as_str() {
                                            "seller" => bin_bag_core::models::user::UserRole::Seller,
                                            "expert" => bin_bag_core::models::user::UserRole::Expert,
                                            "admin" => bin_bag_core::models::user::UserRole::Admin,
                                            _ => bin_bag_core::models::user::UserRole::Buyer,
                                        };

                                        view! {
                                            <div class="p-6 bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl transition-all">
                                                <div class="flex items-start justify-between gap-4">
                                                    <div class="space-y-2">
                                                        <div class="flex items-center space-x-2">
                                                            {if is_qa {
                                                                view! {
                                                                    <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 uppercase tracking-wider">
                                                                        "Q&A"
                                                                    </span>
                                                                }.into_any()
                                                            } else {
                                                                view! {
                                                                    <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-400 uppercase tracking-wider">
                                                                        "General"
                                                                    </span>
                                                                }.into_any()
                                                            }}

                                                            {if let Some(lt) = listing_title {
                                                                view! {
                                                                    <span class="text-xs text-gray-500">"regarding " <span class="text-gray-300">{lt}</span></span>
                                                                }.into_any()
                                                            } else {
                                                                view! { <span /> }.into_any()
                                                            }}
                                                        </div>

                                                        <a href=format!("/community/{}", t_id) class="block group">
                                                            <h2 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                {title}
                                                            </h2>
                                                        </a>

                                                        <div class="flex flex-wrap items-center gap-2 pt-1">
                                                            {tags.into_iter().map(|tag| view! {
                                                                <span class="px-2 py-0.5 rounded-full bg-gray-800 text-[11px] text-gray-400">
                                                                    "#" {tag}
                                                                </span>
                                                            }).collect::<Vec<_>>()}
                                                        </div>

                                                        <div class="flex items-center space-x-3 pt-2 text-xs text-gray-400">
                                                            <div class="flex items-center space-x-2">
                                                                <img src=avatar alt=author_name.clone() class="w-5 h-5 rounded-full object-cover" />
                                                                <span class="text-gray-300 font-medium">{author_name}</span>
                                                                <RoleBadge role=role_enum />
                                                            </div>
                                                            <span>"•"</span>
                                                            <span>{date_str}</span>
                                                        </div>
                                                    </div>

                                                    <div class="flex flex-col items-end space-y-3 shrink-0">
                                                        <UpvoteButton
                                                            target_type="thread".to_string()
                                                            target_id=t_id.clone()
                                                            initial_count=upvotes
                                                            initial_voted=voted
                                                        />
                                                        <a
                                                            href=format!("/community/{}", t_id)
                                                            class="text-xs font-semibold text-gray-400 hover:text-white flex items-center space-x-1"
                                                        >
                                                            <span>"💬"</span>
                                                            <span>{replies} " replies"</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    }).collect::<Vec<_>>()}
                                </div>
                            }.into_any()
                        }
                    },
                    Err(e) => view! {
                        <div class="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl text-red-400 text-sm">
                            "Error loading threads: " {e.to_string()}
                        </div>
                    }.into_any()
                })}
            </Suspense>
        </div>
    }
}
