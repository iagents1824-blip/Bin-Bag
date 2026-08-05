use leptos::prelude::*;
use leptos_router::hooks::use_navigate;

#[component]
pub fn SearchBar() -> impl IntoView {
    let (query, set_query) = signal(String::new());
    let navigate = use_navigate();

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        let q = query.get();
        let trimmed = q.trim();
        if !trimmed.is_empty() {
            let encoded = trimmed.replace(' ', "+");
            navigate(&format!("/search?q={}", encoded), Default::default());
        }
    };

    view! {
        <form class="search-bar-form flex items-center" on:submit=on_submit>
            <div class="relative w-full max-w-md">
                <input
                    type="text"
                    class="form-input search-bar-input pl-9 pr-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-64 md:w-80"
                    placeholder="Search AI models, prompts, news..."
                    prop:value=move || query.get()
                    on:input=move |ev| set_query.set(event_target_value(&ev))
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    "🔍"
                </div>
            </div>
            <button
                type="submit"
                class="ml-2 px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
                "Search"
            </button>
        </form>
    }
}
