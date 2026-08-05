//! ListingCreate page — form for sellers to create new listings.

use leptos::prelude::*;
use leptos_router::hooks::use_navigate;
use crate::app::AuthContext;
use crate::server_fns::listings::create_listing;
use bin_bag_core::models::user::UserRole;

#[component]
pub fn ListingCreate() -> impl IntoView {
    let auth = expect_context::<AuthContext>();
    let navigate = use_navigate();

    // Auth guard: must be seller or admin
    Effect::new(move || {
        if let Some(user) = auth.user.get() {
            if user.role == UserRole::Buyer {
                let nav = use_navigate();
                nav("/", Default::default());
            }
        } else {
            let nav = use_navigate();
            nav("/login", Default::default());
        }
    });

    let (title, set_title) = signal(String::new());
    let (description, set_description) = signal(String::new());
    let (listing_type, set_listing_type) = signal("model".to_string());
    let (category, set_category) = signal(String::new());
    let (price_dollars, set_price_dollars) = signal(String::from("0"));
    let (license, set_license) = signal("mit".to_string());
    let (external_link, set_external_link) = signal(String::new());
    let (tags_str, set_tags_str) = signal(String::new());
    let (status, set_status) = signal("active".to_string());

    let (error, set_error) = signal(String::new());
    let (loading, set_loading) = signal(false);

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        set_loading.set(true);
        set_error.set(String::new());

        let title_val = title.get();
        let desc_val = description.get();
        let type_val = listing_type.get();
        let cat_val = category.get();
        let price_val: f64 = price_dollars.get().parse().unwrap_or(0.0);
        let price_cents = (price_val * 100.0).round() as i32;
        let lic_val = license.get();
        let ext_link = {
            let l = external_link.get();
            if l.is_empty() { None } else { Some(l) }
        };
        let status_val = status.get();
        let tags_val = tags_str.get();

        leptos::task::spawn_local(async move {
            match create_listing(
                title_val,
                desc_val,
                type_val,
                cat_val,
                price_cents,
                lic_val,
                ext_link,
                status_val,
                tags_val,
            ).await {
                Ok(listing) => {
                    let nav = use_navigate();
                    nav(&format!("/listings/{}", listing.id), Default::default());
                },
                Err(e) => set_error.set(e.to_string()),
            }
            set_loading.set(false);
        });
    };

    view! {
        <div class="container">
            <div class="listing-form-container animate-fade-in-up">
                <div class="listing-form-header">
                    <h1>"Create New Listing"</h1>
                    <p class="text-secondary">"Share your AI model, chatbot, workflow, or dataset with the community."</p>
                </div>

                <Show when=move || !error.get().is_empty()>
                    <div class="alert alert-error">{move || error.get()}</div>
                </Show>

                <form class="listing-form" on:submit=on_submit>
                    <div class="form-group">
                        <label class="form-label">"Title" <span class="required">"*"</span></label>
                        <input type="text" required class="form-input"
                            placeholder="e.g. GPT-4 Fine-tuned for Legal Documents"
                            on:input=move |ev| set_title.set(event_target_value(&ev))
                            prop:value=title/>
                    </div>

                    <div class="form-group">
                        <label class="form-label">"Description" <span class="required">"*"</span></label>
                        <textarea required rows="6" class="form-textarea"
                            placeholder="Describe what your listing does, how it was built, and what makes it unique..."
                            on:input=move |ev| set_description.set(event_target_value(&ev))
                            prop:value=description></textarea>
                    </div>

                    <div class="grid grid-2" style="gap: var(--space-6);">
                        <div class="form-group">
                            <label class="form-label">"Type" <span class="required">"*"</span></label>
                            <select class="form-select"
                                on:change=move |ev| set_listing_type.set(event_target_value(&ev))>
                                <option value="model">"Model"</option>
                                <option value="chatbot">"Chatbot"</option>
                                <option value="assistant">"Assistant"</option>
                                <option value="workflow">"Workflow"</option>
                                <option value="prompt">"Prompt"</option>
                                <option value="dataset">"Dataset"</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">"Category" <span class="required">"*"</span></label>
                            <input type="text" required class="form-input"
                                placeholder="e.g. NLP, Computer Vision, Audio"
                                on:input=move |ev| set_category.set(event_target_value(&ev))
                                prop:value=category/>
                        </div>
                    </div>

                    <div class="grid grid-2" style="gap: var(--space-6);">
                        <div class="form-group">
                            <label class="form-label">"Price (USD)"</label>
                            <input type="number" step="0.01" min="0" class="form-input"
                                placeholder="0.00 = Free"
                                on:input=move |ev| set_price_dollars.set(event_target_value(&ev))
                                prop:value=price_dollars/>
                            <span class="form-hint">"Enter 0 for free listings"</span>
                        </div>

                        <div class="form-group">
                            <label class="form-label">"License"</label>
                            <select class="form-select"
                                on:change=move |ev| set_license.set(event_target_value(&ev))>
                                <option value="mit">"MIT"</option>
                                <option value="apache2">"Apache 2.0"</option>
                                <option value="gpl3">"GPLv3"</option>
                                <option value="proprietary">"Proprietary"</option>
                                <option value="custom">"Custom"</option>
                                <option value="other">"Other"</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">"External Link"</label>
                        <input type="url" class="form-input"
                            placeholder="https://huggingface.co/your-model"
                            on:input=move |ev| set_external_link.set(event_target_value(&ev))
                            prop:value=external_link/>
                        <span class="form-hint">"Link to where the model/asset is hosted (Hugging Face, GitHub, etc.)"</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">"Tags"</label>
                        <input type="text" class="form-input"
                            placeholder="nlp, transformer, fine-tuned, production-ready"
                            on:input=move |ev| set_tags_str.set(event_target_value(&ev))
                            prop:value=tags_str/>
                        <span class="form-hint">"Comma-separated tags to help buyers find your listing"</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">"Status"</label>
                        <div class="form-radio-group">
                            <label class=move || if status.get() == "active" { "form-radio-item selected" } else { "form-radio-item" }>
                                <input type="radio" name="status" value="active"
                                    checked=move || status.get() == "active"
                                    on:change=move |_| set_status.set("active".to_string())/>
                                "Active — visible to buyers immediately"
                            </label>
                            <label class=move || if status.get() == "draft" { "form-radio-item selected" } else { "form-radio-item" }>
                                <input type="radio" name="status" value="draft"
                                    checked=move || status.get() == "draft"
                                    on:change=move |_| set_status.set("draft".to_string())/>
                                "Draft — only visible to you"
                            </label>
                        </div>
                    </div>

                    <div class="listing-form-actions">
                        <a href="/listings" class="btn btn-secondary">"Cancel"</a>
                        <button type="submit" disabled=move || loading.get()
                            class="btn btn-primary btn-lg">
                            <Show when=move || loading.get() fallback=|| view! { "Create Listing" }>
                                "Creating..."
                            </Show>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    }
}
