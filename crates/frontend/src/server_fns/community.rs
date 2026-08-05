use leptos::prelude::*;
use bin_bag_core::models::community::{
    Thread, ThreadType, ThreadWithAuthor, Reply, ReplyWithAuthor,
};
use bin_bag_core::models::listing::PaginatedResult;

#[server(CreateThread, "/api")]
pub async fn create_thread(
    title: String,
    content: String,
    thread_type: String,
    listing_id: Option<String>,
    tags: Vec<String>,
) -> Result<ThreadWithAuthor, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use uuid::Uuid;

    let title_trimmed = title.trim();
    if title_trimmed.is_empty() {
        return Err(ServerFnError::new("Thread title cannot be empty"));
    }
    let content_trimmed = content.trim();
    if content_trimmed.is_empty() {
        return Err(ServerFnError::new("Thread content cannot be empty"));
    }

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to create a thread"))?;
    let user_id = user.id;

    let listing_uuid = match listing_id {
        Some(ref id) if !id.is_empty() => Some(Uuid::parse_str(id)
            .map_err(|e| ServerFnError::new(format!("Invalid listing UUID: {}", e)))?),
        _ => None,
    };

    let t_type = match thread_type.to_lowercase().as_str() {
        "qa" => ThreadType::Qa,
        _ => ThreadType::General,
    };

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    let thread_id = Uuid::new_v4();
    let thread = sqlx::query_as::<_, Thread>(
        r#"
        INSERT INTO threads (id, user_id, listing_id, thread_type, title, content, tags, upvote_count, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 0, NOW(), NOW())
        RETURNING id, user_id, listing_id, thread_type, title, content, tags, upvote_count, created_at, updated_at
        "#
    )
    .bind(thread_id)
    .bind(user_id)
    .bind(listing_uuid)
    .bind(t_type)
    .bind(title_trimmed)
    .bind(content_trimmed)
    .bind(&tags)
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    // Optional listing title lookup
    let listing_title = if let Some(lid) = listing_uuid {
        #[derive(sqlx::FromRow)]
        struct TitleRow { title: String }
        sqlx::query_as::<_, TitleRow>("SELECT title FROM listings WHERE id = $1")
            .bind(lid)
            .fetch_optional(&state.db)
            .await
            .map_err(|e| ServerFnError::new(e.to_string()))?
            .map(|r| r.title)
    } else {
        None
    };

    Ok(ThreadWithAuthor {
        thread,
        author_username: user.username.clone(),
        author_role: user.role.to_string(),
        author_avatar_url: user.avatar_url.clone(),
        reply_count: 0,
        user_has_upvoted: false,
        listing_title,
    })
}

