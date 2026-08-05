use leptos::prelude::*;
use leptos_router::hooks::use_navigate;
use crate::server_fns::auth::login;
use crate::app::AuthContext;

#[component]
pub fn LoginPage() -> impl IntoView {
    let auth = expect_context::<AuthContext>();
    // Redirect if already logged in
    Effect::new(move || {
        if auth.user.get().is_some() {
            let nav = use_navigate();
            nav("/", Default::default());
        }
    });

    let (email, set_email) = signal(String::new());
    let (password, set_password) = signal(String::new());
    let (error, set_error) = signal(String::new());
    let (loading, set_loading) = signal(false);

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        set_loading.set(true);
        set_error.set(String::new());
        
        let email_val = email.get();
        let password_val = password.get();

        leptos::task::spawn_local(async move {
            match login(email_val, password_val).await {
                Ok(user) => {
                    auth.set_user.set(Some(user));
                    let nav = use_navigate();
                    nav("/", Default::default());
                },
                Err(e) => set_error.set(e.to_string()),
            }
            set_loading.set(false);
        });
    };

    view! {
        <div class="auth-container animate-fade-in-up">
            <div class="auth-card">
                <div class="auth-header">
                    <h2 class="auth-title">"Sign in to your account"</h2>
                    <p class="auth-subtitle">"Welcome back to Bin Bag AI Marketplace"</p>
                </div>
                
                <Show when=move || !error.get().is_empty()>
                    <div class="alert alert-error">
                        {error.get()}
                    </div>
                </Show>

                <form class="auth-form" on:submit=on_submit>
                    <div class="form-group">
                        <label for="email" class="form-label">"Email address"</label>
                        <input
                            id="email"
                            type="email"
                            required
                            class="form-input"
                            placeholder="you@example.com"
                            on:input=move |ev| set_email.set(event_target_value(&ev))
                            prop:value=email
                        />
                    </div>
                    <div class="form-group">
                        <label for="password" class="form-label">"Password"</label>
                        <input
                            id="password"
                            type="password"
                            required
                            class="form-input"
                            placeholder="••••••••"
                            on:input=move |ev| set_password.set(event_target_value(&ev))
                            prop:value=password
                        />
                    </div>

                    <button
                        type="submit"
                        disabled=move || loading.get()
                        class="btn btn-primary w-full"
                    >
                        <Show when=move || loading.get() fallback=|| view! { "Sign in" }>
                            "Signing in..."
                        </Show>
                    </button>
                </form>
                
                <div class="auth-footer">
                    "Don't have an account? "
                    <a href="/signup">"Sign up"</a>
                </div>
            </div>
        </div>
    }
}
