//! Footer component — simple footer with copyright and links.

use leptos::prelude::*;

#[component]
pub fn Footer() -> impl IntoView {
    view! {
        <footer class="footer">
            <div class="container footer-inner">
                <p class="footer-text">"© 2026 Bin Bag. The AI Marketplace."</p>
                <div class="footer-links">
                    <a href="/listings" class="footer-link">"Browse"</a>
                    <a href="/signup" class="footer-link">"Get Started"</a>
                </div>
            </div>
        </footer>
    }
}