#[server(ListThreads, "/api")]
pub async fn list_threads(
    thread_type: Option<String>,
    listing_id: Option<String>,
    tag: Option<String>,
    cursor: Option<String>,
    limit: Option<i64>,
) -> Result<PaginatedResult<ThreadWithAuthor>, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use uuid::Uuid;
    use chrono::{DateTime, Utc};

    #[derive(sqlx::FromRow)]
    struct ThreadRow {
        id: Uuid,
        user_id: Uuid,
        listing_id: Option<Uuid>,
        thread_type: ThreadType,
        title: String,
        content: String,
        tags: Vec<String>,
        upvote_count: i32,
        created_at: DateTime<Utc>,
        updated_at: DateTime<Utc>,
        author_username: String,
        author_role: String,
        author_avatar_url: Option<String>,
        reply_count: Option<i64>,
        listing_title: Option<String>,
    }

    let current_user = get_current_user().await?;
    let current_user_id = current_user.as_ref().map(|u| u.id);

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    let limit_val = limit.unwrap_or(20).clamp(1, 50);

    let t_type_filter = thread_type.and_then(|s| match s.to_lowercase().as_str() {
        "qa" => Some(ThreadType::Qa),
        "general" => Some(ThreadType::General),
        _ => None,
    });

    let listing_uuid_filter = match listing_id {
        Some(ref id) if !id.is_empty() => Some(Uuid::parse_str(id)
            .map_err(|e| ServerFnError::new(format!("Invalid listing UUID: {}", e)))?),
        _ => None,
    };

    let tag_filter = tag.and_then(|t| if t.is_empty() { None } else { Some(t) });

    let rows = sqlx::query_as::<_, ThreadRow>(
        r#"
        SELECT 
            t.id, t.user_id, t.listing_id, t.thread_type, t.title, t.content, t.tags, t.upvote_count, t.created_at, t.updated_at,
            u.username as author_username,
            u.role as author_role,
            u.avatar_url as author_avatar_url,
            (SELECT COUNT(*) FROM thread_replies r WHERE r.thread_id = t.id) as reply_count,
            l.title as listing_title
        FROM threads t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN listings l ON t.listing_id = l.id
        WHERE ($1::thread_type IS NULL OR t.thread_type = $1)
          AND ($2::uuid IS NULL OR t.listing_id = $2)
          AND ($3::text IS NULL OR $3 = ANY(t.tags))
        ORDER BY t.created_at DESC
        LIMIT $4
        "#
    )
    .bind(t_type_filter)
    .bind(listing_uuid_filter)
    .bind(tag_filter)
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

        let user_has_upvoted = if let Some(uid) = current_user_id {
            #[derive(sqlx::FromRow)]
            struct UpvoteRow { id: Uuid }
            sqlx::query_as::<_, UpvoteRow>(
                "SELECT id FROM upvotes WHERE user_id = $1 AND target_type = 'thread' AND target_id = $2 LIMIT 1"
            )
            .bind(uid)
            .bind(row.id)
            .fetch_optional(&state.db)
            .await
            .unwrap_or(None)
            .is_some()
        } else {
            false
        };

        let thread = Thread {
            id: row.id,
            user_id: row.user_id,
            listing_id: row.listing_id,
            thread_type: row.thread_type,
            title: row.title,
            content: row.content,
            tags: row.tags,
            upvote_count: row.upvote_count,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };

        items.push(ThreadWithAuthor {
            thread,
            author_username: row.author_username,
            author_role: row.author_role,
            author_avatar_url: row.author_avatar_url,
            reply_count: row.reply_count.unwrap_or(0),
            user_has_upvoted,
            listing_title: row.listing_title,
        });
    }

    Ok(PaginatedResult {
        items,
        next_cursor,
        total_estimate: None,
    })
}

