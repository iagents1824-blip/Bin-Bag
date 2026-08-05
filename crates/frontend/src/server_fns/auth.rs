//! Auth server functions — signup, login, logout, get_current_user, update_profile.

use leptos::prelude::*;
use bin_bag_core::models::user::{PublicUser, UpdateProfileInput, UserRole};
use serde::{Deserialize, Serialize};

/// Sign up a new user.
#[server(Signup, "/api")]
pub async fn signup(
    email: String,
    username: String,
    password: String,
    role: String,
) -> Result<PublicUser, ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::auth::{encode_jwt, hash_password};
    use leptos_axum::ResponseOptions;

    // Validate inputs
    if email.trim().is_empty() || !email.contains('@') {
        return Err(ServerFnError::new("Invalid email address"));
    }
    if username.trim().len() < 3 {
        return Err(ServerFnError::new(
            "Username must be at least 3 characters",
        ));
    }
    if password.len() < 8 {
        return Err(ServerFnError::new(
            "Password must be at least 8 characters",
        ));
    }

    let state = expect_context::<AppState>();
    let response = expect_context::<ResponseOptions>();

    // Parse role (default to buyer)
    let user_role = match role.to_lowercase().as_str() {
        "seller" => UserRole::Seller,
        "expert" => UserRole::Expert,
        _ => UserRole::Buyer,
    };

    // Hash password
    let password_hash = hash_password(&password)
        .map_err(|e| ServerFnError::new(format!("Password hashing failed: {}", e)))?;

    // Insert user
    let user = sqlx::query_as::<_, bin_bag_core::models::user::User>(
        r#"
        INSERT INTO users (email, username, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, username, password_hash, display_name, bio, avatar_url, role, created_at, updated_at
        "#,
    )
    .bind(email.trim().to_lowercase())
    .bind(username.trim())
    .bind(&password_hash)
    .bind(&user_role)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        if e.to_string().contains("duplicate key") {
            if e.to_string().contains("email") {
                ServerFnError::new("An account with this email already exists")
            } else {
                ServerFnError::new("This username is already taken")
            }
        } else {
            ServerFnError::new(format!("Database error: {}", e))
        }
    })?;

    // Create JWT and set cookie
    let token = encode_jwt(&user.id, &user.role, &state.jwt_secret)
        .map_err(|e| ServerFnError::new(format!("Token creation failed: {}", e)))?;

    response.insert_header(
        http::header::SET_COOKIE,
        http::HeaderValue::from_str(&format!(
            "bb_token={}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400",
            token
        ))
        .unwrap(),
    );

    Ok(PublicUser::from(user))
}

/// Log in an existing user.
#[server(Login, "/api")]
pub async fn login(email: String, password: String) -> Result<PublicUser, ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::auth::{encode_jwt, verify_password};
    use leptos_axum::ResponseOptions;

    if email.trim().is_empty() {
        return Err(ServerFnError::new("Email is required"));
    }
    if password.is_empty() {
        return Err(ServerFnError::new("Password is required"));
    }

    let state = expect_context::<AppState>();
    let response = expect_context::<ResponseOptions>();

    // Fetch user by email
    let user = sqlx::query_as::<_, bin_bag_core::models::user::User>(
        "SELECT * FROM users WHERE email = $1",
    )
    .bind(email.trim().to_lowercase())
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?
    .ok_or_else(|| ServerFnError::new("Invalid email or password"))?;

    // Verify password
    let valid = verify_password(&password, &user.password_hash)
        .map_err(|e| ServerFnError::new(format!("Verification error: {}", e)))?;

    if !valid {
        return Err(ServerFnError::new("Invalid email or password"));
    }

    // Create JWT and set cookie
    let token = encode_jwt(&user.id, &user.role, &state.jwt_secret)
        .map_err(|e| ServerFnError::new(format!("Token creation failed: {}", e)))?;

    response.insert_header(
        http::header::SET_COOKIE,
        http::HeaderValue::from_str(&format!(
            "bb_token={}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400",
            token
        ))
        .unwrap(),
    );

    Ok(PublicUser::from(user))
}

/// Log out the current user.
#[server(Logout, "/api")]
pub async fn logout() -> Result<(), ServerFnError> {
    use leptos_axum::ResponseOptions;

    let response = expect_context::<ResponseOptions>();

    // Clear the cookie
    response.insert_header(
        http::header::SET_COOKIE,
        http::HeaderValue::from_static(
            "bb_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
        ),
    );

    Ok(())
}

