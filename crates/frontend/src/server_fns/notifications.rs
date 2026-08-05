use leptos::prelude::*;
use bin_bag_core::models::notification::Notification;

#[server(GetMyNotifications, "/api")]
pub async fn get_my_notifications(
    unread_only: bool,
    limit: Option<i64>,
) -> Result<Vec<Notification>, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to view notifications"))?;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    let limit_val = limit.unwrap_or(20).clamp(1, 50);

    let rows = if unread_only {
        sqlx::query_as::<_, Notification>(
            r#"
            SELECT id, user_id, sender_id, notification_type, title, message, target_url, is_read, created_at
            FROM notifications
            WHERE user_id = $1 AND is_read = FALSE
            ORDER BY created_at DESC
            LIMIT $2
            "#
        )
        .bind(user.id)
        .bind(limit_val)
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?
    } else {
        sqlx::query_as::<_, Notification>(
            r#"
            SELECT id, user_id, sender_id, notification_type, title, message, target_url, is_read, created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            "#
        )
        .bind(user.id)
        .bind(limit_val)
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?
    };

    Ok(rows)
}

#[server(MarkNotificationRead, "/api")]
pub async fn mark_notification_read(id: String) -> Result<(), ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use uuid::Uuid;

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in"))?;
    let notif_id = Uuid::parse_str(&id)
        .map_err(|e| ServerFnError::new(format!("Invalid UUID: {}", e)))?;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    let _ = sqlx::query(
        "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2"
    )
    .bind(notif_id)
    .bind(user.id)
    .execute(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    Ok(())
}

#[server(MarkAllNotificationsRead, "/api")]
pub async fn mark_all_notifications_read() -> Result<(), ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in"))?;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    let _ = sqlx::query(
        "UPDATE notifications SET is_read = TRUE WHERE user_id = $1"
    )
    .bind(user.id)
    .execute(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    Ok(())
}

#[cfg(feature = "ssr")]
pub async fn send_notification(
    state: &crate::state::AppState,
    user_id: uuid::Uuid,
    sender_id: Option<uuid::Uuid>,
    notif_type: &str,
    title: &str,
    message: &str,
    target_url: &str,
) -> Result<(), sqlx::Error> {
    use uuid::Uuid;

    let notif_id = Uuid::new_v4();
    let row = sqlx::query_as::<_, Notification>(
        r#"
        INSERT INTO notifications (id, user_id, sender_id, notification_type, title, message, target_url, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, NOW())
        RETURNING id, user_id, sender_id, notification_type, title, message, target_url, is_read, created_at
        "#
    )
    .bind(notif_id)
    .bind(user_id)
    .bind(sender_id)
    .bind(notif_type)
    .bind(title)
    .bind(message)
    .bind(target_url)
    .fetch_one(&state.db)
    .await?;

    // Broadcast over WebSocket if connected
    if let Ok(json) = serde_json::to_string(&bin_bag_core::models::notification::WebSocketMessage {
        msg_type: "notification".to_string(),
        payload: Some(row),
    }) {
        state.ws_hub.push_to_user(&user_id, &json).await;
    }

    Ok(())
}
