use leptos::prelude::*;
use bin_bag_core::models::news::NewsArticle;

#[component]
pub fn NewsCard(
    article: NewsArticle,
) -> impl IntoView {
    let title = article.title.clone();
    let url = article.url.clone();
    let source_name = article.source_name.clone();
    let summary = article.summary.clone();
    let pub_date = article.published_at.format("%B %d, %Y • %H:%M UTC").to_string();

    view! {
        <article class="news-card card p-5 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                        {source_name}
                    </span>
                    <span class="text-xs text-muted">
                        {pub_date}
                    </span>
                </div>
                <h3 class="text-lg font-bold text-foreground mb-2 leading-snug">
                    <a
                        href=url.clone()
                        target="_blank"
                        rel="noopener noreferrer"
                        class="hover:text-primary transition-colors flex items-center gap-1.5 group"
                    >
                        <span>{title}</span>
                        <span class="text-sm opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                            "↗"
                        </span>
                    </a>
                </h3>
                <p class="text-sm text-muted line-clamp-3 leading-relaxed">
                    {summary}
                </p>
            </div>
            <div class="mt-4 pt-3 border-t border-border/50 flex items-center justify-end">
                <a
                    href=url
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                    "Read full article"
                    <span>"→"</span>
                </a>
            </div>
        </article>
    }
}
