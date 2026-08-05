use leptos::prelude::*;

#[component]
pub fn AnalyticsCard(
    title: String,
    value: String,
    #[prop(optional)] subtitle: Option<String>,
    icon: &'static str,
    #[prop(default = false)] is_currency: bool,
) -> impl IntoView {
    view! {
        <div class="card p-6 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition-all duration-300 shadow-lg relative overflow-hidden">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-slate-400">{title}</span>
                <span class="text-2xl p-2 bg-slate-800/80 rounded-lg">{icon}</span>
            </div>
            <div class="flex items-baseline space-x-2">
                <span class="text-3xl font-extrabold tracking-tight text-white">
                    {value}
                </span>
                {move || {
                    if is_currency {
                        view! {
                            <span class="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                                "USD"
                            </span>
                        }.into_any()
                    } else {
                        view! { <span></span> }.into_any()
                    }
                }}
            </div>
            {move || {
                if let Some(sub) = subtitle.clone() {
                    view! {
                        <p class="text-xs text-slate-500 mt-2">{sub}</p>
                    }.into_any()
                } else {
                    view! { <span></span> }.into_any()
                }
            }}
        </div>
    }
}
