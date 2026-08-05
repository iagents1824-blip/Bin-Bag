use leptos::prelude::*;

#[component]
pub fn UpvoteButton(
    #[prop(into)] target_type: String,
    #[prop(into)] target_id: String,
    initial_count: i32,
    initial_voted: bool,
) -> impl IntoView {
    use crate::server_fns::community::toggle_upvote;

    let (count, set_count) = signal(initial_count);
    let (voted, set_voted) = signal(initial_voted);
    let (loading, set_loading) = signal(false);

    let on_click = move |_| {
        if loading.get() {
            return;
        }
        set_loading.set(true);
        let t_type = target_type.clone();
        let t_id = target_id.clone();
        leptos::task::spawn_local(async move {
            match toggle_upvote(t_type, t_id).await {
                Ok(new_count) => {
                    set_count.set(new_count);
                    set_voted.update(|v| *v = !*v);
                }
                Err(e) => {
                    leptos::logging::error!("Upvote failed: {}", e);
                }
            }
            set_loading.set(false);
        });
    };

    view! {
        <button
            type="button"
            on:click=on_click
            class=move || {
                let base = "inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer select-none ";
                if voted.get() {
                    format!("{} bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/30", base)
                } else {
                    format!("{} bg-gray-800/80 text-gray-300 border-gray-700/60 hover:bg-gray-800 hover:text-white hover:border-gray-600", base)
                }
            }
        >
            <span class="text-xs">"▲"</span>
            <span>{move || count.get()}</span>
        </button>
    }
}