/// Get the currently authenticated user (if any).
#[server(GetCurrentUser, "/api")]
pub async fn get_current_user() -> Result<Option<PublicUser>, ServerFnError> {
    use crate::state::AppState;
    use bin_bag_core::auth::decode_jwt;
    use leptos_axum::extract;

    let state = expect_context::<AppState>();

    // Extract cookies from the request
    let headers: http::HeaderMap = extract().await?;
    let cookie_header = headers
        .get(http::header::COOKIE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    // Parse the bb_token cookie
    let token = cookie_header
        .split(';')
        .filter_map(|s| {
            let s = s.trim();
            if s.starts_with("bb_token=") {
                Some(s.trim_start_matches("bb_token="))
            } else {
                None
            }
        })
        .next();

    let token = match token {
        Some(t) if !t.is_empty() => t,
        _ => return Ok(None),
    };

    // Decode JWT
    let claims = match decode_jwt(token, &state.jwt_secret) {
        Ok(c) => c,
        Err(_) => return Ok(None),
    };

    // Parse user ID from claims
    let user_id: uuid::Uuid = claims
        .sub
        .parse()
        .map_err(|_| ServerFnError::new("Invalid token"))?;

    // Fetch user
    let user = sqlx::query_as::<_, bin_bag_core::models::user::User>(
        "SELECT * FROM users WHERE id = $1",
    )
    .bind(user_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?;

    Ok(user.map(PublicUser::from))
}

/// Update the current user's profile.
#[server(UpdateProfile, "/api")]
pub async fn update_profile(
    display_name: Option<String>,
    bio: Option<String>,
    avatar_url: Option<String>,
) -> Result<PublicUser, ServerFnError> {
    use crate::state::AppState;

    let state = expect_context::<AppState>();

    // Get current user
    let current_user = get_current_user()
        .await?
        .ok_or_else(|| ServerFnError::new("You must be logged in"))?;

    let user = sqlx::query_as::<_, bin_bag_core::models::user::User>(
        r#"
        UPDATE users
        SET display_name = COALESCE($1, display_name),
            bio = COALESCE($2, bio),
            avatar_url = COALESCE($3, avatar_url),
            updated_at = now()
        WHERE id = $4
        RETURNING id, email, username, password_hash, display_name, bio, avatar_url, role, created_at, updated_at
        "#,
    )
    .bind(&display_name)
    .bind(&bio)
    .bind(&avatar_url)
    .bind(current_user.id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?;

    Ok(PublicUser::from(user))
}

/// Get a user's public profile by username.
#[server(GetUserProfile, "/api")]
pub async fn get_user_profile(username: String) -> Result<PublicUser, ServerFnError> {
    use crate::state::AppState;

    let state = expect_context::<AppState>();

    let user = sqlx::query_as::<_, bin_bag_core::models::user::User>(
        "SELECT * FROM users WHERE username = $1",
    )
    .bind(&username)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?
    .ok_or_else(|| ServerFnError::new("User not found"))?;

    Ok(PublicUser::from(user))
}

#[cfg(feature = "ssr")]
pub async fn get_current_user_db(
    state: &crate::state::AppState,
) -> Result<Option<bin_bag_core::models::user::User>, ServerFnError> {
    use bin_bag_core::auth::decode_jwt;
    use leptos_axum::extract;
    let headers: http::HeaderMap = extract().await?;
    let cookie_header = headers
        .get(http::header::COOKIE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    let token = cookie_header
        .split(';')
        .filter_map(|s| {
            let s = s.trim();
            if s.starts_with("bb_token=") {
                Some(s.trim_start_matches("bb_token="))
            } else {
                None
            }
        })
        .next();
    let token = match token {
        Some(t) if !t.is_empty() => t,
        _ => return Ok(None),
    };
    let claims = match decode_jwt(token, &state.jwt_secret) {
        Ok(c) => c,
        Err(_) => return Ok(None),
    };
    let user_id: uuid::Uuid = match claims.sub.parse() {
        Ok(id) => id,
        Err(_) => return Ok(None),
    };
    let user = sqlx::query_as::<_, bin_bag_core::models::user::User>(
        "SELECT * FROM users WHERE id = $1",
    )
    .bind(user_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| ServerFnError::new(format!("Database error: {}", e)))?;
    Ok(user)
}
