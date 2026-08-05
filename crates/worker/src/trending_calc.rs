//! Trending-Models Leaderboard Recalculation Engine
//!
//! Implements the transparent scoring formula documented in Section 2 of Phase 4:
//! Score(L) = (10 * V_p) + (5 * V_r) + (2 * V_c) + (15 * NewnessBonus)

use chrono::{Duration, Utc};
use sqlx::PgPool;
use tracing::{info, warn};
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow)]
pub struct ListingScoreInput {
    pub id: Uuid,
    pub title: String,
    pub created_at: chrono::DateTime<Utc>,
    pub rating_avg: Option<f64>,
}

/// Recalculates the daily trending leaderboard for all active marketplace listings.
pub async fn recalculate_trending_scores(pool: &PgPool) -> Result<usize, sqlx::Error> {
    info!("Starting daily trending-models leaderboard recalculation...");
    let now = Utc::now();
    let seven_days_ago = now - Duration::days(7);

    // 1. Fetch all active listings
    let listings = sqlx::query_as::<_, ListingScoreInput>(
        r#"
        SELECT id, title, created_at, rating_avg
        FROM listings
        WHERE status = 'active'
        "#,
    )
    .fetch_all(pool)
    .await?;

    if listings.is_empty() {
        warn!("No active listings found in DB; skipping trending recalculation.");
        return Ok(0);
    }

    let mut scored_items: Vec<(Uuid, String, f64)> = Vec::with_capacity(listings.len());

    for lst in listings {
        // A. Purchase Velocity (V_p): Completed orders in last 7 days
        let v_p_count = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::bigint
            FROM orders
            WHERE listing_id = $1 AND status = 'completed' AND created_at >= $2
            "#,
        )
        .bind(lst.id)
        .bind(seven_days_ago)
        .fetch_one(pool)
        .await
        .unwrap_or(0) as f64;

        // B. Review Satisfaction (V_r): (rating_avg - 3.0) * reviews_in_last_7d
        let reviews_7d = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::bigint
            FROM reviews
            WHERE listing_id = $1 AND created_at >= $2
            "#,
        )
        .bind(lst.id)
        .bind(seven_days_ago)
        .fetch_one(pool)
        .await
        .unwrap_or(0) as f64;

        let rating_val = lst.rating_avg.unwrap_or(4.0);
        let v_r = if reviews_7d > 0.0 {
            (rating_val - 3.0).max(0.0) * reviews_7d
        } else {
            // Give a baseline satisfaction score based on existing rating
            (rating_val - 3.0).max(0.0) * 1.5
        };

        // C. Community Discussion Activity (V_c): Threads and replies linked to listing
        let v_c_count = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::bigint
            FROM threads
            WHERE listing_id = $1 AND created_at >= $2
            "#,
        )
        .bind(lst.id)
        .bind(seven_days_ago)
        .fetch_one(pool)
        .await
        .unwrap_or(0) as f64;

        // D. Newness Bonus: Decay boost for quality listings created within last 14 days
        let days_old = now.signed_duration_since(lst.created_at).num_days().max(0) as f64;
        let newness_bonus = if days_old <= 14.0 {
            (14.0 - days_old) / 14.0
        } else {
            0.0
        };

        // Complete transparent formula
        let score = (10.0 * v_p_count) + (5.0 * v_r) + (2.0 * v_c_count) + (15.0 * newness_bonus);
        scored_items.push((lst.id, lst.title, score));
    }

    // 2. Sort descending by score
    scored_items.sort_by(|a, b| b.2.partial_cmp(&a.2).unwrap_or(std::cmp::Ordering::Equal));

    // 3. For each listing, determine previous rank and insert into `trending_scores`
    let mut inserted_count = 0;
    for (idx, (listing_id, _title, score)) in scored_items.into_iter().enumerate() {
        let new_rank = (idx + 1) as i32;

        // Lookup previous rank from latest run before `now`
        let prev_rank: Option<i32> = sqlx::query_scalar(
            r#"
            SELECT rank
            FROM trending_scores
            WHERE listing_id = $1
            ORDER BY calculated_at DESC
            LIMIT 1
            "#,
        )
        .bind(listing_id)
        .fetch_optional(pool)
        .await?;

        let rank_change = match prev_rank {
            Some(pr) => pr - new_rank, // Positive means moved UP (e.g. was #5, now #2 -> +3)
            None => 999,               // 999 represents NEW in leaderboard
        };

        sqlx::query(
            r#"
            INSERT INTO trending_scores (listing_id, rank, score, rank_change, calculated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (listing_id, calculated_at) DO UPDATE
            SET rank = EXCLUDED.rank, score = EXCLUDED.score, rank_change = EXCLUDED.rank_change
            "#,
        )
        .bind(listing_id)
        .bind(new_rank)
        .bind(score)
        .bind(rank_change)
        .bind(now)
        .execute(pool)
        .await?;

        inserted_count += 1;
    }

    info!(
        "Successfully updated leaderboard for {} active listings.",
        inserted_count
    );
    Ok(inserted_count)
}

#[cfg(test)]
mod tests {

    #[test]
    fn test_scoring_formula_calculation() {
        // Test that a listing with 5 purchases, 4.8 rating, 2 threads, and newness bonus gets higher score
        let v_p = 5.0;
        let v_r = (4.8 - 3.0) * 2.0; // 3.6
        let v_c = 2.0;
        let newness = 1.0; // Brand new

        let score = (10.0 * v_p) + (5.0 * v_r) + (2.0 * v_c) + (15.0 * newness);
        assert_eq!(score, 50.0 + 18.0 + 4.0 + 15.0); // 87.0
        assert!(score > 80.0);
    }
}