#[server(GetThread, "/api")]
pub async fn get_thread(id: String) -> Result<(ThreadWithAuthor, Vec<ReplyWithAuthor>), ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use uuid::Uuid;
    use chrono::{DateTime, Utc};

    let current_user = get_current_user().await?;
    let current_user_id = current_user.as_ref().map(|u| u.id);

    let thread_uuid = Uuid::parse_str(&id)
        .map_err(|e| ServerFnError::new(format!("Invalid UUID: {}", e)))?;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    #[derive(sqlx::FromRow)]
    struct ThreadRow {
        id: Uuid,
        user_id: Uuid,
        listing_id: Option<Uuid>,
        thread_type: ThreadType,
        title: String,
        content: String,
        tags: Vec<String>,
        upvote_count: i32,
        created_at: DateTime<Utc>,
        updated_at: DateTime<Utc>,
        author_username: String,
        author_role: String,
        author_avatar_url: Option<String>,
        reply_count: Option<i64>,
        listing_title: Option<String>,
    }

    let thread_row = sqlx::query_as::<_, ThreadRow>(
        r#"
        SELECT 
            t.id, t.user_id, t.listing_id, t.thread_type, t.title, t.content, t.tags, t.upvote_count, t.created_at, t.updated_at,
            u.username as author_username,
            u.role as author_role,
            u.avatar_url as author_avatar_url,
            (SELECT COUNT(*) FROM thread_replies r WHERE r.thread_id = t.id) as reply_count,
            l.title as listing_title
        FROM threads t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN listings l ON t.listing_id = l.id
        WHERE t.id = $1
        "#
    )
    .bind(thread_uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?
    .ok_or_else(|| ServerFnError::new("Thread not found"))?;

    let thread_has_upvoted = if let Some(uid) = current_user_id {
        #[derive(sqlx::FromRow)]
        struct UpvoteRow { id: Uuid }
        sqlx::query_as::<_, UpvoteRow>(
            "SELECT id FROM upvotes WHERE user_id = $1 AND target_type = 'thread' AND target_id = $2 LIMIT 1"
        )
        .bind(uid)
        .bind(thread_uuid)
        .fetch_optional(&state.db)
        .await
        .unwrap_or(None)
        .is_some()
    } else {
        false
    };

    let thread = Thread {
        id: thread_row.id,
        user_id: thread_row.user_id,
        listing_id: thread_row.listing_id,
        thread_type: thread_row.thread_type,
        title: thread_row.title,
        content: thread_row.content,
        tags: thread_row.tags,
        upvote_count: thread_row.upvote_count,
        created_at: thread_row.created_at,
        updated_at: thread_row.updated_at,
    };

    let thread_with_author = ThreadWithAuthor {
        thread,
        author_username: thread_row.author_username,
        author_role: thread_row.author_role,
        author_avatar_url: thread_row.author_avatar_url,
        reply_count: thread_row.reply_count.unwrap_or(0),
        user_has_upvoted: thread_has_upvoted,
        listing_title: thread_row.listing_title,
    };

    #[derive(sqlx::FromRow)]
    struct ReplyRow {
        id: Uuid,
        thread_id: Uuid,
        user_id: Uuid,
        content: String,
        is_accepted_answer: bool,
        is_expert_answer: bool,
        upvote_count: i32,
        created_at: DateTime<Utc>,
        updated_at: DateTime<Utc>,
        author_username: String,
        author_role: String,
        author_avatar_url: Option<String>,
    }

    // Sort replies: Accepted answers first, then expert answers, then by creation time
    let reply_rows = sqlx::query_as::<_, ReplyRow>(
        r#"
        SELECT 
            r.id, r.thread_id, r.user_id, r.content, r.is_accepted_answer, r.is_expert_answer, r.upvote_count, r.created_at, r.updated_at,
            u.username as author_username,
            u.role as author_role,
            u.avatar_url as author_avatar_url
        FROM thread_replies r
        JOIN users u ON r.user_id = u.id
        WHERE r.thread_id = $1
        ORDER BY r.is_accepted_answer DESC, r.is_expert_answer DESC, r.created_at ASC
        "#
    )
    .bind(thread_uuid)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    let mut replies = Vec::new();
    for r_row in reply_rows {
        let reply_has_upvoted = if let Some(uid) = current_user_id {
            #[derive(sqlx::FromRow)]
            struct UpvoteRow { id: Uuid }
            sqlx::query_as::<_, UpvoteRow>(
                "SELECT id FROM upvotes WHERE user_id = $1 AND target_type = 'reply' AND target_id = $2 LIMIT 1"
            )
            .bind(uid)
            .bind(r_row.id)
            .fetch_optional(&state.db)
            .await
            .unwrap_or(None)
            .is_some()
        } else {
            false
        };

        let reply = Reply {
            id: r_row.id,
            thread_id: r_row.thread_id,
            user_id: r_row.user_id,
            content: r_row.content,
            is_accepted_answer: r_row.is_accepted_answer,
            is_expert_answer: r_row.is_expert_answer,
            upvote_count: r_row.upvote_count,
            created_at: r_row.created_at,
            updated_at: r_row.updated_at,
        };

        replies.push(ReplyWithAuthor {
            reply,
            author_username: r_row.author_username,
            author_role: r_row.author_role,
            author_avatar_url: r_row.author_avatar_url,
            user_has_upvoted: reply_has_upvoted,
        });
    }

    Ok((thread_with_author, replies))
}

