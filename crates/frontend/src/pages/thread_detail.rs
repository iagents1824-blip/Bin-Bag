use leptos::prelude::*;
use leptos_router::hooks::use_params_map;
use crate::server_fns::community::{get_thread, create_reply, mark_accepted_answer};
use crate::components::upvote_button::UpvoteButton;
use crate::components::reply_card::ReplyCard;
use crate::components::role_badge::RoleBadge;
use crate::app::AuthContext;

#[component]
pub fn ThreadDetailPage() -> impl IntoView {
    let params = use_params_map();
    let thread_id_sig = move || params.get().get("id").unwrap_or_default();
    let auth = expect_context::<AuthContext>();

    let thread_resource = Resource::new(
        move || thread_id_sig(),
        |id| async move {
            if id.is_empty() {
                return Err(ServerFnError::new("Missing thread ID"));
            }
            get_thread(id).await
        },
    );

    let (reply_content, set_reply_content) = signal(String::new());
    let (submitting, set_submitting) = signal(false);
    let (error_msg, set_error_msg) = signal(String::new());

    let handle_reply_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        let content = reply_content.get().trim().to_string();
        if content.is_empty() {
            set_error_msg.set("Reply content cannot be empty".to_string());
            return;
        }
        set_submitting.set(true);
        set_error_msg.set(String::new());
        let t_id = thread_id_sig();

        leptos::task::spawn_local(async move {
            match create_reply(t_id, content).await {
                Ok(_) => {
                    set_reply_content.set(String::new());
                    thread_resource.refetch();
                }
                Err(e) => {
                    set_error_msg.set(e.to_string());
                }
            }
            set_submitting.set(false);
        });
    };

    let on_accept_callback = Callback::new(move |reply_id: String| {
        leptos::task::spawn_local(async move {
            if let Ok(_) = mark_accepted_answer(reply_id).await {
                thread_resource.refetch();
            }
        });
    });

    view! {
        <div class="container py-8 max-w-4xl">
            <Suspense fallback=move || view! { <div class="text-gray-400 py-12 text-center">"Loading thread..."</div> }>
                {move || thread_resource.get().map(|res| match res {
                    Ok((t, replies)) => {
                        let t_id = t.thread.id.to_string();
                        let title = t.thread.title.clone();
                        let content = t.thread.content.clone();
                        let author_id = t.thread.user_id;
                        let author_name = t.author_username.clone();
                        let author_role_str = t.author_role.clone();
                        let avatar = t.author_avatar_url.clone().unwrap_or_else(|| {
                            "https://api.dicebear.com/7.x/bottts/svg?seed=default".to_string()
                        });
                        let is_qa = t.thread.thread_type == bin_bag_core::models::community::ThreadType::Qa;
                        let upvotes = t.thread.upvote_count;
                        let voted = t.user_has_upvoted;
                        let tags = t.thread.tags.clone();
                        let date_str = t.thread.created_at.format("%b %d, %Y at %H:%M").to_string();

                        let role_enum = match author_role_str.to_lowercase().as_str() {
                            "seller" => bin_bag_core::models::user::UserRole::Seller,
                            "expert" => bin_bag_core::models::user::UserRole::Expert,
                            "admin" => bin_bag_core::models::user::UserRole::Admin,
                            _ => bin_bag_core::models::user::UserRole::Buyer,
                        };

                        let is_current_user_author = auth.user.get().map(|u| u.id == author_id).unwrap_or(false);

                        view! {
                            <div class="space-y-8">
                                <div class="p-8 bg-gray-900/90 border border-gray-800 rounded-3xl shadow-xl">
                                    <div class="flex items-start justify-between gap-4 mb-6">
                                        <div>
                                            <div class="flex items-center space-x-2 mb-2">
                                                {if is_qa {
                                                    view! {
                                                        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                            "❓ Q&A"
                                                        </span>
                                                    }.into_any()
                                                } else {
                                                    view! {
                                                        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                                            "💬 General Discussion"
                                                        </span>
                                                    }.into_any()
                                                }}
                                            </div>

                                            <h1 class="text-2xl md:text-3xl font-extrabold text-white">
                                                {title}
                                            </h1>

                                            <div class="flex flex-wrap items-center gap-2 mt-3">
                                                {tags.into_iter().map(|tag| view! {
                                                    <span class="px-2.5 py-0.5 rounded-full bg-gray-800 border border-gray-700/60 text-xs text-gray-400">
                                                        "#" {tag}
                                                    </span>
                                                }).collect::<Vec<_>>()}
                                            </div>
                                        </div>

                                        <UpvoteButton
                                            target_type="thread".to_string()
                                            target_id=t_id.clone()
                                            initial_count=upvotes
                                            initial_voted=voted
                                        />
                                    </div>

                                    <div class="text-gray-200 text-base leading-relaxed whitespace-pre-wrap border-t border-gray-800/80 pt-6 mb-6">
                                        {content}
                                    </div>

                                    <div class="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-800/60">
                                        <div class="flex items-center space-x-2">
                                            <img src=avatar alt=author_name.clone() class="w-6 h-6 rounded-full object-cover" />
                                            <span class="font-bold text-gray-300">{author_name}</span>
                                            <RoleBadge role=role_enum />
                                        </div>
                                        <span>{date_str}</span>
                                    </div>
                                </div>

                                <div class="space-y-4">
                                    <h2 class="text-xl font-bold text-white flex items-center space-x-2">
                                        <span>"Replies (" {replies.len()} ")"</span>
                                    </h2>

                                    {if replies.is_empty() {
                                        view! {
                                            <div class="p-8 text-center bg-gray-900/40 rounded-2xl border border-gray-800 text-gray-400">
                                                "No replies yet. Be the first to answer or share your thoughts!"
                                            </div>
                                        }.into_any()
                                    } else {
                                        view! {
                                            <div class="space-y-4">
                                                {replies.into_iter().map(|reply| {
                                                    view! {
                                                        <ReplyCard
                                                            reply=reply
                                                            is_thread_author=is_current_user_author
                                                            on_accept=on_accept_callback.clone()
                                                        />
                                                    }
                                                }).collect::<Vec<_>>()}
                                            </div>
                                        }.into_any()
                                    }}
                                </div>

                                <div class="p-6 bg-gray-900/80 border border-gray-800 rounded-2xl">
                                    <h3 class="text-lg font-bold text-white mb-4">"Post a Reply"</h3>
                                    {move || {
                                        if auth.user.get().is_some() {
                                            view! {
                                                <form on:submit=handle_reply_submit class="space-y-4">
                                                    <div>
                                                        <textarea
                                                            rows="4"
                                                            placeholder="Write your answer or comment here..."
                                                            on:input=move |ev| set_reply_content.set(event_target_value(&ev))
                                                            prop:value=move || reply_content.get()
                                                            class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                                                        />
                                                    </div>

                                                    {move || {
                                                        let err = error_msg.get();
                                                        if !err.is_empty() {
                                                            view! {
                                                                <div class="p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-red-400 text-xs">
                                                                    {err}
                                                                </div>
                                                            }.into_any()
                                                        } else {
                                                            view! { <span /> }.into_any()
                                                        }
                                                    }}

                                                    <div class="flex justify-end">
                                                        <button
                                                            type="submit"
                                                            disabled=move || submitting.get()
                                                            class="btn btn-primary text-sm px-6 py-2"
                                                        >
                                                            {move || if submitting.get() { "Posting..." } else { "Post Reply" }}
                                                        </button>
                                                    </div>
                                                </form>
                                            }.into_any()
                                        } else {
                                            view! {
                                                <div class="p-4 bg-gray-950/60 rounded-xl text-center">
                                                    <p class="text-sm text-gray-400 mb-3">"Please log in to participate in this discussion."</p>
                                                    <a href="/login" class="btn btn-primary text-xs px-4 py-2">"Sign In"</a>
                                                </div>
                                            }.into_any()
                                        }
                                    }}
                                </div>
                            </div>
                        }.into_any()
                    },
                    Err(e) => view! {
                        <div class="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl text-red-400 text-sm">
                            "Error loading thread: " {e.to_string()}
                        </div>
                    }.into_any()
                })}
            </Suspense>
        </div>
    }
}
