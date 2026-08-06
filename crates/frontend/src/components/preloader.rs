use leptos::prelude::*;
use leptos_meta::Body;

#[component]
pub fn Preloader() -> impl IntoView {
    let (is_visible, set_is_visible) = signal(true);
    let (is_fading, set_is_fading) = signal(false);

    let on_video_end = move |_| {
        set_is_fading.set(true);
        set_timeout(
            move || set_is_visible.set(false),
            std::time::Duration::from_millis(800),
        );
    };

    Effect::new(move |_| {
        #[cfg(feature = "hydrate")]
        if let Some(window) = web_sys::window() {
            if let Some(document) = window.document() {
                if let Some(body) = document.body() {
                    if is_visible.get() {
                        let _ = body.class_list().add_1("no-scroll");
                    } else {
                        let _ = body.class_list().remove_1("no-scroll");
                    }
                }
            }
        }
    });

    view! {
        <Show when=move || is_visible.get()>
            <div class=move || format!("preloader-overlay {}", if is_fading.get() { "fade-out" } else { "" })>
                <video 
                    src="/preloader.mp4" 
                    autoplay=true 
                    muted=true 
                    playsinline=true 
                    on:ended=on_video_end
                    class="preloader-video"
                />
            </div>
        </Show>
    }
}
