use leptos::prelude::*;
use bin_bag_core::models::search::{CrossContentSearchResult, SearchQuery, SearchResultItem};

#[server(GlobalSearch)]
pub async fn global_search(
    query: SearchQuery,
) -> Result<CrossContentSearchResult, ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::models::listing::{Listing, ListingWithTags};
    use bin_bag_core::models::community::ThreadWithAuthor;
    use bin_bag_core::models::news::NewsArticle;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let q_trimmed = query.q.trim();
    let q_like = format!("%{}%", q_trimmed);
    let is_q_empty = q_trimmed.is_empty();

    let content_type = query.content_type.as_deref().unwrap_or("all").to_lowercase();
    let search_listings = content_type == "all" || content_type == "listings";
    let search_threads = content_type == "all" || content_type == "threads";
    let search_news = content_type == "all" || content_type == "news";

    let l_type = query.listing_type.as_deref().unwrap_or("");
    let l_cat = query.category.as_deref().unwrap_or("");
    let l_min_price = query.min_price_cents.unwrap_or(0);
    let l_max_price = query.max_price_cents.unwrap_or(0);
    let l_license = query.license.as_deref().unwrap_or("");
    let limit = query.limit.unwrap_or(30) as i64;

    let mut items = Vec::new();
    let mut listings_count = 0;
    let mut threads_count = 0;
    let mut news_count = 0;

    if search_listings {
        let listings = sqlx::query_as::<_, Listing>(
            r#"
            SELECT *
            FROM listings
            WHERE status = 'active'
              AND ($1 = true OR title ILIKE $2 OR description ILIKE $2 OR category ILIKE $2)
              AND ($3 = '' OR listing_type::text ILIKE $3)
              AND ($4 = '' OR category ILIKE $4)
              AND ($5 = 0 OR price_cents >= $5)
              AND ($6 = 0 OR price_cents <= $6)
              AND ($7 = '' OR license::text ILIKE $7)
            ORDER BY created_at DESC
            LIMIT $8
            "#,
        )
        .bind(is_q_empty)
        .bind(&q_like)
        .bind(l_type)
        .bind(l_cat)
        .bind(l_min_price)
        .bind(l_max_price)
        .bind(l_license)
        .bind(limit)
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;

        for l in listings {
            // Fetch tags
            let tag_rows = sqlx::query(
                r#"
                SELECT t.name
                FROM tags t
                JOIN listing_tags lt ON lt.tag_id = t.id
                WHERE lt.listing_id = $1
                "#,
            )
            .bind(l.id)
            .fetch_all(&state.db)
            .await
            .unwrap_or_default();

            let tags = tag_rows
                .iter()
                .filter_map(|r| sqlx::Row::try_get::<String, _>(r, "name").ok())
                .collect::<Vec<_>>();

            let l_with_tags = ListingWithTags {
                id: l.id,
                seller_id: l.seller_id,
                listing_type: l.listing_type,
                title: l.title,
                description: l.description,
                category: l.category,
                price_cents: l.price_cents,
                license: l.license,
                external_link: l.external_link,
                status: l.status,
                created_at: l.created_at,
                updated_at: l.updated_at,
                tags,
                rating_avg: None,
                review_count: 0,
            };
            items.push(SearchResultItem::Listing(l_with_tags));
            listings_count += 1;
        }
    }

    if search_threads {
        #[derive(sqlx::FromRow)]
        struct ThreadRow {
            id: uuid::Uuid,
            user_id: uuid::Uuid,
            listing_id: Option<uuid::Uuid>,
            thread_type: bin_bag_core::models::community::ThreadType,
            title: String,
            content: String,
            tags: Vec<String>,
            upvote_count: i32,
            created_at: chrono::DateTime<chrono::Utc>,
            updated_at: chrono::DateTime<chrono::Utc>,
            author_username: String,
            author_role: String,
            author_avatar_url: Option<String>,
            reply_count: i64,
        }

        let threads = sqlx::query_as::<_, ThreadRow>(
            r#"
            SELECT t.*,
                   u.username AS author_username,
                   u.role::text AS author_role,
                   u.avatar_url AS author_avatar_url,
                   (SELECT count(*) FROM thread_replies r WHERE r.thread_id = t.id)::bigint AS reply_count
            FROM threads t
            JOIN users u ON u.id = t.user_id
            WHERE ($1 = true OR t.title ILIKE $2 OR t.content ILIKE $2)
            ORDER BY t.created_at DESC
            LIMIT $3
            "#,
        )
        .bind(is_q_empty)
        .bind(&q_like)
        .bind(limit)
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;

        for tr in threads {
            let t_model = bin_bag_core::models::community::Thread {
                id: tr.id,
                user_id: tr.user_id,
                listing_id: tr.listing_id,
                thread_type: tr.thread_type,
                title: tr.title,
                content: tr.content,
                tags: tr.tags,
                upvote_count: tr.upvote_count,
                created_at: tr.created_at,
                updated_at: tr.updated_at,
            };
            let tw = ThreadWithAuthor {
                thread: t_model,
                author_username: tr.author_username,
                author_role: tr.author_role,
                author_avatar_url: tr.author_avatar_url,
                reply_count: tr.reply_count,
                user_has_upvoted: false,
                listing_title: None,
            };
            items.push(SearchResultItem::Thread(tw));
            threads_count += 1;
        }
    }

    if search_news {
        let articles = sqlx::query_as::<_, NewsArticle>(
            r#"
            SELECT id, title, url, source_name, summary, published_at, created_at
            FROM news_articles
            WHERE ($1 = true OR title ILIKE $2 OR summary ILIKE $2 OR source_name ILIKE $2)
            ORDER BY published_at DESC
            LIMIT $3
            "#,
        )
        .bind(is_q_empty)
        .bind(&q_like)
        .bind(limit)
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;

        for a in articles {
            items.push(SearchResultItem::News(a));
            news_count += 1;
        }
    }

    let total_count = listings_count + threads_count + news_count;

    Ok(CrossContentSearchResult {
        query: query.q,
        items,
        total_count,
        listings_count,
        threads_count,
        news_count,
    })
}
