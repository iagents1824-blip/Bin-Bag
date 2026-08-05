use leptos::prelude::*;
use crate::server_fns::community::create_thread;
use bin_bag_core::models::community::TopicTag;
use crate::app::AuthContext;

#[component]
pub fn ThreadCreatePage() -> impl IntoView {
    let _auth = expect_context::<AuthContext>();

    let (title, set_title) = signal(String::new());
    let (content, set_content) = signal(String::new());
    let (thread_type, set_thread_type) = signal("qa".to_string());
    let (listing_id, set_listing_id) = signal(String::new());
    let (selected_tags, set_selected_tags) = signal(Vec::<String>::new());

    let (error_msg, set_error_msg) = signal(String::new());
    let (submitting, set_submitting) = signal(false);

    let toggle_tag = move |tag_str: String| {
        set_selected_tags.update(|list| {
            if let Some(pos) = list.iter().position(|t| t == &tag_str) {
                list.remove(pos);
            } else {
                list.push(tag_str);
            }
        });
    };

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        if title.get().trim().is_empty() || content.get().trim().is_empty() {
            set_error_msg.set("Title and Content are required".to_string());
            return;
        }
        set_submitting.set(true);
        set_error_msg.set(String::new());

        let t_val = title.get();
        let c_val = content.get();
        let type_val = thread_type.get();
        let lid_val = {
            let s = listing_id.get().trim().to_string();
            if s.is_empty() { None } else { Some(s) }
        };
        let tags_val = selected_tags.get();

        leptos::task::spawn_local(async move {
            match create_thread(t_val, c_val, type_val, lid_val, tags_val).await {
                Ok(new_thread) => {
                    let nav = leptos_router::hooks::use_navigate();
                    nav(&format!("/community/{}", new_thread.thread.id), Default::default());
                }
                Err(e) => {
                    set_error_msg.set(e.to_string());
                }
            }
            set_submitting.set(false);
        });
    };

    view! {
        <div class="container py-8 max-w-2xl">
            <div class="mb-8">
                <h1 class="text-3xl font-extrabold text-white">"Create a New Discussion or Question"</h1>
                <p class="text-gray-400 mt-1">"Ask an AI expert or start a community conversation."</p>
            </div>

            <form on:submit=on_submit class="space-y-6 bg-gray-900/80 border border-gray-800 p-8 rounded-3xl shadow-xl">
                <div>
                    <label class="block text-sm font-bold text-gray-300 mb-2">"Thread Type"</label>
                    <div class="flex items-center space-x-4">
                        <label class="inline-flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="thread_type"
                                checked=move || thread_type.get() == "qa"
                                on:change=move |_| set_thread_type.set("qa".to_string())
                                class="form-radio text-blue-600"
                            />
                            <span class="text-sm font-semibold text-white">"❓ Q&A (Seeking an Answer)"</span>
                        </label>
                        <label class="inline-flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="thread_type"
                                checked=move || thread_type.get() == "general"
                                on:change=move |_| set_thread_type.set("general".to_string())
                                class="form-radio text-blue-600"
                            />
                            <span class="text-sm font-semibold text-white">"💬 General Discussion"</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-300 mb-2">"Title *"</label>
                    <input
                        type="text"
                        required
                        placeholder="e.g., How to improve fine-tuning accuracy on small datasets?"
                        on:input=move |ev| set_title.set(event_target_value(&ev))
                        prop:value=move || title.get()
                        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-300 mb-2">"Topic Tags"</label>
                    <div class="flex flex-wrap gap-2">
                        {TopicTag::all().iter().map(|t| {
                            let tag_str = t.as_str().to_string();
                            let tag_name = t.display_name().to_string();
                            let t_val = tag_str.clone();
                            view! {
                                <button
                                    type="button"
                                    on:click=move |_| toggle_tag(t_val.clone())
                                    class=move || {
                                        if selected_tags.get().contains(&tag_str) {
                                            "px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white border border-blue-500"
                                        } else {
                                            "px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-800 text-gray-400 hover:text-white border border-gray-700/60"
                                        }
                                    }
                                >
                                    {tag_name}
                                </button>
                            }
                        }).collect::<Vec<_>>()}
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-300 mb-2">"Content *"</label>
                    <textarea
                        rows="6"
                        required
                        placeholder="Provide details, benchmarks, code snippets, or error logs..."
                        on:input=move |ev| set_content.set(event_target_value(&ev))
                        prop:value=move || content.get()
                        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-300 mb-2">
                        "Link to Listing UUID (Optional)"
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                        on:input=move |ev| set_listing_id.set(event_target_value(&ev))
                        prop:value=move || listing_id.get()
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

                <div class="flex justify-end space-x-3 pt-2">
                    <a href="/community" class="btn btn-secondary text-sm px-6 py-2.5">
                        "Cancel"
                    </a>
                    <button
                        type="submit"
                        disabled=move || submitting.get()
                        class="btn btn-primary text-sm px-8 py-2.5"
                    >
                        {move || if submitting.get() { "Publishing..." } else { "Publish Thread" }}
                    </button>
                </div>
            </form>
        </div>
    }
}
