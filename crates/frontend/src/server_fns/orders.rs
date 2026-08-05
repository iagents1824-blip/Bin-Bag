use leptos::prelude::*;
use bin_bag_core::models::order::{
    Order, OrderStatus, OrderWithListing, SellerEarningsSummary,
};
use bin_bag_core::models::listing::PaginatedResult;

#[server(CreateCheckoutSession, "/api")]
pub async fn create_checkout_session(listing_id: String) -> Result<String, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use uuid::Uuid;

    #[derive(sqlx::FromRow)]
    struct ListingPriceRow {
        id: Uuid,
        seller_id: Uuid,
        title: String,
        price_cents: i32,
        external_link: Option<String>,
    }

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to buy a listing"))?;
    let buyer_id = user.id;
    let listing_id_uuid = Uuid::parse_str(&listing_id)
        .map_err(|e| ServerFnError::new(format!("Invalid listing UUID: {}", e)))?;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    // 1. Fetch listing
    let listing_row = sqlx::query_as::<_, ListingPriceRow>(
        "SELECT id, seller_id, title, price_cents, external_link FROM listings WHERE id = $1"
    )
    .bind(listing_id_uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?
    .ok_or_else(|| ServerFnError::new("Listing not found"))?;

    if listing_row.seller_id == buyer_id {
        return Err(ServerFnError::new("You cannot buy your own listing"));
    }

    let price_cents = listing_row.price_cents as i64;

    // 2. If free ($0.00), insert a completed order right away
    if price_cents == 0 {
        sqlx::query(
            r#"
            INSERT INTO orders (buyer_id, listing_id, seller_id, price_cents, status, completed_at)
            VALUES ($1, $2, $3, $4, 'completed', NOW())
            "#
        )
        .bind(buyer_id)
        .bind(listing_id_uuid)
        .bind(listing_row.seller_id)
        .bind(price_cents)
        .execute(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;

        return Ok("/orders".to_string());
    }

    // 3. For paid listings: insert a pending order
    let order_id = Uuid::new_v4();
    let session_id = format!("cs_test_{}", order_id.simple());

    let stripe_key = std::env::var("STRIPE_SECRET_KEY").unwrap_or_default();
    let is_dev_mock = stripe_key.is_empty() || stripe_key.starts_with("sk_test_mock");

    let status = if is_dev_mock {
        OrderStatus::Completed
    } else {
        OrderStatus::Pending
    };

    sqlx::query(
        r#"
        INSERT INTO orders (id, buyer_id, listing_id, seller_id, price_cents, status, stripe_checkout_session_id, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CASE WHEN $6 = 'completed' THEN NOW() ELSE NULL END)
        "#
    )
    .bind(order_id)
    .bind(buyer_id)
    .bind(listing_id_uuid)
    .bind(listing_row.seller_id)
    .bind(price_cents)
    .bind(status)
    .bind(session_id)
    .execute(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    if is_dev_mock {
        Ok(format!("/orders?success=true&order_id={}", order_id))
    } else {
        Ok(format!("/orders?success=true&order_id={}", order_id))
    }
}

#[server(GetBuyerOrders, "/api")]
pub async fn get_buyer_orders(
    cursor: Option<String>,
    limit: Option<i64>,
) -> Result<PaginatedResult<OrderWithListing>, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use chrono::{DateTime, Utc};
    use uuid::Uuid;

    #[derive(sqlx::FromRow)]
    struct BuyerOrderRow {
        id: Uuid,
        buyer_id: Uuid,
        listing_id: Uuid,
        seller_id: Uuid,
        price_cents: i64,
        status: OrderStatus,
        stripe_checkout_session_id: Option<String>,
        stripe_payment_intent_id: Option<String>,
        created_at: DateTime<Utc>,
        completed_at: Option<DateTime<Utc>>,
        listing_title: String,
        listing_type: bin_bag_core::models::listing::ListingType,
        seller_username: String,
        external_link: Option<String>,
    }

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to view orders"))?;
    let buyer_id = user.id;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    let limit_val = limit.unwrap_or(20).clamp(1, 50);

    let rows = sqlx::query_as::<_, BuyerOrderRow>(
        r#"
        SELECT 
            o.id, o.buyer_id, o.listing_id, o.seller_id, o.price_cents,
            o.status,
            o.stripe_checkout_session_id, o.stripe_payment_intent_id,
            o.created_at, o.completed_at,
            l.title as listing_title,
            l.listing_type as listing_type,
            u.username as seller_username,
            l.external_link
        FROM orders o
        JOIN listings l ON o.listing_id = l.id
        JOIN users u ON o.seller_id = u.id
        WHERE o.buyer_id = $1
        ORDER BY o.created_at DESC
        LIMIT $2
        "#
    )
    .bind(buyer_id)
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
        let order = Order {
            id: row.id,
            buyer_id: row.buyer_id,
            listing_id: row.listing_id,
            seller_id: row.seller_id,
            price_cents: row.price_cents,
            status: row.status,
            stripe_checkout_session_id: row.stripe_checkout_session_id,
            stripe_payment_intent_id: row.stripe_payment_intent_id,
            created_at: row.created_at,
            completed_at: row.completed_at,
        };
        items.push(OrderWithListing {
            order,
            listing_title: row.listing_title,
            listing_type: row.listing_type.to_string(),
            seller_username: row.seller_username,
            buyer_username: None,
            external_link: if row.status == OrderStatus::Completed {
                row.external_link
            } else {
                None
            },
        });
    }

    Ok(PaginatedResult {
        items,
        next_cursor,
        total_estimate: None,
    })
}

