use leptos::prelude::*;

#[component]
pub fn NotificationBell() -> impl IntoView {
    use crate::server_fns::notifications::{get_my_notifications, mark_all_notifications_read, mark_notification_read};
    use crate::app::AuthContext;

    let auth = expect_context::<AuthContext>();
    let (open, set_open) = signal(false);
    let (notifications, set_notifications) = signal(Vec::<bin_bag_core::models::notification::Notification>::new());
    let (unread_count, set_unread_count) = signal(0usize);
    let (refreshing, set_refreshing) = signal(false);

    let fetch_live_notifications = move || {
        if auth.user.get().is_some() {
            set_refreshing.set(true);
            leptos::task::spawn_local(async move {
                if let Ok(list) = get_my_notifications(true, Some(15)).await {
                    let len = list.len();
                    set_notifications.set(list);
                    set_unread_count.set(len);
                }
                set_refreshing.set(false);
            });
        }
    };

    Effect::new(move |_| {
        fetch_live_notifications();
    });

    let toggle_open = move |_| {
        set_open.update(|o| {
            let next = !*o;
            if next {
                fetch_live_notifications();
            }
            *o = next
        });
    };

    let handle_mark_all = move |_| {
        set_unread_count.set(0);
        set_notifications.update(|list| {
            for item in list.iter_mut() {
                item.is_read = true;
            }
        });
        leptos::task::spawn_local(async move {
            let _ = mark_all_notifications_read().await;
        });
    };

    view! {
        <div class="relative inline-block text-left">
            <button
                type="button"
                on:click=toggle_open
                class="relative p-2 text-secondary hover:text-primary rounded-full hover:bg-hover transition-colors focus:outline-none cursor-pointer"
                aria-label="Notifications"
            >
                <span class="text-xl">"🔔"</span>
                {move || {
                    let c = unread_count.get();
                    if c > 0 {
                        view! {
                            <span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white shadow">
                                {c}
                            </span>
                        }.into_any()
                    } else {
                        view! { <span /> }.into_any()
                    }
                }}
            </button>

            {move || {
                if open.get() {
                    view! {
                        <div class="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-secondary border border-border shadow-xl z-50 overflow-hidden animate-fade-in-up">
                            <div class="px-4 py-3 border-b border-border flex items-center justify-between bg-card-hover">
                                <div class="flex items-center space-x-2">
                                    <h3 class="text-sm font-bold">"Notifications"</h3>
                                    <span class="text-[10px] bg-success-bg text-success border border-success px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                        "🟢 Live"
                                    </span>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        on:click=move |_| fetch_live_notifications()
                                        class="text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
                                        title="Refresh Live Notifications"
                                    >
                                        {move || if refreshing.get() { "🔄..." } else { "🔄" }}
                                    </button>
                                    {if unread_count.get() > 0 {
                                        view! {
                                            <button
                                                type="button"
                                                on:click=handle_mark_all
                                                class="text-xs text-link hover:underline transition-colors cursor-pointer"
                                            >
                                                "Mark all read"
                                            </button>
                                        }.into_any()
                                    } else {
                                        view! { <span /> }.into_any()
                                    }}
                                </div>
                            </div>

                            <div class="max-h-80 overflow-y-auto divide-y divide-border">
                                {move || {
                                    let list = notifications.get();
                                    if list.is_empty() {
                                        view! {
                                            <div class="px-4 py-6 text-center text-xs text-secondary">
                                                "No new notifications"
                                            </div>
                                        }.into_any()
                                    } else {
                                        list.into_iter().map(|notif| {
                                            let n_id = notif.id.to_string();
                                            let url = notif.target_url.clone();
                                            let title = notif.title.clone();
                                            let msg = notif.message.clone();
                                            let is_read = notif.is_read;
                                            let date_str = notif.created_at.format("%b %d, %H:%M").to_string();

                                            view! {
                                                <a
                                                    href=url
                                                    on:click=move |_| {
                                                        if !is_read {
                                                            let nid = n_id.clone();
                                                            leptos::task::spawn_local(async move {
                                                                let _ = mark_notification_read(nid).await;
                                                            });
                                                        }
                                                        set_open.set(false);
                                                    }
                                                    class=move || {
                                                        if !is_read {
                                                            "block px-4 py-3 bg-card-hover transition-colors"
                                                        } else {
                                                            "block px-4 py-3 hover:bg-hover transition-colors opacity-70"
                                                        }
                                                    }
                                                >
                                                    <div class="flex items-start justify-between gap-2">
                                                        <span class="text-xs font-bold line-clamp-1">{title}</span>
                                                        <span class="text-[10px] text-tertiary shrink-0">{date_str}</span>
                                                    </div>
                                                    <p class="text-xs text-secondary mt-1 line-clamp-2">{msg}</p>
                                                </a>
                                            }
                                        }).collect::<Vec<_>>().into_any()
                                    }
                                }}
                            </div>
                        </div>
                    }.into_any()
                } else {
                    view! { <span /> }.into_any()
                }
            }}
        </div>
    }
}
