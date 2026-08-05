use leptos::prelude::*;
use bin_bag_core::models::review::{
    Review, ReviewWithBuyer,
};
use bin_bag_core::models::listing::PaginatedResult;

#[server(CreateReview, "/api")]
pub async fn create_review(
    listing_id: String,
    rating: i32,
    comment: String,
) -> Result<ReviewWithBuyer, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use uuid::Uuid;

    #[derive(sqlx::FromRow)]
    struct OrderIdRow {
        id: Uuid,
    }

    if !(1..=5).contains(&rating) {
        return Err(ServerFnError::new("Rating must be between 1 and 5"));
    }
    let comment_trimmed = comment.trim();
    if comment_trimmed.is_empty() {
        return Err(ServerFnError::new("Review comment cannot be empty"));
    }

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to review"))?;
    let buyer_id = user.id;
    let listing_id_uuid = Uuid::parse_str(&listing_id)
        .map_err(|e| ServerFnError::new(format!("Invalid listing UUID: {}", e)))?;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    // 1. Check verified purchase
    let order_row = sqlx::query_as::<_, OrderIdRow>(
        "SELECT id FROM orders WHERE buyer_id = $1 AND listing_id = $2 AND status = 'completed' LIMIT 1"
    )
    .bind(buyer_id)
    .bind(listing_id_uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?
    .ok_or_else(|| ServerFnError::new("You must purchase this listing before reviewing"))?;

    let order_id = order_row.id;

    // 2. Insert or update review
    let review_id = Uuid::new_v4();
    let row = sqlx::query_as::<_, Review>(
        r#"
        INSERT INTO reviews (id, listing_id, buyer_id, order_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (listing_id, buyer_id)
        DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = NOW()
        RETURNING id, listing_id, buyer_id, order_id, rating, comment, created_at, updated_at
        "#
    )
    .bind(review_id)
    .bind(listing_id_uuid)
    .bind(buyer_id)
    .bind(order_id)
    .bind(rating)
    .bind(comment_trimmed)
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    Ok(ReviewWithBuyer {
        review: row,
        buyer_username: user.username.clone(),
        buyer_avatar_url: user.avatar_url.clone(),
    })
}

#[server(ListReviews, "/api")]
pub async fn list_reviews(
    listing_id: String,
    cursor: Option<String>,
    limit: Option<i64>,
) -> Result<PaginatedResult<ReviewWithBuyer>, ServerFnError> {
    use crate::state::AppState;
    use uuid::Uuid;
    use chrono::{DateTime, Utc};

    #[derive(sqlx::FromRow)]
    struct ReviewBuyerRow {
        id: Uuid,
        listing_id: Uuid,
        buyer_id: Uuid,
        order_id: Uuid,
        rating: i32,
        comment: String,
        created_at: DateTime<Utc>,
        updated_at: DateTime<Utc>,
        buyer_username: String,
        buyer_avatar_url: Option<String>,
    }

    let listing_id_uuid = Uuid::parse_str(&listing_id)
        .map_err(|e| ServerFnError::new(format!("Invalid listing UUID: {}", e)))?;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    let limit_val = limit.unwrap_or(20).clamp(1, 50);

    let rows = sqlx::query_as::<_, ReviewBuyerRow>(
        r#"
        SELECT 
            r.id, r.listing_id, r.buyer_id, r.order_id, r.rating, r.comment, r.created_at, r.updated_at,
            u.username as buyer_username, u.avatar_url as buyer_avatar_url
        FROM reviews r
        JOIN users u ON r.buyer_id = u.id
        WHERE r.listing_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2
        "#
    )
    .bind(listing_id_uuid)
    .bind(limit_val + 1)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    let mut items = Vec::new();
    let mut next_cursor = None;

    for (i, row) in rows.into_iter().enumerate() {
        if i as i64 == limit_val {
            next_cursor = Some(row.id.to_string());
            break;
        }
        let review = Review {
            id: row.id,
            listing_id: row.listing_id,
            buyer_id: row.buyer_id,
            order_id: row.order_id,
            rating: row.rating,
            comment: row.comment,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
        items.push(ReviewWithBuyer {
            review,
            buyer_username: row.buyer_username,
            buyer_avatar_url: row.buyer_avatar_url,
        });
    }

    Ok(PaginatedResult {
        items,
        next_cursor,
        total_estimate: None,
    })
}
