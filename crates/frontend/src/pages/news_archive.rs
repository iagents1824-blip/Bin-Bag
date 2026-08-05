use leptos::prelude::*;
use crate::components::news_card::NewsCard;
use crate::server_fns::news::list_news_archive;

#[component]
pub fn NewsArchivePage() -> impl IntoView {
    let archive_resource = Resource::new(
        || (),
        |_| async move { list_news_archive(Some(50)).await },
    );

    view! {
        <div class="container py-8">
            <div class="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <a href="/news" class="text-xs text-primary hover:underline">
                            "← Back to Today's Digest"
                        </a>
                    </div>
                    <h1 class="text-3xl font-extrabold text-foreground tracking-tight">
                        "AI News Archive"
                    </h1>
                </div>
            </div>

            <Suspense fallback=move || view! {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    <div class="h-48 bg-card rounded-xl"></div>
                    <div class="h-48 bg-card rounded-xl"></div>
                    <div class="h-48 bg-card rounded-xl"></div>
                </div>
            }>
                {move || archive_resource.get().map(|res| match res {
                    Ok(articles) => {
                        if articles.is_empty() {
                            view! {
                                <div class="card p-12 text-center text-muted">
                                    <p class="text-base">"No historical news articles found."</p>
                                </div>
                            }.into_any()
                        } else {
                            view! {
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <For
                                        each=move || articles.clone()
                                        key=|a| a.id
                                        let:article
                                    >
                                        <NewsCard article=article />
                                    </For>
                                </div>
                            }.into_any()
                        }
                    }
                    Err(e) => view! {
                        <div class="alert alert-error">
                            {format!("Failed to load news archive: {}", e)}
                        </div>
                    }.into_any(),
                })}
            </Suspense>
        </div>
    }
}