#[server(GetSellerOrders, "/api")]
pub async fn get_seller_orders(
    cursor: Option<String>,
    limit: Option<i64>,
) -> Result<PaginatedResult<OrderWithListing>, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use chrono::{DateTime, Utc};
    use uuid::Uuid;

    #[derive(sqlx::FromRow)]
    struct SellerOrderRow {
        id: Uuid,
        buyer_id: Uuid,
        listing_id: Uuid,
        seller_id: Uuid,
        price_cents: i64,
        status: OrderStatus,
        stripe_checkout_session_id: Option<String>,
        stripe_payment_intent_id: Option<String>,
        created_at: DateTime<Utc>,
        completed_at: Option<DateTime<Utc>>,
        listing_title: String,
        listing_type: bin_bag_core::models::listing::ListingType,
        buyer_username: String,
    }

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to view seller sales"))?;
    let seller_id = user.id;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    let limit_val = limit.unwrap_or(20).clamp(1, 50);

    let rows = sqlx::query_as::<_, SellerOrderRow>(
        r#"
        SELECT 
            o.id, o.buyer_id, o.listing_id, o.seller_id, o.price_cents,
            o.status,
            o.stripe_checkout_session_id, o.stripe_payment_intent_id,
            o.created_at, o.completed_at,
            l.title as listing_title,
            l.listing_type as listing_type,
            u.username as buyer_username
        FROM orders o
        JOIN listings l ON o.listing_id = l.id
        JOIN users u ON o.buyer_id = u.id
        WHERE o.seller_id = $1 AND o.status = 'completed'
        ORDER BY o.created_at DESC
        LIMIT $2
        "#
    )
    .bind(seller_id)
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
        let order = Order {
            id: row.id,
            buyer_id: row.buyer_id,
            listing_id: row.listing_id,
            seller_id: row.seller_id,
            price_cents: row.price_cents,
            status: row.status,
            stripe_checkout_session_id: row.stripe_checkout_session_id,
            stripe_payment_intent_id: row.stripe_payment_intent_id,
            created_at: row.created_at,
            completed_at: row.completed_at,
        };
        items.push(OrderWithListing {
            order,
            listing_title: row.listing_title,
            listing_type: row.listing_type.to_string(),
            seller_username: user.username.clone(),
            buyer_username: Some(row.buyer_username),
            external_link: None,
        });
    }

    Ok(PaginatedResult {
        items,
        next_cursor,
        total_estimate: None,
    })
}

#[server(GetSellerEarnings, "/api")]
pub async fn get_seller_earnings() -> Result<SellerEarningsSummary, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;

    #[derive(sqlx::FromRow)]
    struct EarningsRow {
        total_cents: Option<i64>,
        total_orders: Option<i64>,
    }

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to view earnings"))?;
    let seller_id = user.id;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    let row = sqlx::query_as::<_, EarningsRow>(
        r#"
        SELECT 
            COALESCE(SUM(price_cents), 0) as total_cents,
            COUNT(*) as total_orders
        FROM orders
        WHERE seller_id = $1 AND status = 'completed'
        "#
    )
    .bind(seller_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    let total_earnings_cents = row.total_cents.unwrap_or(0);
    let completed_orders_count = row.total_orders.unwrap_or(0);

    Ok(SellerEarningsSummary {
        total_earnings_cents,
        completed_orders_count,
    })
}