#[server(CreateReply, "/api")]
pub async fn create_reply(
    thread_id: String,
    content: String,
) -> Result<ReplyWithAuthor, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use uuid::Uuid;

    let content_trimmed = content.trim();
    if content_trimmed.is_empty() {
        return Err(ServerFnError::new("Reply content cannot be empty"));
    }

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to reply"))?;
    let user_id = user.id;

    let thread_uuid = Uuid::parse_str(&thread_id)
        .map_err(|e| ServerFnError::new(format!("Invalid thread UUID: {}", e)))?;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    #[derive(sqlx::FromRow)]
    struct ThreadOwnerRow {
        user_id: Uuid,
        title: String,
    }
    let parent = sqlx::query_as::<_, ThreadOwnerRow>(
        "SELECT user_id, title FROM threads WHERE id = $1"
    )
    .bind(thread_uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?
    .ok_or_else(|| ServerFnError::new("Thread not found"))?;

    let role_str = user.role.to_string().to_lowercase();
    let is_expert = role_str == "expert" || role_str == "admin";

    let reply_id = Uuid::new_v4();
    let reply = sqlx::query_as::<_, Reply>(
        r#"
        INSERT INTO thread_replies (id, thread_id, user_id, content, is_accepted_answer, is_expert_answer, upvote_count, created_at, updated_at)
        VALUES ($1, $2, $3, $4, FALSE, $5, 0, NOW(), NOW())
        RETURNING id, thread_id, user_id, content, is_accepted_answer, is_expert_answer, upvote_count, created_at, updated_at
        "#
    )
    .bind(reply_id)
    .bind(thread_uuid)
    .bind(user_id)
    .bind(content_trimmed)
    .bind(is_expert)
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    // Send notification to parent thread author if it's someone else
    if parent.user_id != user_id {
        let notif_title = if is_expert {
            format!("🎖️ Expert {} answered your question", user.username)
        } else {
            format!("💬 {} replied to your thread", user.username)
        };
        let notif_type = if is_expert { "answer" } else { "reply" };
        let _ = crate::server_fns::notifications::send_notification(
            &state,
            parent.user_id,
            Some(user_id),
            notif_type,
            &notif_title,
            &parent.title,
            &format!("/community/{}", thread_uuid),
        ).await;
    }

    Ok(ReplyWithAuthor {
        reply,
        author_username: user.username.clone(),
        author_role: user.role.to_string(),
        author_avatar_url: user.avatar_url.clone(),
        user_has_upvoted: false,
    })
}

