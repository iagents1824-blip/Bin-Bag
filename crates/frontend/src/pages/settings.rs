use leptos::prelude::*;
use leptos_router::hooks::use_navigate;
use crate::app::AuthContext;
use crate::server_fns::auth::update_profile;

#[component]
pub fn SettingsPage() -> impl IntoView {
    let auth = expect_context::<AuthContext>();
    let navigate = use_navigate();

    Effect::new(move || {
        if auth.user.get().is_none() {
            navigate("/login", Default::default());
        }
    });

    let (display_name, set_display_name) = signal(String::new());
    let (bio, set_bio) = signal(String::new());
    let (avatar_url, set_avatar_url) = signal(String::new());
    
    // Initialize form with current user data
    Effect::new(move || {
        if let Some(user) = auth.user.get() {
            set_display_name.set(user.display_name.unwrap_or_default());
            set_bio.set(user.bio.unwrap_or_default());
            set_avatar_url.set(user.avatar_url.unwrap_or_default());
        }
    });

    let (error, set_error) = signal(String::new());
    let (success, set_success) = signal(false);
    let (loading, set_loading) = signal(false);

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        set_loading.set(true);
        set_error.set(String::new());
        set_success.set(false);

        let dn_val = {
            let s = display_name.get();
            if s.is_empty() { None } else { Some(s) }
        };
        let bio_val = {
            let s = bio.get();
            if s.is_empty() { None } else { Some(s) }
        };
        let av_val = {
            let s = avatar_url.get();
            if s.is_empty() { None } else { Some(s) }
        };

        leptos::task::spawn_local(async move {
            match update_profile(dn_val, bio_val, av_val).await {
                Ok(user) => {
                    auth.set_user.set(Some(user));
                    set_success.set(true);
                },
                Err(e) => set_error.set(e.to_string()),
            }
            set_loading.set(false);
        });
    };

    view! {
        <div class="settings-container container mt-8 mb-8 max-w-2xl animate-fade-in-up">
            <h1 class="text-3xl font-bold mb-8">"Account Settings"</h1>
            
            <Show when=move || !error.get().is_empty()>
                <div class="alert alert-error mb-6">
                    {error.get()}
                </div>
            </Show>

            <Show when=move || success.get()>
                <div class="alert alert-success mb-6">
                    "Profile updated successfully!"
                </div>
            </Show>

            <form class="card p-8 space-y-6" on:submit=on_submit>
                <div class="form-group">
                    <label class="form-label">"Display Name"</label>
                    <input type="text" class="form-input" 
                        placeholder="John Doe"
                        on:input=move |ev| set_display_name.set(event_target_value(&ev)) prop:value=display_name />
                </div>

                <div class="form-group">
                    <label class="form-label">"Bio"</label>
                    <textarea rows="4" class="form-textarea"
                        placeholder="Tell us about yourself..."
                        on:input=move |ev| set_bio.set(event_target_value(&ev)) prop:value=bio></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">"Avatar URL"</label>
                    <input type="url" class="form-input"
                        placeholder="https://example.com/avatar.png"
                        on:input=move |ev| set_avatar_url.set(event_target_value(&ev)) prop:value=avatar_url />
                </div>

                <div class="pt-4 flex justify-end">
                    <button type="submit" disabled=move || loading.get() class="btn btn-primary">
                        <Show when=move || loading.get() fallback=|| view! { "Save Changes" }>
                            "Saving..."
                        </Show>
                    </button>
                </div>
            </form>
        </div>
    }
}
