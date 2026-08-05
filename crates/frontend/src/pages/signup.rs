use leptos::prelude::*;
use leptos_router::hooks::use_navigate;
use crate::server_fns::auth::signup;
use crate::app::AuthContext;
use bin_bag_core::models::user::UserRole;

#[component]
pub fn SignupPage() -> impl IntoView {
    let auth = expect_context::<AuthContext>();
    // Redirect if already logged in
    Effect::new(move || {
        if auth.user.get().is_some() {
            let nav = use_navigate();
            nav("/", Default::default());
        }
    });

    let (email, set_email) = signal(String::new());
    let (username, set_username) = signal(String::new());
    let (password, set_password) = signal(String::new());
    let (confirm_password, set_confirm_password) = signal(String::new());
    let (role, set_role) = signal(UserRole::Buyer);
    
    let (error, set_error) = signal(String::new());
    let (loading, set_loading) = signal(false);

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        
        let p = password.get();
        let cp = confirm_password.get();
        
        if p != cp {
            set_error.set("Passwords do not match".to_string());
            return;
        }
        if p.len() < 8 {
            set_error.set("Password must be at least 8 characters".to_string());
            return;
        }

        set_loading.set(true);
        set_error.set(String::new());
        
        let email_val = email.get();
        let username_val = username.get();
        let role_val = role.get();
        let role_str = match role_val {
            UserRole::Buyer => "buyer",
            UserRole::Seller => "seller",
            UserRole::Expert => "expert",
            UserRole::Admin => "admin",
        }.to_string();

        leptos::task::spawn_local(async move {
            match signup(email_val, username_val, p, role_str).await {
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
                    <h2 class="auth-title">"Create an account"</h2>
                    <p class="auth-subtitle">"Join the Bin Bag AI community today"</p>
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
                        <label for="username" class="form-label">"Username"</label>
                        <input
                            id="username"
                            type="text"
                            required
                            minlength="3"
                            class="form-input"
                            placeholder="johndoe"
                            on:input=move |ev| set_username.set(event_target_value(&ev))
                            prop:value=username
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
                    <div class="form-group">
                        <label for="confirm_password" class="form-label">"Confirm Password"</label>
                        <input
                            id="confirm_password"
                            type="password"
                            required
                            class="form-input"
                            placeholder="••••••••"
                            on:input=move |ev| set_confirm_password.set(event_target_value(&ev))
                            prop:value=confirm_password
                        />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">"I want to..."</label>
                        <div class="form-radio-group">
                            <label class=move || if role.get() == UserRole::Buyer { "form-radio-item selected" } else { "form-radio-item" }>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    checked=move || role.get() == UserRole::Buyer
                                    on:change=move |_| set_role.set(UserRole::Buyer)
                                />
                                <span>"Buy items"</span>
                            </label>
                            <label class=move || if role.get() == UserRole::Seller { "form-radio-item selected" } else { "form-radio-item" }>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    checked=move || role.get() == UserRole::Seller
                                    on:change=move |_| set_role.set(UserRole::Seller)
                                />
                                <span>"Sell items"</span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled=move || loading.get()
                        class="btn btn-primary w-full"
                    >
                        <Show when=move || loading.get() fallback=|| view! { "Sign up" }>
                            "Creating account..."
                        </Show>
                    </button>
                </form>
                
                <div class="auth-footer">
                    "Already have an account? "
                    <a href="/login">"Sign in"</a>
                </div>
            </div>
        </div>
    }
}
