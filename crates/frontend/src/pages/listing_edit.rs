//! ListingEdit page — edit an existing listing (owner or admin only).

use leptos::prelude::*;
use leptos_router::hooks::{use_navigate, use_params_map};
use crate::app::AuthContext;
use crate::server_fns::listings::{get_listing, update_listing, delete_listing};

#[component]
pub fn ListingEdit() -> impl IntoView {
    let auth = expect_context::<AuthContext>();
    let params = use_params_map();
    let id = move || params.get().get("id").unwrap_or_default();

    // Auth guard
    Effect::new(move || {
        if auth.user.get().is_none() {
            let nav = use_navigate();
            nav("/login", Default::default());
        }
    });

    let (title, set_title) = signal(String::new());
    let (description, set_description) = signal(String::new());
    let (category, set_category) = signal(String::new());
    let (price_dollars, set_price_dollars) = signal(String::from("0"));
    let (license, set_license) = signal("mit".to_string());
    let (external_link, set_external_link) = signal(String::new());
    let (tags_str, set_tags_str) = signal(String::new());
    let (status, set_status) = signal("active".to_string());
    let (error, set_error) = signal(String::new());
    let (loading, set_loading) = signal(false);
    let (_data_loaded, set_data_loaded) = signal(false);
    let (show_delete_modal, set_show_delete_modal) = signal(false);

    let listing_resource = Resource::new(
        move || id(),
        move |listing_id| async move {
            let res = get_listing(listing_id).await;
            if let Ok(ref l) = res {
                set_title.set(l.title.clone());
                set_description.set(l.description.clone());
                set_category.set(l.category.clone());
                set_price_dollars.set(format!("{:.2}", l.price_cents as f64 / 100.0));
                set_license.set(format!("{:?}", l.license).to_lowercase());
                set_external_link.set(l.external_link.clone().unwrap_or_default());
                set_tags_str.set(l.tags.join(", "));
                set_status.set(format!("{:?}", l.status).to_lowercase());
                set_data_loaded.set(true);
            }
            res
        },
    );

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        set_loading.set(true);
        set_error.set(String::new());

        let id_val = id();
        let title_val = Some(title.get());
        let desc_val = Some(description.get());
        let cat_val = Some(category.get());
        let price_val: f64 = price_dollars.get().parse().unwrap_or(0.0);
        let price_cents = Some((price_val * 100.0).round() as i32);
        let lic_val = Some(license.get());
        let ext_link = {
            let l = external_link.get();
            if l.is_empty() { None } else { Some(l) }
        };
        let status_val = Some(status.get());
        let tags_val = Some(tags_str.get());

        leptos::task::spawn_local(async move {
            match update_listing(
                id_val.clone(),
                title_val,
                desc_val,
                cat_val,
                price_cents,
                lic_val,
                ext_link,
                status_val,
                tags_val,
            ).await {
                Ok(_) => {
                    let nav = use_navigate();
                    nav(&format!("/listings/{}", id_val), Default::default());
                },
                Err(e) => set_error.set(e.to_string()),
            }
            set_loading.set(false);
        });
    };

    let confirm_delete = move |_| {
        let id_val = id();
        set_error.set(String::new());
        set_loading.set(true);
        leptos::task::spawn_local(async move {
            match delete_listing(id_val).await {
                Ok(_) => {
                    let nav = use_navigate();
                    nav("/listings", Default::default());
                },
                Err(e) => {
                    set_error.set(e.to_string());
                    set_show_delete_modal.set(false);
                }
            }
            set_loading.set(false);
        });
    };

    view! {
        <div class="container">
            <Show when=move || show_delete_modal.get()>
                <div class="modal-overlay">
                    <div class="modal animate-fade-in-up">
                        <div class="modal-header">
                            <h3 class="modal-title">"Confirm Deletion"</h3>
                            <button type="button" class="text-secondary hover:text-primary" on:click=move |_| set_show_delete_modal.set(false)>"✕"</button>
                        </div>
                        <div class="modal-body">
                            <p class="text-secondary">
                                "Are you sure you want to permanently delete this listing? This action cannot be undone."
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" on:click=move |_| set_show_delete_modal.set(false)>"Cancel"</button>
                            <button type="button" class="btn btn-danger" on:click=confirm_delete>"Yes, Delete Permanently"</button>
                        </div>
                    </div>
                </div>
            </Show>

            <div class="listing-form-container animate-fade-in-up">
                <div class="listing-form-header">
                    <h1>"Edit Listing"</h1>
                </div>

                <Show when=move || !error.get().is_empty()>
                    <div class="alert alert-error">{move || error.get()}</div>
                </Show>

                <Suspense fallback=move || view! {
                    <div class="card" style="padding: var(--space-10);">
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text"></div>
                    </div>
                }>
                    {move || listing_resource.get().map(|res| match res {
                        Ok(listing) => {
                            let auth_uid = auth.user.get().map(|u| u.id);
                            if auth_uid != Some(listing.seller_id) {
                                return view! {
                                    <div class="alert alert-error">"You don't have permission to edit this listing."</div>
                                }.into_any();
                            }

                            view! {
                                <form class="listing-form" on:submit=on_submit>
                                    <div class="form-group">
                                        <label class="form-label">"Title"</label>
                                        <input type="text" required class="form-input"
                                            on:input=move |ev| set_title.set(event_target_value(&ev))
                                            value=move || title.get()/>
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">"Description"</label>
                                        <textarea required class="form-textarea" rows="6"
                                            on:input=move |ev| set_description.set(event_target_value(&ev))
                                            >{move || description.get()}</textarea>
                                    </div>

                                    <div class="grid grid-2" style="gap: var(--space-4);">
                                        <div class="form-group">
                                            <label class="form-label">"Category"</label>
                                            <input type="text" required class="form-input"
                                                on:input=move |ev| set_category.set(event_target_value(&ev))
                                                value=move || category.get()/>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">"Price ($ USD)"</label>
                                            <input type="number" step="0.01" min="0" required class="form-input"
                                                on:input=move |ev| set_price_dollars.set(event_target_value(&ev))
                                                value=move || price_dollars.get()/>
                                        </div>
                                    </div>

                                    <div class="grid grid-2" style="gap: var(--space-4);">
                                        <div class="form-group">
                                            <label class="form-label">"License"</label>
                                            <select class="form-select"
                                                on:change=move |ev| set_license.set(event_target_value(&ev))>
                                                <option value="mit" selected=move || license.get() == "mit">"MIT"</option>
                                                <option value="apache20" selected=move || license.get() == "apache20">"Apache 2.0"</option>
                                                <option value="gpl3" selected=move || license.get() == "gpl3">"GPLv3"</option>
                                                <option value="ccby40" selected=move || license.get() == "ccby40">"CC-BY-4.0"</option>
                                                <option value="proprietary" selected=move || license.get() == "proprietary">"Proprietary"</option>
                                                <option value="other" selected=move || license.get() == "other">"Other"</option>
                                            </select>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">"External Link (Optional)"</label>
                                            <input type="url" class="form-input"
                                                on:input=move |ev| set_external_link.set(event_target_value(&ev))
                                                value=move || external_link.get()/>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">"Tags (comma-separated)"</label>
                                        <input type="text" class="form-input"
                                            on:input=move |ev| set_tags_str.set(event_target_value(&ev))
                                            value=move || tags_str.get()/>
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">"Status"</label>
                                        <div class="form-radio-group">
                                            <label class=move || if status.get() == "active" { "form-radio-item selected" } else { "form-radio-item" }>
                                                <input type="radio" name="status"
                                                    checked=move || status.get() == "active"
                                                    on:change=move |_| set_status.set("active".to_string())/>
                                                "Active"
                                            </label>
                                            <label class=move || if status.get() == "draft" { "form-radio-item selected" } else { "form-radio-item" }>
                                                <input type="radio" name="status"
                                                    checked=move || status.get() == "draft"
                                                    on:change=move |_| set_status.set("draft".to_string())/>
                                                "Draft"
                                            </label>
                                        </div>
                                    </div>

                                    <div class="listing-form-actions" style="justify-content: space-between;">
                                        <button type="button" on:click=move |_| set_show_delete_modal.set(true) class="btn btn-danger">
                                            "Delete Listing"
                                        </button>
                                        <div class="flex gap-4">
                                            <a href=format!("/listings/{}", listing.id) class="btn btn-secondary">"Cancel"</a>
                                            <button type="submit" disabled=move || loading.get() class="btn btn-primary btn-lg">
                                                <Show when=move || loading.get() fallback=|| view! { "Save Changes" }>
                                                    "Saving..."
                                                </Show>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            }.into_any()
                        },
                        Err(e) => view! {
                            <div class="alert alert-error">{e.to_string()}</div>
                        }.into_any(),
                    })}
                </Suspense>
            </div>
        </div>
    }
}
