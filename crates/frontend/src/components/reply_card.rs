use leptos::prelude::*;
use bin_bag_core::models::community::ReplyWithAuthor;
use crate::components::upvote_button::UpvoteButton;
use crate::components::role_badge::RoleBadge;

#[component]
pub fn ReplyCard(
    reply: ReplyWithAuthor,
    is_thread_author: bool,
    #[prop(optional)] on_accept: Option<leptos::prelude::Callback<String>>,
) -> impl IntoView {
    let reply_id = reply.reply.id.to_string();
    let author_name = reply.author_username.clone();
    let author_role_str = reply.author_role.clone();
    let avatar_url = reply.author_avatar_url.clone().unwrap_or_else(|| {
        "https://api.dicebear.com/7.x/bottts/svg?seed=default".to_string()
    });
    let date_str = reply.reply.created_at.format("%b %d, %Y at %H:%M").to_string();
    let content_text = reply.reply.content.clone();

    let (is_accepted, set_is_accepted) = signal(reply.reply.is_accepted_answer);
    let is_expert = reply.reply.is_expert_answer;

    let border_class = move || {
        if is_accepted.get() {
            "border-2 border-green-500/80 bg-green-950/10 shadow-lg shadow-green-900/10"
        } else if is_expert {
            "border-2 border-amber-500/80 bg-amber-950/10 shadow-lg shadow-amber-900/10"
        } else {
            "border border-gray-800 bg-gray-900/60"
        }
    };

    let role_enum = match author_role_str.to_lowercase().as_str() {
        "seller" => bin_bag_core::models::user::UserRole::Seller,
        "expert" => bin_bag_core::models::user::UserRole::Expert,
        "admin" => bin_bag_core::models::user::UserRole::Admin,
        _ => bin_bag_core::models::user::UserRole::Buyer,
    };

    view! {
        <div class=move || format!("p-6 rounded-2xl transition-all {}", border_class())>
            <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex items-center space-x-3">
                    <img src=avatar_url.clone() alt=author_name.clone() class="w-10 h-10 rounded-full border border-gray-700 object-cover" />
                    <div>
                        <div class="flex items-center space-x-2">
                            <span class="font-bold text-white text-sm">{author_name.clone()}</span>
                            <RoleBadge role=role_enum />
                        </div>
                        <span class="text-xs text-gray-400">{date_str.clone()}</span>
                    </div>
                </div>

                <div class="flex items-center space-x-2">
                    {if is_expert {
                        view! {
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                                <span>"🎖️"</span>
                                <span>"Expert Answer"</span>
                            </span>
                        }.into_any()
                    } else {
                        view! { <span /> }.into_any()
                    }}

                    {move || {
                        let r_id = reply_id.clone();
                        let cb = on_accept;
                        if is_accepted.get() {
                            view! {
                                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/40 flex items-center space-x-1">
                                    <span>"✓"</span>
                                    <span>"Accepted Answer"</span>
                                </span>
                            }.into_any()
                        } else if is_thread_author {
                            view! {
                                <button
                                    type="button"
                                    on:click=move |_| {
                                        if let Some(ref callback) = cb {
                                            callback.run(r_id.clone());
                                        }
                                        set_is_accepted.set(true);
                                    }
                                    class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700 hover:bg-green-600/20 hover:text-green-400 hover:border-green-500/40 transition-colors cursor-pointer"
                                >
                                    "✓ Accept Answer"
                                </button>
                            }.into_any()
                        } else {
                            view! { <span /> }.into_any()
                        }
                    }}
                </div>
            </div>

            <div class="text-gray-200 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                {content_text.clone()}
            </div>

            <div class="flex items-center justify-end">
                <UpvoteButton
                    target_type="reply".to_string()
                    target_id=reply.reply.id.to_string()
                    initial_count=reply.reply.upvote_count
                    initial_voted=reply.user_has_upvoted
                />
            </div>
        </div>
    }
}
