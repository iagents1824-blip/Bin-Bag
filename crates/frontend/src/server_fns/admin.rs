use leptos::prelude::*;
use bin_bag_core::models::admin::{ExpertApplication, PlatformAnalytics};

#[server(GetPlatformAnalytics)]
pub async fn get_platform_analytics() -> Result<PlatformAnalytics, ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let user = crate::server_fns::auth::get_current_user_db(&state)
        .await?
        .ok_or_else(|| ServerFnError::new("Unauthorized"))?;

    if user.role != UserRole::Admin {
        return Err(ServerFnError::new("Forbidden: Admin role required"));
    }

    let total_users: i64 = sqlx::query_scalar("SELECT count(*) FROM users")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_sellers: i64 = sqlx::query_scalar("SELECT count(*) FROM users WHERE role = 'seller' OR role = 'admin'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_experts: i64 = sqlx::query_scalar("SELECT count(*) FROM users WHERE role = 'expert'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let new_users_7d: i64 = sqlx::query_scalar("SELECT count(*) FROM users WHERE created_at >= now() - interval '7 days'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_gmv_cents: i64 = sqlx::query_scalar("SELECT COALESCE(SUM(price_cents), 0)::bigint FROM orders WHERE status = 'completed'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let gmv_7d_cents: i64 = sqlx::query_scalar("SELECT COALESCE(SUM(price_cents), 0)::bigint FROM orders WHERE status = 'completed' AND created_at >= now() - interval '7 days'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_orders: i64 = sqlx::query_scalar("SELECT count(*) FROM orders WHERE status = 'completed'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let completed_orders_7d: i64 = sqlx::query_scalar("SELECT count(*) FROM orders WHERE status = 'completed' AND created_at >= now() - interval '7 days'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let active_listings: i64 = sqlx::query_scalar("SELECT count(*) FROM listings WHERE status = 'active'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_listings: i64 = sqlx::query_scalar("SELECT count(*) FROM listings")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let delisted_listings: i64 = sqlx::query_scalar("SELECT count(*) FROM listings WHERE status != 'active'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_threads: i64 = sqlx::query_scalar("SELECT count(*) FROM threads")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_replies: i64 = sqlx::query_scalar("SELECT count(*) FROM thread_replies")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let expert_answers: i64 = sqlx::query_scalar("SELECT count(*) FROM thread_replies WHERE is_expert_answer = true")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_news_articles: i64 = sqlx::query_scalar("SELECT count(*) FROM news_articles")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    Ok(PlatformAnalytics {
        total_users,
        total_sellers,
        total_experts,
        new_users_7d,
        total_gmv_cents,
        gmv_7d_cents,
        total_orders,
        completed_orders_7d,
        active_listings,
        total_listings,
        delisted_listings,
        total_threads,
        total_replies,
        expert_answers,
        total_news_articles,
    })
}

#[server(ListExpertApplications)]
pub async fn list_expert_applications(
    status_filter: Option<String>,
) -> Result<Vec<ExpertApplication>, ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let user = crate::server_fns::auth::get_current_user_db(&state)
        .await?
        .ok_or_else(|| ServerFnError::new("Unauthorized"))?;

    if user.role != UserRole::Admin {
        return Err(ServerFnError::new("Forbidden: Admin role required"));
    }

    let filter_str = status_filter.unwrap_or_else(|| "pending".to_string()).to_lowercase();
    let is_all = filter_str == "all";

    let rows = sqlx::query_as::<_, ExpertApplication>(
        r#"
        SELECT ea.id, ea.user_id, ea.expertise_area, ea.credentials_url, ea.statement,
               ea.status, ea.reviewed_by, ea.reviewed_at, ea.created_at, ea.updated_at,
               u.username, u.display_name, u.avatar_url
        FROM expert_applications ea
        JOIN users u ON u.id = ea.user_id
        WHERE ($1 = true OR ea.status = $2)
        ORDER BY ea.created_at DESC
        "#,
    )
    .bind(is_all)
    .bind(&filter_str)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    Ok(rows)
}

#[server(ReviewExpertApplication)]
pub async fn review_expert_application(
    id: String,
    approve: bool,
    _reason: Option<String>,
) -> Result<ExpertApplication, ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;
    use bin_bag_core::models::notification::NotificationType;
    use uuid::Uuid;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let user = crate::server_fns::auth::get_current_user_db(&state)
        .await?
        .ok_or_else(|| ServerFnError::new("Unauthorized"))?;

    if user.role != UserRole::Admin {
        return Err(ServerFnError::new("Forbidden: Admin role required"));
    }

    let app_uuid = Uuid::parse_str(&id)
        .map_err(|_| ServerFnError::new("Invalid application ID"))?;

    let new_status = if approve { "approved" } else { "rejected" };

    let mut tx = state.db.begin().await.map_err(|e| ServerFnError::new(e.to_string()))?;

    let ea = sqlx::query_as::<_, ExpertApplication>(
        r#"
        UPDATE expert_applications
        SET status = $1, reviewed_by = $2, reviewed_at = now(), updated_at = now()
        WHERE id = $3
        RETURNING id, user_id, expertise_area, credentials_url, statement, status, reviewed_by, reviewed_at, created_at, updated_at,
                  (SELECT username FROM users WHERE id = user_id) AS username,
                  (SELECT display_name FROM users WHERE id = user_id) AS display_name,
                  (SELECT avatar_url FROM users WHERE id = user_id) AS avatar_url
        "#,
    )
    .bind(new_status)
    .bind(user.id)
    .bind(app_uuid)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    if approve {
        sqlx::query(
            r#"
            UPDATE users
            SET role = 'expert', updated_at = now()
            WHERE id = $1 AND role = 'buyer'
            "#,
        )
        .bind(ea.user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;
    }

    // Insert notification
    let title = if approve { "Expert Verification Approved" } else { "Expert Verification Update" };
    let msg = if approve {
        format!("Congratulations! Your application for Expert Verification in '{}' was approved.", ea.expertise_area)
    } else {
        format!("Your application for Expert Verification in '{}' was reviewed and not approved at this time.", ea.expertise_area)
    };

    sqlx::query(
        r#"
        INSERT INTO notifications (user_id, notification_type, title, message, target_url, is_read)
        VALUES ($1, $2, $3, $4, '/settings', false)
        "#,
    )
    .bind(ea.user_id)
    .bind(NotificationType::SystemAlert.as_str())
    .bind(title)
    .bind(&msg)
    .execute(&mut *tx)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    tx.commit().await.map_err(|e| ServerFnError::new(e.to_string()))?;

    // Push real-time websocket message
    let payload = serde_json::json!({
        "type": "SystemAlert",
        "title": title,
        "message": msg,
        "target_url": "/settings"
    }).to_string();
    state.ws_hub.push_to_user(&ea.user_id, &payload).await;

    Ok(ea)
}

#[server(SubmitExpertApplication)]
pub async fn submit_expert_application(
    expertise_area: String,
    credentials_url: Option<String>,
    statement: String,
) -> Result<ExpertApplication, ServerFnError> {
    use crate::state::AppState;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let user = crate::server_fns::auth::get_current_user_db(&state)
        .await?
        .ok_or_else(|| ServerFnError::new("Unauthorized: Please log in"))?;

    if expertise_area.trim().is_empty() || statement.trim().is_empty() {
        return Err(ServerFnError::new("Expertise area and statement are required"));
    }

    let ea = sqlx::query_as::<_, ExpertApplication>(
        r#"
        INSERT INTO expert_applications (user_id, expertise_area, credentials_url, statement, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING id, user_id, expertise_area, credentials_url, statement, status, reviewed_by, reviewed_at, created_at, updated_at,
                  (SELECT username FROM users WHERE id = $1) AS username,
                  (SELECT display_name FROM users WHERE id = $1) AS display_name,
                  (SELECT avatar_url FROM users WHERE id = $1) AS avatar_url
        "#,
    )
    .bind(user.id)
    .bind(expertise_area.trim())
    .bind(&credentials_url)
    .bind(statement.trim())
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    Ok(ea)
}

#[server(ModerateListingStatus)]
pub async fn moderate_listing_status(
    listing_id: String,
    new_status: String,
) -> Result<(), ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;
    use uuid::Uuid;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let user = crate::server_fns::auth::get_current_user_db(&state)
        .await?
        .ok_or_else(|| ServerFnError::new("Unauthorized"))?;

    if user.role != UserRole::Admin {
        return Err(ServerFnError::new("Forbidden: Admin role required"));
    }

    let lid = Uuid::parse_str(&listing_id)
        .map_err(|_| ServerFnError::new("Invalid listing ID"))?;

    sqlx::query("UPDATE listings SET status = $1, updated_at = now() WHERE id = $2")
        .bind(&new_status)
        .bind(lid)
        .execute(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;

    Ok(())
}

#[server(ModerateThreadStatus)]
pub async fn moderate_thread_status(
    thread_id: String,
    _lock: bool,
) -> Result<(), ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;
    use uuid::Uuid;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not found in context"))?;

    let user = crate::server_fns::auth::get_current_user_db(&state)
        .await?
        .ok_or_else(|| ServerFnError::new("Unauthorized"))?;

    if user.role != UserRole::Admin {
        return Err(ServerFnError::new("Forbidden: Admin role required"));
    }

    let tid = Uuid::parse_str(&thread_id)
        .map_err(|_| ServerFnError::new("Invalid thread ID"))?;

    sqlx::query("DELETE FROM threads WHERE id = $1")
        .bind(tid)
        .execute(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;

    Ok(())
}
