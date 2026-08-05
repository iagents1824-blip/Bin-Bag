use leptos::prelude::*;
use bin_bag_core::models::listing::ListingType;
use crate::components::listing_card::ListingCard;
use crate::server_fns::listings::list_listings;

#[component]
pub fn ListingBrowse() -> impl IntoView {
    let (selected_type, set_selected_type) = signal(None::<ListingType>);
    let (category, set_category) = signal(String::new());
    let (tag, set_tag) = signal(String::new());
    let (cursor, set_cursor) = signal(None::<String>);
    
    let type_filter = move || {
        selected_type.get().map(|t| t.to_string().to_lowercase())
    };

    let cat_filter = move || {
        let c = category.get();
        if c.is_empty() { None } else { Some(c) }
    };

    let tag_filter = move || {
        let t = tag.get();
        if t.is_empty() { None } else { Some(t) }
    };

    let listings_resource = Resource::new(
        move || (type_filter(), cat_filter(), tag_filter(), cursor.get()),
        |(t, c, tag, cur)| async move {
            list_listings(t, c, tag, None, cur, Some(20)).await
        },
    );

    let types = vec![ListingType::Model, ListingType::Chatbot, ListingType::Assistant, ListingType::Workflow, ListingType::Prompt, ListingType::Dataset];

    view! {
        <div class="browse-layout container mt-8 mb-8 animate-fade-in">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h3 class="font-bold text-lg">"Filters"</h3>
                    <button 
                        class="btn btn-ghost btn-xs text-secondary"
                        on:click=move |_| {
                            set_selected_type.set(None);
                            set_category.set(String::new());
                            set_tag.set(String::new());
                        }
                    >
                        "Reset All"
                    </button>
                </div>

                <div class="filter-group">
                    <h4 class="filter-title">"Asset Type"</h4>
                    <div class="flex flex-col gap-2 mt-2">
                        <label class="form-radio-item cursor-pointer">
                            <input
                                type="radio"
                                name="type_filter"
                                checked=move || selected_type.get().is_none()
                                on:change=move |_| set_selected_type.set(None)
                            />
                            <span>"All Types"</span>
                        </label>
                        <For
                            each=move || types.clone()
                            key=|t| format!("{:?}", t)
                            let:t_item
                        >
                            <label class="form-radio-item cursor-pointer">
                                <input
                                    type="radio"
                                    name="type_filter"
                                    checked=move || selected_type.get() == Some(t_item.clone())
                                    on:change=move |_| set_selected_type.set(Some(t_item.clone()))
                                />
                                <span>{t_item.to_string()}</span>
                            </label>
                        </For>
                    </div>
                </div>

                <div class="filter-group">
                    <h4 class="filter-title">"Category"</h4>
                    <input
                        type="text"
                        class="form-input mt-2"
                        placeholder="e.g. LLM, Vision, NLP..."
                        prop:value=category
                        on:input=move |ev| set_category.set(event_target_value(&ev))
                    />
                </div>

                <div class="filter-group">
                    <h4 class="filter-title">"Tag"</h4>
                    <input
                        type="text"
                        class="form-input mt-2"
                        placeholder="e.g. pytorch, gpt..."
                        prop:value=tag
                        on:input=move |ev| set_tag.set(event_target_value(&ev))
                    />
                </div>
            </aside>

            <main class="browse-main flex-1">
                <div class="section-header mb-6">
                    <div>
                        <h1 class="text-3xl font-extrabold">"Explore AI Assets"</h1>
                        <p class="text-secondary mt-1">"Discover top-tier models, prompts, workflows, and datasets."</p>
                    </div>
                </div>

                <Suspense fallback=move || view! { <div class="text-center py-12 text-tertiary">"Loading listings..."</div> }>
                    {move || listings_resource.get().map(|result| match result {
                        Ok(data) => {
                            if data.items.is_empty() {
                                view! {
                                    <div class="text-center py-16 bg-card border border-border rounded-xl">
                                        <div class="text-4xl mb-3">"🔍"</div>
                                        <h3 class="text-lg font-bold">"No listings matched your criteria"</h3>
                                        <p class="text-secondary mt-1 text-sm">"Try clearing your filters or searching for something else."</p>
                                    </div>
                                }.into_any()
                            } else {
                                let next_cursor = data.next_cursor.clone();
                                view! {
                                    <div class="flex flex-col gap-8">
                                        <div class="grid grid-listings stagger-children">
                                            <For
                                                each=move || data.items.clone()
                                                key=|item| item.id.clone()
                                                let:item
                                            >
                                                <ListingCard listing=item />
                                            </For>
                                        </div>

                                        {next_cursor.map(|cursor| {
                                            view! {
                                                <div class="text-center mt-6">
                                                    <button
                                                        class="btn btn-secondary px-8"
                                                        on:click=move |_| set_cursor.set(Some(cursor.clone()))
                                                    >
                                                        "Load More"
                                                    </button>
                                                </div>
                                            }
                                        })}
                                    </div>
                                }.into_any()
                            }
                        }
                        Err(e) => view! {
                            <div class="alert alert-error">{format!("Failed to load listings: {}", e)}</div>
                        }.into_any()
                    })}
                </Suspense>
            </main>
        </div>
    }
}
