//! Interactive AI Prompt & Model Playground component.

use leptos::prelude::*;
use bin_bag_core::models::listing::ListingType;
use crate::server_fns::listings::{simulate_playground_run, PlaygroundResult};

#[component]
pub fn Playground(
    listing_id: String,
    listing_title: String,
    listing_type: ListingType,
) -> impl IntoView {
    let (temperature, set_temperature) = signal(0.7_f32);
    let (max_tokens, set_max_tokens) = signal(256_u32);
    let (system_prompt, set_system_prompt) = signal(String::from(
        "You are an expert AI assistant. Provide concise, accurate, and production-ready responses."
    ));
    let (user_prompt, set_user_prompt) = signal(String::from(
        "Write a Python function to compute Fibonacci numbers using memoization."
    ));

    let (loading, set_loading) = signal(false);
    let (error, set_error) = signal(String::new());
    let (result, set_result) = signal(Option::<PlaygroundResult>::None);
    let (copied, set_copied) = signal(false);

    let on_run = move |_| {
        let id_val = listing_id.clone();
        let sys_val = system_prompt.get();
        let usr_val = user_prompt.get();
        let temp_val = temperature.get();
        let tok_val = max_tokens.get();

        set_loading.set(true);
        set_error.set(String::new());
        set_copied.set(false);

        leptos::task::spawn_local(async move {
            match simulate_playground_run(id_val, sys_val, usr_val, temp_val, tok_val).await {
                Ok(res) => set_result.set(Some(res)),
                Err(e) => set_error.set(e.to_string()),
            }
            set_loading.set(false);
        });
    };

    let set_sample = move |sample_sys: &str, sample_usr: &str| {
        set_system_prompt.set(sample_sys.to_string());
        set_user_prompt.set(sample_usr.to_string());
        set_result.set(None);
    };

    view! {
        <div class="card playground-box" style="padding: var(--space-6); margin-top: var(--space-8); margin-bottom: var(--space-8);">
            <div class="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="text-2xl font-extrabold text-primary">"🎮 Interactive AI Sandbox / Playground"</h3>
                        <span class="badge badge-success">"⚡ Ready to Run"</span>
                    </div>
                    <p class="text-sm text-secondary mt-1">
                        "Test and evaluate " <span class="font-bold text-primary">{listing_title.clone()}</span> " live in your browser before purchasing."
                    </p>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 mb-6">
                <span class="text-xs font-semibold text-secondary uppercase tracking-wider">"Quick Samples:"</span>
                <button
                    type="button"
                    class="pill-btn"
                    on:click=move |_| set_sample(
                        "You are a senior Python software architect.",
                        "Write a robust Python function to compute the Fibonacci sequence with memoization and type annotations."
                    )
                >
                    "💡 Python Code Generation"
                </button>
                <button
                    type="button"
                    class="pill-btn"
                    on:click=move |_| set_sample(
                        "You are an executive data analyst.",
                        "Summarize the key trends in AI inference latency and explain the trade-offs between batching and streaming."
                    )
                >
                    "💡 Executive Data Summary"
                </button>
                <button
                    type="button"
                    class="pill-btn"
                    on:click=move |_| set_sample(
                        "You are a creative brainstorming AI.",
                        "Generate 3 innovative product features for a decentralized AI marketplace platform."
                    )
                >
                    "💡 Creative Assistant"
                </button>
            </div>

            <div class="playground-toolbar grid grid-2 gap-4 mb-6" style="padding: var(--space-4); background: var(--color-bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <label class="form-label text-xs font-bold uppercase tracking-wider">"Temperature"</label>
                        <span class="text-xs font-mono font-bold text-link">{move || format!("{:.1}", temperature.get())}</span>
                    </div>
                    <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.1"
                        class="playground-slider w-full"
                        prop:value=move || temperature.get()
                        on:input=move |ev| {
                            if let Ok(val) = event_target_value(&ev).parse::<f32>() {
                                set_temperature.set(val);
                            }
                        }
                    />
                    <div class="flex justify-between text-xs text-secondary mt-1">
                        <span>"0.0 (Precise)"</span>
                        <span>"1.0 (Creative)"</span>
                    </div>
                </div>

                <div>
                    <label class="form-label text-xs font-bold uppercase tracking-wider mb-2 block">"Max Output Tokens"</label>
                    <select
                        class="form-select w-full"
                        on:change=move |ev| {
                            if let Ok(val) = event_target_value(&ev).parse::<u32>() {
                                set_max_tokens.set(val);
                            }
                        }
                    >
                        <option value="128" selected=move || max_tokens.get() == 128>"128 tokens (Short)"</option>
                        <option value="256" selected=move || max_tokens.get() == 256>"256 tokens (Standard)"</option>
                        <option value="512" selected=move || max_tokens.get() == 512>"512 tokens (Detailed)"</option>
                        <option value="1024" selected=move || max_tokens.get() == 1024>"1024 tokens (Long)"</option>
                    </select>
                </div>
            </div>

            <div class="space-y-4 mb-6">
                <div class="form-group">
                    <label class="form-label text-xs font-bold uppercase tracking-wider">"System Instructions"</label>
                    <textarea
                        class="form-textarea w-full text-sm font-mono"
                        rows="2"
                        on:input=move |ev| set_system_prompt.set(event_target_value(&ev))
                    >{move || system_prompt.get()}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label text-xs font-bold uppercase tracking-wider">"User Prompt / Query"</label>
                    <textarea
                        class="form-textarea w-full text-sm font-mono"
                        rows="3"
                        placeholder="Enter your prompt to test the model..."
                        on:input=move |ev| set_user_prompt.set(event_target_value(&ev))
                    >{move || user_prompt.get()}</textarea>
                </div>
            </div>

            <div class="flex items-center justify-between mb-6">
                <span class="text-xs text-secondary">
                    "🔒 In-browser simulation • Full license unlocks production API key"
                </span>
                <button
                    type="button"
                    class="btn btn-primary btn-lg px-6 flex items-center gap-2 shadow-lg hover:shadow-primary/30"
                    disabled=move || loading.get()
                    on:click=on_run
                >
                    <Show when=move || loading.get() fallback=|| view! {
                        <span>"▶ Run Live Inference"</span>
                    }>
                        <span>"⏳ Simulating..."</span>
                    </Show>
                </button>
            </div>

            <Show when=move || !error.get().is_empty()>
                <div class="alert alert-error mb-4">
                    {move || error.get()}
                </div>
            </Show>

            <Show when=move || result.get().is_some()>
                {move || {
                    result.get().map(|res| {
                        view! {
                            <div class="playground-output animate-fade-in-up" style="background: #0d1117; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden;">
                                <div class="flex items-center justify-between px-4 py-3" style="background: #161b22; border-bottom: 1px solid var(--color-border);">
                                    <div class="flex items-center gap-3">
                                        <span class="text-xs font-bold text-primary uppercase tracking-wider">"Output Console"</span>
                                        <span class="metric-tag">"⏱️ " {res.latency_ms} "ms"</span>
                                        <span class="metric-tag">"🪙 " {res.tokens_used} " tokens"</span>
                                    </div>
                                    <button
                                        type="button"
                                        class="text-xs font-semibold text-link hover:underline"
                                        on:click=move |_| {
                                            set_copied.set(true);
                                        }
                                    >
                                        {move || if copied.get() { "✓ Copied to clipboard" } else { "📋 Copy Output" }}
                                    </button>
                                </div>
                                <div class="p-4">
                                    <pre class="text-sm font-mono text-primary whitespace-pre-wrap overflow-x-auto" style="line-height: 1.6;">
                                        {res.output_text}
                                    </pre>
                                </div>
                            </div>
                        }
                    })
                }}
            </Show>
        </div>
    }
}
