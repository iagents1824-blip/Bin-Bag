use leptos::prelude::*;
use crate::server_fns::admin::submit_expert_application;

#[component]
pub fn ExpertApplyPage() -> impl IntoView {
    let (expertise_area, set_expertise_area) = signal(String::new());
    let (credentials_url, set_credentials_url) = signal(String::new());
    let (statement, set_statement) = signal(String::new());
    let (loading, set_loading) = signal(false);
    let (error, set_error) = signal(Option::<String>::None);
    let (success, set_success) = signal(false);

    let auth = expect_context::<crate::app::AuthContext>();

    Effect::new(move || {
        if auth.user.get().is_none() {
            let navigate = leptos_router::hooks::use_navigate();
            navigate("/login", Default::default());
        }
    });

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        set_loading.set(true);
        set_error.set(None);
        let area = expertise_area.get();
        let creds = credentials_url.get();
        let creds_opt = if creds.trim().is_empty() { None } else { Some(creds) };
        let stmt = statement.get();

        leptos::task::spawn_local(async move {
            match submit_expert_application(area, creds_opt, stmt).await {
                Ok(_) => {
                    set_success.set(true);
                }
                Err(e) => {
                    set_error.set(Some(e.to_string()));
                }
            }
            set_loading.set(false);
        });
    };

    view! {
        <div class="container max-w-2xl py-12">
            <div class="mb-8">
                <h1 class="text-3xl font-extrabold text-white tracking-tight">
                    "🎖️ Apply for Verified Expert Status"
                </h1>
                <p class="text-slate-400 text-sm mt-2">
                    "Verified experts gain the special badge across the marketplace and community, have their answers highlighted, and can conduct official peer verifications."
                </p>
            </div>

            {move || {
                if success.get() {
                    view! {
                        <div class="p-8 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-center">
                            <span class="text-4xl mb-3 block">"🎉"</span>
                            <h3 class="text-xl font-bold text-emerald-300 mb-2">"Application Submitted!"</h3>
                            <p class="text-sm text-slate-300 mb-6">
                                "Your application has been received and is now in the review queue. Our team will verify your credentials and notify you via in-app alert upon approval."
                            </p>
                            <a href="/" class="btn btn-primary">"Return to Home"</a>
                        </div>
                    }.into_any()
                } else {
                    view! {
                        <form class="space-y-6 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-xl" on:submit=on_submit>
                            {move || {
                                if let Some(err) = error.get() {
                                    view! {
                                        <div class="p-4 bg-red-950/40 border border-red-800 rounded-lg text-red-300 text-sm">
                                            {err}
                                        </div>
                                    }.into_any()
                                } else {
                                    view! { <span></span> }.into_any()
                                }
                            }}

                            <div class="form-group">
                                <label class="form-label text-sm font-semibold text-slate-300 block mb-2">
                                    "Domain of Expertise *"
                                </label>
                                <select
                                    class="form-select w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500"
                                    on:change=move |ev| set_expertise_area.set(event_target_value(&ev))
                                >
                                    <option value="" disabled selected>"Select your primary domain..."</option>
                                    <option value="LLM Fine-Tuning & Quantization">"LLM Fine-Tuning & Quantization"</option>
                                    <option value="AI Safety & Guardrails">"AI Safety & Guardrails"</option>
                                    <option value="Distributed Training & Inference">"Distributed Training & Inference"</option>
                                    <option value="Agentic Workflows & Tooling">"Agentic Workflows & Tooling"</option>
                                    <option value="Data Curation & Synthetic Data">"Data Curation & Synthetic Data"</option>
                                    <option value="Other AI Systems Research">"Other AI Systems Research"</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label text-sm font-semibold text-slate-300 block mb-2">
                                    "Credentials or Professional Profile URL"
                                </label>
                                <input
                                    type="url"
                                    class="form-input w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://github.com/... or https://scholar.google.com/..."
                                    prop:value=move || credentials_url.get()
                                    on:input=move |ev| set_credentials_url.set(event_target_value(&ev))
                                />
                                <span class="text-xs text-slate-500 mt-1 block">
                                    "Link to your GitHub, Google Scholar, LinkedIn, or personal portfolio."
                                </span>
                            </div>

                            <div class="form-group">
                                <label class="form-label text-sm font-semibold text-slate-300 block mb-2">
                                    "Qualification Statement *"
                                </label>
                                <textarea
                                    class="form-textarea w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                                    placeholder="Describe your background, projects, or research in this domain..."
                                    prop:value=move || statement.get()
                                    on:input=move |ev| set_statement.set(event_target_value(&ev))
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                class="btn btn-primary w-full py-3 text-base font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition"
                                disabled=move || loading.get()
                            >
                                {move || if loading.get() { "Submitting Application..." } else { "Submit Expert Application" }}
                            </button>
                        </form>
                    }.into_any()
                }
            }}
        </div>
    }
}
