use leptos::prelude::*;
use bin_bag_core::models::trending::TrendingLeaderboardItem;

#[server(GetTrendingLeaderboard, "/api")]
pub async fn get_trending_leaderboard(
    limit: Option<i64>,
) -> Result<Vec<TrendingLeaderboardItem>, ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::models::listing::ListingWithTags;
    use bin_bag_core::models::trending::TrendingScoreRow;
    use bin_bag_core::models::user::{PublicUser, User, UserRole};

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let limit_val = limit.unwrap_or(20).clamp(1, 50);

    // Get latest calculation time
    let latest_time: Option<chrono::DateTime<chrono::Utc>> = sqlx::query_scalar(
        r#"
        SELECT MAX(calculated_at)
        FROM trending_scores
        "#,
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?
    .flatten();

    let scores: Vec<TrendingScoreRow> = if let Some(time_val) = latest_time {
        sqlx::query_as::<_, TrendingScoreRow>(
            r#"
            SELECT listing_id, rank, score, rank_change, calculated_at
            FROM trending_scores
            WHERE calculated_at = $1
            ORDER BY rank ASC
            LIMIT $2
            "#,
        )
        .bind(time_val)
        .bind(limit_val)
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?
    } else {
        // Automatically trigger calculation if no scores exist yet
        #[cfg(feature = "ssr")]
        {
            let _ = bin_bag_worker::trending_calc::recalculate_trending_scores(&state.db).await;
            sqlx::query_as::<_, TrendingScoreRow>(
                r#"
                SELECT listing_id, rank, score, rank_change, calculated_at
                FROM trending_scores
                ORDER BY rank ASC
                LIMIT $1
                "#,
            )
            .bind(limit_val)
            .fetch_all(&state.db)
            .await
            .unwrap_or_default()
        }
        #[cfg(not(feature = "ssr"))]
        {
            vec![]
        }
    };

    // If still empty, fall back to recent active listings
    if scores.is_empty() {
        let recent_listings = sqlx::query_as::<_, ListingWithTags>(
            r#"
            SELECT 
                l.id, l.seller_id, l.title, l.description,
                l.listing_type, l.category, l.price_cents,
                l.license, l.external_link, l.status,
                l.created_at, l.updated_at,
                COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as "tags: Vec<String>",
                (SELECT AVG(r.rating)::float8 FROM reviews r WHERE r.listing_id = l.id) as "rating_avg: Option<f64>",
                (SELECT COUNT(*)::bigint FROM reviews r WHERE r.listing_id = l.id) as "review_count: i64"
            FROM listings l
            LEFT JOIN listing_tags lt ON l.id = lt.listing_id
            LEFT JOIN tags t ON lt.tag_id = t.id
            WHERE l.status = 'active'
            GROUP BY l.id
            ORDER BY l.created_at DESC
            LIMIT $1
            "#,
        )
        .bind(limit_val)
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;

        let mut items = Vec::new();
        for (idx, lst) in recent_listings.into_iter().enumerate() {
            let user_res: Result<User, _> = sqlx::query_as(
                r#"
                SELECT *
                FROM users
                WHERE id = $1
                "#,
            )
            .bind(lst.seller_id)
            .fetch_one(&state.db)
            .await;

            let seller: PublicUser = match user_res {
                Ok(u) => PublicUser::from(u),
                Err(_) => PublicUser {
                    id: lst.seller_id,
                    email: String::new(),
                    username: "unknown".to_string(),
                    display_name: Some("Unknown Seller".to_string()),
                    role: UserRole::Seller,
                    avatar_url: None,
                    bio: None,
                    created_at: lst.created_at,
                    updated_at: lst.created_at,
                },
            };

            items.push(TrendingLeaderboardItem {
                rank: (idx + 1) as i32,
                rank_change: 999, // NEW
                score: 50.0 - (idx as f64 * 2.0),
                listing: lst,
                seller_username: seller.username,
                seller_avatar_url: seller.avatar_url,
                seller_role: seller.role,
            });
        }
        return Ok(items);
    }

    let mut items = Vec::with_capacity(scores.len());
    for s in scores {
        let lst_opt = sqlx::query_as::<_, ListingWithTags>(
            r#"
            SELECT 
                l.id, l.seller_id, l.title, l.description,
                l.listing_type, l.category, l.price_cents,
                l.license, l.external_link, l.status,
                l.created_at, l.updated_at,
                COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as "tags: Vec<String>",
                (SELECT AVG(r.rating)::float8 FROM reviews r WHERE r.listing_id = l.id) as "rating_avg: Option<f64>",
                (SELECT COUNT(*)::bigint FROM reviews r WHERE r.listing_id = l.id) as "review_count: i64"
            FROM listings l
            LEFT JOIN listing_tags lt ON l.id = lt.listing_id
            LEFT JOIN tags t ON lt.tag_id = t.id
            WHERE l.id = $1
            GROUP BY l.id
            "#,
        )
        .bind(s.listing_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;

        if let Some(lst) = lst_opt {
            let user_res: Result<User, _> = sqlx::query_as(
                r#"
                SELECT *
                FROM users
                WHERE id = $1
                "#,
            )
            .bind(lst.seller_id)
            .fetch_one(&state.db)
            .await;

            let seller: PublicUser = match user_res {
                Ok(u) => PublicUser::from(u),
                Err(_) => PublicUser {
                    id: lst.seller_id,
                    email: String::new(),
                    username: "unknown".to_string(),
                    display_name: Some("Unknown Seller".to_string()),
                    role: UserRole::Seller,
                    avatar_url: None,
                    bio: None,
                    created_at: lst.created_at,
                    updated_at: lst.created_at,
                },
            };

            items.push(TrendingLeaderboardItem {
                rank: s.rank,
                rank_change: s.rank_change,
                score: s.score,
                listing: lst,
                seller_username: seller.username,
                seller_avatar_url: seller.avatar_url,
                seller_role: seller.role,
            });
        }
    }

    Ok(items)
}

#[server(RecalculateTrendingAdmin, "/api")]
pub async fn recalculate_trending_admin() -> Result<usize, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to recalculate leaderboard"))?;
    if user.role != UserRole::Admin {
        return Err(ServerFnError::new("Only admins can trigger leaderboard recalculation"));
    }

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    #[cfg(feature = "ssr")]
    {
        let count = bin_bag_worker::trending_calc::recalculate_trending_scores(&state.db)
            .await
            .map_err(|e| ServerFnError::new(e.to_string()))?;
        Ok(count)
    }
    #[cfg(not(feature = "ssr"))]
    {
        Err(ServerFnError::new("SSR required"))
    }
}
