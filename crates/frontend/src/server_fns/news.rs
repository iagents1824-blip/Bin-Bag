use leptos::prelude::*;
use bin_bag_core::models::news::{DailyDigest, NewsArticle};

#[server(GetDailyDigest, "/api")]
pub async fn get_daily_digest(
    date_str: Option<String>,
) -> Result<DailyDigest, ServerFnError> {
    use crate::state::AppState;
    use chrono::{DateTime, Utc};

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let target_date = match date_str {
        Some(ref d) if !d.is_empty() => d.clone(),
        _ => Utc::now().format("%Y-%m-%d").to_string(),
    };

    // Query articles published on the target date (UTC day)
    // Also if no articles on exact date and it's today, return most recent up to 15 items
    let articles = sqlx::query_as::<_, NewsArticle>(
        r#"
        SELECT id, title, url, source_name, summary, published_at, created_at
        FROM news_articles
        WHERE TO_CHAR(published_at, 'YYYY-MM-DD') = $1
        ORDER BY published_at DESC
        LIMIT 25
        "#,
    )
    .bind(&target_date)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    let mut result_articles = articles;
    if result_articles.is_empty() {
        // Fallback: return latest 15 articles so the daily digest page is never empty
        result_articles = sqlx::query_as::<_, NewsArticle>(
            r#"
            SELECT id, title, url, source_name, summary, published_at, created_at
            FROM news_articles
            ORDER BY published_at DESC
            LIMIT 15
            "#,
        )
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;
    }

    let total_count = result_articles.len();
    Ok(DailyDigest {
        date_str: target_date,
        articles: result_articles,
        total_count,
    })
}

#[server(ListNewsArchive, "/api")]
pub async fn list_news_archive(
    limit: Option<i64>,
) -> Result<Vec<NewsArticle>, ServerFnError> {
    use crate::state::AppState;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let limit_val = limit.unwrap_or(50).clamp(1, 100);

    let articles = sqlx::query_as::<_, NewsArticle>(
        r#"
        SELECT id, title, url, source_name, summary, published_at, created_at
        FROM news_articles
        ORDER BY published_at DESC
        LIMIT $1
        "#,
    )
    .bind(limit_val)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    Ok(articles)
}

#[server(TriggerNewsScrapeAdmin, "/api")]
pub async fn trigger_news_scrape_admin() -> Result<usize, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to trigger news scraping"))?;
    if user.role != UserRole::Admin {
        return Err(ServerFnError::new("Only admins can trigger manual RSS news scraping"));
    }

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    #[cfg(feature = "ssr")]
    {
        let count = bin_bag_worker::scraper::fetch_and_ingest_rss_feeds(&state.db)
            .await
            .map_err(|e| ServerFnError::new(e.to_string()))?;
        Ok(count)
    }
    #[cfg(not(feature = "ssr"))]
    {
        Err(ServerFnError::new("SSR required"))
    }
}
