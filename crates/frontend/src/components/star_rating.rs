use leptos::prelude::*;

#[component]
pub fn StarRating(
    #[prop(default = 0.0)] rating: f64,
    #[prop(default = 5)] max_stars: usize,
    #[prop(default = false)] interactive: bool,
    #[prop(optional)] on_select: Option<Callback<i32>>,
) -> impl IntoView {
    let stars = (1..=max_stars).map(|i| {
        let is_filled = (i as f64) <= rating.round();
        let star_class = if is_filled {
            "text-yellow-400 fill-current"
        } else {
            "text-gray-600 fill-current"
        };
        let star_val = i as i32;
        let on_click = move |_| {
            if interactive {
                if let Some(cb) = &on_select {
                    cb.run(star_val);
                }
            }
        };

        view! {
            <span
                class=format!("inline-block {} {}", star_class, if interactive { "cursor-pointer hover:scale-110 transition-transform" } else { "" })
                on:click=on_click
            >
                "★"
            </span>
        }
    }).collect::<Vec<_>>();

    view! {
        <div class="inline-flex items-center space-x-1 text-lg">
            {stars}
        </div>
    }
}
