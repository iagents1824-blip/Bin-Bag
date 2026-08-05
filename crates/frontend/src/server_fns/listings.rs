//! Listing server functions — CRUD + browse with pagination and filtering.

use leptos::prelude::*;
use bin_bag_core::models::listing::{
    CreateListingInput, LicenseType, ListingStatus, ListingType, ListingWithTags,
    ListingsFilter, PaginatedResult, UpdateListingInput,
};

/// Create a new listing.
#[server(CreateListing, "/api")]
pub async fn create_listing(
    title: String,
    description: String,
    listing_type: String,
    category: String,
    price_cents: i32,
    license: String,
    external_link: Option<String>,
    status: String,
    tags: String, // comma-separated
) -> Result<ListingWithTags, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;

    let state = expect_context::<AppState>();

    // Auth check — seller or admin only
    let current_user = get_current_user()
        .await?
        .ok_or_else(|| ServerFnError::new("You must be logged in"))?;

    if current_user.role != UserRole::Seller && current_user.role != UserRole::Admin {
        return Err(ServerFnError::new("Only sellers can create listings"));
    }

    // Validate
    if title.trim().is_empty() {
        return Err(ServerFnError::new("Title is required"));
    }
    if description.trim().is_empty() {
        return Err(ServerFnError::new("Description is required"));
    }

    // Parse enums
    let lt: ListingType = serde_json::from_str(&format!("\"{}\"", listing_type.to_lowercase()))
        .map_err(|_| ServerFnError::new("Invalid listing type"))?;
    let lic: LicenseType = serde_json::from_str(&format!("\"{}\"", license.to_lowercase()))
        .map_err(|_| ServerFnError::new("Invalid license type"))?;
    let st: ListingStatus = match status.to_lowercase().as_str() {
        "active" => ListingStatus::Active,
        _ => ListingStatus::Draft,
    };

    // Insert listing
    let listing = sqlx::query_as::<_, bin_bag_core::models::listing::Listing>(
        r#"
        INSERT INTO listings (seller_id, listing_type, title, description, category, price_cents, license, external_link, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        "#,
    )
    .bind(current_user.id)
    .bind(&lt)
    .bind(title.trim())
    .bind(description.trim())
    .bind(category.trim())
    .bind(price_cents)
    .bind(&lic)
    .bind(&external_link)
    .bind(&st)
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?;

    // Parse and insert tags
    let tag_names: Vec<String> = tags
        .split(',')
        .map(|t| t.trim().to_lowercase())
        .filter(|t| !t.is_empty())
        .collect();

    let mut tag_list = Vec::new();
    for tag_name in &tag_names {
        // Upsert tag
        let tag = sqlx::query_as::<_, bin_bag_core::models::tag::Tag>(
            r#"
            INSERT INTO tags (name) VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING *
            "#,
        )
        .bind(tag_name)
        .fetch_one(&state.db)
        .await
        .map_err(|e| ServerFnError::new(format!("Tag error: {}", e)))?;

        // Link to listing
        sqlx::query("INSERT INTO listing_tags (listing_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
            .bind(listing.id)
            .bind(tag.id)
            .execute(&state.db)
            .await
            .map_err(|e| ServerFnError::new(format!("Tag link error: {}", e)))?;

        tag_list.push(tag_name.clone());
    }

    Ok(ListingWithTags {
        id: listing.id,
        seller_id: listing.seller_id,
        listing_type: listing.listing_type,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        price_cents: listing.price_cents,
        license: listing.license,
        external_link: listing.external_link,
        status: listing.status,
        created_at: listing.created_at,
        updated_at: listing.updated_at,
        tags: tag_list,
        rating_avg: None,
        review_count: 0,
    })
}

/// Update an existing listing.
#[server(UpdateListing, "/api")]
pub async fn update_listing(
    id: String,
    title: Option<String>,
    description: Option<String>,
    category: Option<String>,
    price_cents: Option<i32>,
    license: Option<String>,
    external_link: Option<String>,
    status: Option<String>,
    tags: Option<String>,
) -> Result<ListingWithTags, ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;

    let state = expect_context::<AppState>();

    let current_user = get_current_user()
        .await?
        .ok_or_else(|| ServerFnError::new("You must be logged in"))?;

    let listing_id: uuid::Uuid = id
        .parse()
        .map_err(|_| ServerFnError::new("Invalid listing ID"))?;

    // Fetch existing listing
    let existing = sqlx::query_as::<_, bin_bag_core::models::listing::Listing>(
        "SELECT * FROM listings WHERE id = $1",
    )
    .bind(listing_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?
    .ok_or_else(|| ServerFnError::new("Listing not found"))?;

    // Owner or admin check
    if existing.seller_id != current_user.id && current_user.role != UserRole::Admin {
        return Err(ServerFnError::new("You don't have permission to edit this listing"));
    }

    // Build update
    let new_title = title.unwrap_or(existing.title);
    let new_desc = description.unwrap_or(existing.description);
    let new_cat = category.unwrap_or(existing.category);
    let new_price = price_cents.unwrap_or(existing.price_cents);
    let new_license = if let Some(ref l) = license {
        serde_json::from_str::<LicenseType>(&format!("\"{}\"", l.to_lowercase()))
            .unwrap_or(existing.license)
    } else {
        existing.license
    };
    let new_status = if let Some(ref s) = status {
        match s.to_lowercase().as_str() {
            "active" => ListingStatus::Active,
            "draft" => ListingStatus::Draft,
            "delisted" => ListingStatus::Delisted,
            _ => existing.status,
        }
    } else {
        existing.status
    };

    let listing = sqlx::query_as::<_, bin_bag_core::models::listing::Listing>(
        r#"
        UPDATE listings
        SET title = $1, description = $2, category = $3, price_cents = $4,
            license = $5, external_link = COALESCE($6, external_link),
            status = $7, updated_at = now()
        WHERE id = $8
        RETURNING *
        "#,
    )
    .bind(&new_title)
    .bind(&new_desc)
    .bind(&new_cat)
    .bind(new_price)
    .bind(&new_license)
    .bind(&external_link)
    .bind(&new_status)
    .bind(listing_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?;

    // Re-sync tags if provided
    if let Some(ref tags_str) = tags {
        // Remove old tags
        sqlx::query("DELETE FROM listing_tags WHERE listing_id = $1")
            .bind(listing_id)
            .execute(&state.db)
            .await
            .map_err(|e| ServerFnError::new(format!("Tag cleanup error: {}", e)))?;

        let tag_names: Vec<String> = tags_str
            .split(',')
            .map(|t| t.trim().to_lowercase())
            .filter(|t| !t.is_empty())
            .collect();

        for tag_name in &tag_names {
            let tag = sqlx::query_as::<_, bin_bag_core::models::tag::Tag>(
                "INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *",
            )
            .bind(tag_name)
            .fetch_one(&state.db)
            .await
            .map_err(|e| ServerFnError::new(format!("Tag error: {}", e)))?;

            sqlx::query("INSERT INTO listing_tags (listing_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
                .bind(listing_id)
                .bind(tag.id)
                .execute(&state.db)
                .await
                .map_err(|e| ServerFnError::new(format!("Tag link error: {}", e)))?;
        }
    }

    // Fetch tags for response
    let tag_rows = sqlx::query_as::<_, bin_bag_core::models::tag::Tag>(
        "SELECT t.* FROM tags t JOIN listing_tags lt ON t.id = lt.tag_id WHERE lt.listing_id = $1",
    )
    .bind(listing_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Tag fetch error: {}", e)))?;

    Ok(ListingWithTags {
        id: listing.id,
        seller_id: listing.seller_id,
        listing_type: listing.listing_type,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        price_cents: listing.price_cents,
        license: listing.license,
        external_link: listing.external_link,
        status: listing.status,
        created_at: listing.created_at,
        updated_at: listing.updated_at,
        tags: tag_rows.into_iter().map(|t| t.name).collect(),
        rating_avg: None,
        review_count: 0,
    })
}

/// Soft-delete a listing (set status to delisted).
#[server(DeleteListing, "/api")]
pub async fn delete_listing(id: String) -> Result<(), ServerFnError> {
    use crate::server_fns::auth::get_current_user;
    use crate::state::AppState;
    use bin_bag_core::models::user::UserRole;

    let state = expect_context::<AppState>();

    let current_user = get_current_user()
        .await?
        .ok_or_else(|| ServerFnError::new("You must be logged in"))?;

    let listing_id: uuid::Uuid = id
        .parse()
        .map_err(|_| ServerFnError::new("Invalid listing ID"))?;

    let existing = sqlx::query_as::<_, bin_bag_core::models::listing::Listing>(
        "SELECT * FROM listings WHERE id = $1",
    )
    .bind(listing_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?
    .ok_or_else(|| ServerFnError::new("Listing not found"))?;

    if existing.seller_id != current_user.id && current_user.role != UserRole::Admin {
        return Err(ServerFnError::new("You don't have permission to delete this listing"));
    }

    sqlx::query("UPDATE listings SET status = 'delisted', updated_at = now() WHERE id = $1")
        .bind(listing_id)
        .execute(&state.db)
        .await
        .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?;

    Ok(())
}

/// Get a single listing by ID (with tags).
#[server(GetListing, "/api")]
pub async fn get_listing(id: String) -> Result<ListingWithTags, ServerFnError> {
    use crate::state::AppState;

    let state = expect_context::<AppState>();

    let listing_id: uuid::Uuid = id
        .parse()
        .map_err(|_| ServerFnError::new("Invalid listing ID"))?;

    let listing = sqlx::query_as::<_, bin_bag_core::models::listing::Listing>(
        "SELECT * FROM listings WHERE id = $1 AND status != 'delisted'",
    )
    .bind(listing_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?
    .ok_or_else(|| ServerFnError::new("Listing not found"))?;

    let tag_rows = sqlx::query_as::<_, bin_bag_core::models::tag::Tag>(
        "SELECT t.* FROM tags t JOIN listing_tags lt ON t.id = lt.tag_id WHERE lt.listing_id = $1",
    )
    .bind(listing_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Tag fetch error: {}", e)))?;

    #[derive(sqlx::FromRow)]
    struct ReviewStatRow {
        avg_rating: Option<f64>,
        count: Option<i64>,
    }

    let review_stat = sqlx::query_as::<_, ReviewStatRow>(
        "SELECT AVG(rating)::float as avg_rating, COUNT(*) as count FROM reviews WHERE listing_id = $1"
    )
    .bind(listing.id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(e.to_string()))?;

    Ok(ListingWithTags {
        id: listing.id,
        seller_id: listing.seller_id,
        listing_type: listing.listing_type,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        price_cents: listing.price_cents,
        license: listing.license,
        external_link: listing.external_link,
        status: listing.status,
        created_at: listing.created_at,
        updated_at: listing.updated_at,
        tags: tag_rows.into_iter().map(|t| t.name).collect(),
        rating_avg: review_stat.avg_rating,
        review_count: review_stat.count.unwrap_or(0),
    })
}

/// Get the seller info for a listing.
#[server(GetListingSeller, "/api")]
pub async fn get_listing_seller(seller_id: String) -> Result<bin_bag_core::models::user::PublicUser, ServerFnError> {
    use crate::state::AppState;

    let state = expect_context::<AppState>();

    let uid: uuid::Uuid = seller_id
        .parse()
        .map_err(|_| ServerFnError::new("Invalid user ID"))?;

    let user = sqlx::query_as::<_, bin_bag_core::models::user::User>(
        "SELECT * FROM users WHERE id = $1",
    )
    .bind(uid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?
    .ok_or_else(|| ServerFnError::new("User not found"))?;

    Ok(bin_bag_core::models::user::PublicUser::from(user))
}

/// List listings with filters and cursor-based pagination.
#[server(ListListings, "/api")]
pub async fn list_listings(
    listing_type: Option<String>,
    category: Option<String>,
    tag: Option<String>,
    seller_id: Option<String>,
    cursor: Option<String>,
    limit: Option<i64>,
) -> Result<PaginatedResult<ListingWithTags>, ServerFnError> {
    use crate::state::AppState;

    let state = expect_context::<AppState>();

    let page_limit = limit.unwrap_or(20).min(100);

    // Build the query dynamically
    let mut conditions = vec!["l.status = 'active'".to_string()];
    let mut param_idx = 0u32;

    // We'll use a simpler approach: runtime query building
    if let Some(ref lt) = listing_type {
        param_idx += 1;
        conditions.push(format!("l.listing_type = '{}'", lt.to_lowercase().replace('\'', "")));
    }
    if let Some(ref cat) = category {
        param_idx += 1;
        conditions.push(format!("l.category = '{}'", cat.replace('\'', "")));
    }
    if let Some(ref sid) = seller_id {
        conditions.push(format!("l.seller_id = '{}'", sid.replace('\'', "")));
    }

    // Cursor-based pagination: cursor is "created_at|id"
    if let Some(ref c) = cursor {
        let parts: Vec<&str> = c.splitn(2, '|').collect();
        if parts.len() == 2 {
            conditions.push(format!(
                "(l.created_at, l.id) < ('{}', '{}')",
                parts[0].replace('\'', ""),
                parts[1].replace('\'', "")
            ));
        }
    }

    let where_clause = conditions.join(" AND ");

    // If filtering by tag, we need a JOIN
    let tag_join = if let Some(ref t) = tag {
        format!(
            "JOIN listing_tags lt_filter ON l.id = lt_filter.listing_id \
             JOIN tags t_filter ON lt_filter.tag_id = t_filter.id AND t_filter.name = '{}'",
            t.to_lowercase().replace('\'', "")
        )
    } else {
        String::new()
    };

    let query = format!(
        "SELECT l.* FROM listings l {} WHERE {} ORDER BY l.created_at DESC, l.id DESC LIMIT {}",
        tag_join, where_clause, page_limit + 1
    );

    let rows = sqlx::query_as::<_, bin_bag_core::models::listing::Listing>(&query)
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?;

    let has_more = rows.len() as i64 > page_limit;
    let listings: Vec<_> = rows.into_iter().take(page_limit as usize).collect();

    let next_cursor = if has_more {
        listings.last().map(|l| {
            format!("{}|{}", l.created_at.to_rfc3339(), l.id)
        })
    } else {
        None
    };

    // Fetch tags for all listings
    let mut result = Vec::new();
    for listing in listings {
        let tag_rows = sqlx::query_as::<_, bin_bag_core::models::tag::Tag>(
            "SELECT t.* FROM tags t JOIN listing_tags lt ON t.id = lt.tag_id WHERE lt.listing_id = $1",
        )
        .bind(listing.id)
        .fetch_all(&state.db)
        .await
        .map_err(|e| ServerFnError::new(format!("Tag fetch error: {}", e)))?;

        #[derive(sqlx::FromRow)]
        struct ReviewStatRow {
            avg_rating: Option<f64>,
            count: Option<i64>,
        }

        let review_stat = sqlx::query_as::<_, ReviewStatRow>(
            "SELECT AVG(rating)::float as avg_rating, COUNT(*) as count FROM reviews WHERE listing_id = $1"
        )
        .bind(listing.id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| ServerFnError::new(e.to_string()))?;

        result.push(ListingWithTags {
            id: listing.id,
            seller_id: listing.seller_id,
            listing_type: listing.listing_type,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            price_cents: listing.price_cents,
            license: listing.license,
            external_link: listing.external_link,
            status: listing.status,
            created_at: listing.created_at,
            updated_at: listing.updated_at,
            tags: tag_rows.into_iter().map(|t| t.name).collect(),
            rating_avg: review_stat.avg_rating,
            review_count: review_stat.count.unwrap_or(0),
        });
    }

    Ok(PaginatedResult {
        items: result,
        next_cursor,
        total_estimate: None,
    })
}

/// Result of a playground inference run.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PlaygroundResult {
    pub output_text: String,
    pub latency_ms: u32,
    pub tokens_used: u32,
    pub is_simulated: bool,
}

/// Simulate a playground inference run for an AI model or prompt listing.
#[server(SimulatePlaygroundRun, "/api")]
pub async fn simulate_playground_run(
    listing_id: String,
    system_prompt: String,
    user_prompt: String,
    temperature: f32,
    max_tokens: u32,
) -> Result<PlaygroundResult, ServerFnError> {
    use std::time::Duration;
    #[cfg(feature = "ssr")]
    {
        tokio::time::sleep(Duration::from_millis(220)).await;
    }

    let prompt_lower = user_prompt.to_lowercase();
    let is_code_query = prompt_lower.contains("python")
        || prompt_lower.contains("code")
        || prompt_lower.contains("function")
        || prompt_lower.contains("rust")
        || prompt_lower.contains("script");
    let is_summary_query = prompt_lower.contains("summar")
        || prompt_lower.contains("explain")
        || prompt_lower.contains("analyze")
        || prompt_lower.contains("data");

    let output_text = if is_code_query {
        format!(
            "```python\n# Generated by Bin Bag AI Sandbox (temp: {:.1}, max_tokens: {})\n# System: {}\n\ndef solve_task(input_data):\n    \"\"\"\n    Optimized solution generated for query: {}\n    \"\"\"\n    results = []\n    for item in input_data:\n        processed = item.strip().lower()\n        if processed:\n            results.append(processed)\n    return sorted(results)\n\nprint(solve_task(['  AI  ', 'Bin Bag', 'Marketplace']))\n```",
            temperature, max_tokens, system_prompt.trim(), user_prompt.trim()
        )
    } else if is_summary_query {
        format!(
            "### AI Analysis & Summary Report\n\n**Parameters Applied**:\n- **Temperature**: {:.2}\n- **Max Tokens**: {}\n\n**Executive Insight**:\nBased on your prompt (`{}`), the AI asset evaluates the key dimensions of the input domain with 99.4% precision. This model uses hierarchical attention layers to isolate signal from noise, delivering production-ready inference.\n\n> *Note: This is an in-browser sandbox simulation. Full production license unlocks streaming APIs and unlimited concurrent requests.*",
            temperature, max_tokens, user_prompt.trim()
        )
    } else {
        format!(
            "**Simulated AI Inference Response**\n\nHello! I have processed your request:\n`{}`\n\n**Configuration**:\n- System instruction: *{}*\n- Temperature: `{:.2}` | Token limit: `{}`\n\nI am ready to be integrated into your production application or pipeline. Purchase this listing above to obtain your permanent license key and immediate API access!",
            user_prompt.trim(),
            if system_prompt.is_empty() { "Default AI Assistant" } else { system_prompt.trim() },
            temperature,
            max_tokens
        )
    };

    let tokens_used = (output_text.len() / 4) as u32 + 18;
    let latency_ms = 240 + ((temperature * 60.0) as u32);

    Ok(PlaygroundResult {
        output_text,
        latency_ms,
        tokens_used,
        is_simulated: true,
    })
}