/// A single day's revenue data point for charts.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DailyRevenue {
    pub date: String,
    pub revenue_cents: i64,
    pub order_count: i64,
}

/// Sales breakdown by listing category.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CategoryBreakdown {
    pub category: String,
    pub sales_count: i64,
    pub revenue_cents: i64,
}

/// Full analytics payload for the seller dashboard.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SellerAnalytics {
    pub daily_revenue: Vec<DailyRevenue>,
    pub category_breakdown: Vec<CategoryBreakdown>,
    pub total_listings: i64,
    pub avg_order_value_cents: i64,
    pub conversion_rate_pct: f64,
}

/// Fetch advanced analytics for the authenticated seller.
#[server(GetSellerAnalytics, "/api")]
pub async fn get_seller_analytics() -> Result<SellerAnalytics, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to view analytics"))?;
    let seller_id = user.id;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    // 1. Daily revenue for last 14 days
    #[derive(sqlx::FromRow)]
    struct DailyRow {
        day: String,
        rev: Option<i64>,
        cnt: Option<i64>,
    }

    let daily_rows = sqlx::query_as::<_, DailyRow>(
        r#"
        SELECT
            TO_CHAR(d.day, 'YYYY-MM-DD') as day,
            COALESCE(SUM(o.price_cents), 0) as rev,
            COUNT(o.id) as cnt
        FROM generate_series(
            CURRENT_DATE - INTERVAL '13 days',
            CURRENT_DATE,
            '1 day'
        ) AS d(day)
        LEFT JOIN orders o ON DATE(o.created_at) = d.day
            AND o.seller_id = $1
            AND o.status = 'completed'
        GROUP BY d.day
        ORDER BY d.day ASC
        "#
    )
    .bind(seller_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    let daily_revenue: Vec<DailyRevenue> = daily_rows
        .into_iter()
        .map(|r| DailyRevenue {
            date: r.day,
            revenue_cents: r.rev.unwrap_or(0),
            order_count: r.cnt.unwrap_or(0),
        })
        .collect();

    // 2. Category breakdown
    #[derive(sqlx::FromRow)]
    struct CatRow {
        cat: String,
        cnt: Option<i64>,
        rev: Option<i64>,
    }

    let cat_rows = sqlx::query_as::<_, CatRow>(
        r#"
        SELECT
            l.listing_type::text as cat,
            COUNT(o.id) as cnt,
            COALESCE(SUM(o.price_cents), 0) as rev
        FROM orders o
        JOIN listings l ON o.listing_id = l.id
        WHERE o.seller_id = $1 AND o.status = 'completed'
        GROUP BY l.listing_type
        ORDER BY cnt DESC
        "#
    )
    .bind(seller_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    let category_breakdown: Vec<CategoryBreakdown> = cat_rows
        .into_iter()
        .map(|r| CategoryBreakdown {
            category: r.cat,
            sales_count: r.cnt.unwrap_or(0),
            revenue_cents: r.rev.unwrap_or(0),
        })
        .collect();

    // 3. Aggregate metrics
    #[derive(sqlx::FromRow)]
    struct AggRow {
        total_listings: Option<i64>,
        total_orders: Option<i64>,
        total_rev: Option<i64>,
    }

    let agg = sqlx::query_as::<_, AggRow>(
        r#"
        SELECT
            (SELECT COUNT(*) FROM listings WHERE seller_id = $1) as total_listings,
            (SELECT COUNT(*) FROM orders WHERE seller_id = $1 AND status = 'completed') as total_orders,
            (SELECT COALESCE(SUM(price_cents), 0) FROM orders WHERE seller_id = $1 AND status = 'completed') as total_rev
        "#
    )
    .bind(seller_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    let total_listings = agg.total_listings.unwrap_or(0);
    let total_orders = agg.total_orders.unwrap_or(0);
    let total_rev = agg.total_rev.unwrap_or(0);

    let avg_order_value_cents = if total_orders > 0 {
        total_rev / total_orders
    } else {
        0
    };

    // Conversion rate: orders / listings (as a proxy)
    let conversion_rate_pct = if total_listings > 0 {
        (total_orders as f64 / total_listings as f64 * 100.0).min(100.0)
    } else {
        0.0
    };

    Ok(SellerAnalytics {
        daily_revenue,
        category_breakdown,
        total_listings,
        avg_order_value_cents,
        conversion_rate_pct,
    })
}