#[server(ToggleUpvote, "/api")]
pub async fn toggle_upvote(
    target_type: String,
    target_id: String,
) -> Result<i32, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use uuid::Uuid;

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in to upvote"))?;
    let target_uuid = Uuid::parse_str(&target_id)
        .map_err(|e| ServerFnError::new(format!("Invalid UUID: {}", e)))?;
    let type_clean = match target_type.to_lowercase().as_str() {
        "reply" => "reply",
        _ => "thread",
    };

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    // Check existing upvote
    #[derive(sqlx::FromRow)]
    struct UpvoteRow { id: Uuid }
    let existing = sqlx::query_as::<_, UpvoteRow>(
        "SELECT id FROM upvotes WHERE user_id = $1 AND target_type = $2 AND target_id = $3 LIMIT 1"
    )
    .bind(user.id)
    .bind(type_clean)
    .bind(target_uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    let new_count: i32;
    if existing.is_some() {
        // Remove upvote and decrement
        let _ = sqlx::query(
            "DELETE FROM upvotes WHERE user_id = $1 AND target_type = $2 AND target_id = $3"
        )
        .bind(user.id)
        .bind(type_clean)
        .bind(target_uuid)
        .execute(&state.db)
        .await;

        let res = if type_clean == "thread" {
            sqlx::query_as::<_, (i32,)>(
                "UPDATE threads SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = $1 RETURNING upvote_count"
            )
            .bind(target_uuid)
            .fetch_one(&state.db)
            .await
        } else {
            sqlx::query_as::<_, (i32,)>(
                "UPDATE thread_replies SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = $1 RETURNING upvote_count"
            )
            .bind(target_uuid)
            .fetch_one(&state.db)
            .await
        };
        new_count = res.map(|r| r.0).unwrap_or(0);
    } else {
        // Insert upvote and increment
        let _ = sqlx::query(
            "INSERT INTO upvotes (id, user_id, target_type, target_id, created_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT DO NOTHING"
        )
        .bind(Uuid::new_v4())
        .bind(user.id)
        .bind(type_clean)
        .bind(target_uuid)
        .execute(&state.db)
        .await;

        let res = if type_clean == "thread" {
            sqlx::query_as::<_, (i32,)>(
                "UPDATE threads SET upvote_count = upvote_count + 1 WHERE id = $1 RETURNING upvote_count"
            )
            .bind(target_uuid)
            .fetch_one(&state.db)
            .await
        } else {
            sqlx::query_as::<_, (i32,)>(
                "UPDATE thread_replies SET upvote_count = upvote_count + 1 WHERE id = $1 RETURNING upvote_count"
            )
            .bind(target_uuid)
            .fetch_one(&state.db)
            .await
        };
        new_count = res.map(|r| r.0).unwrap_or(0);
    }

    Ok(new_count)
}

#[server(MarkAcceptedAnswer, "/api")]
pub async fn mark_accepted_answer(reply_id: String) -> Result<(), ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use uuid::Uuid;

    let user = get_current_user().await?
        .ok_or_else(|| ServerFnError::new("Must be logged in"))?;
    let reply_uuid = Uuid::parse_str(&reply_id)
        .map_err(|e| ServerFnError::new(format!("Invalid UUID: {}", e)))?;

    let state = use_context::<AppState>()
        .ok_or_else(|| ServerFnError::new("AppState not in context"))?;

    #[derive(sqlx::FromRow)]
    struct ReplyInfo {
        thread_id: Uuid,
        user_id: Uuid,
    }
    let r_info = sqlx::query_as::<_, ReplyInfo>(
        "SELECT thread_id, user_id FROM thread_replies WHERE id = $1"
    )
    .bind(reply_uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?
    .ok_or_else(|| ServerFnError::new("Reply not found"))?;

    #[derive(sqlx::FromRow)]
    struct ThreadInfo {
        user_id: Uuid,
        title: String,
    }
    let t_info = sqlx::query_as::<_, ThreadInfo>(
        "SELECT user_id, title FROM threads WHERE id = $1"
    )
    .bind(r_info.thread_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?
    .ok_or_else(|| ServerFnError::new("Thread not found"))?;

    if t_info.user_id != user.id {
        return Err(ServerFnError::new("Only the author of the question can mark an accepted answer"));
    }

    // Unmark any other accepted answers in this thread
    let _ = sqlx::query(
        "UPDATE thread_replies SET is_accepted_answer = FALSE WHERE thread_id = $1"
    )
    .bind(r_info.thread_id)
    .execute(&state.db)
    .await;

    // Mark this reply as accepted
    let _ = sqlx::query(
        "UPDATE thread_replies SET is_accepted_answer = TRUE WHERE id = $1"
    )
    .bind(reply_uuid)
    .execute(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    // Notify reply author if not self
    if r_info.user_id != user.id {
        let _ = crate::server_fns::notifications::send_notification(
            &state,
            r_info.user_id,
            Some(user.id),
            "accepted",
            &format!("✓ {} accepted your answer", user.username),
            &t_info.title,
            &format!("/community/{}", r_info.thread_id),
        ).await;
    }

    Ok(())
}
