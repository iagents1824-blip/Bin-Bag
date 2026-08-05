#[cfg(feature = "ssr")]
use axum::{
    extract::{Query, State, WebSocketUpgrade, ws::{WebSocket, Message}},
    response::IntoResponse,
};
#[cfg(feature = "ssr")]
use serde::Deserialize;
#[cfg(feature = "ssr")]
use uuid::Uuid;

#[cfg(feature = "ssr")]
#[derive(Debug, Deserialize)]
pub struct WsQuery {
    pub token: Option<String>,
}

#[cfg(feature = "ssr")]
pub async fn handle_ws_upgrade(
    ws: WebSocketUpgrade,
    Query(query): Query<WsQuery>,
    headers: axum::http::HeaderMap,
    State(state): State<crate::state::AppState>,
) -> impl IntoResponse {
    use bin_bag_core::auth::decode_jwt;

    let mut token = query.token.unwrap_or_default();
    if token.is_empty() {
        if let Some(cookie_val) = headers.get("cookie").and_then(|v| v.to_str().ok()) {
            for part in cookie_val.split(';') {
                let part = part.trim();
                if let Some(stripped) = part.strip_prefix("bb_token=") {
                    token = stripped.to_string();
                    break;
                }
            }
        }
    }

    let user_id = match decode_jwt(&token, &state.jwt_secret) {
        Ok(claims) => match Uuid::parse_str(&claims.sub) {
            Ok(id) => id,
            Err(_) => return axum::http::StatusCode::UNAUTHORIZED.into_response(),
        },
        Err(_) => return axum::http::StatusCode::UNAUTHORIZED.into_response(),
    };

    ws.on_upgrade(move |socket| handle_ws_connection(socket, user_id, state))
}

#[cfg(feature = "ssr")]
async fn handle_ws_connection(
    mut socket: WebSocket,
    user_id: Uuid,
    state: crate::state::AppState,
) {
    use tokio::sync::mpsc;

    let (tx, mut rx) = mpsc::unbounded_channel::<String>();

    // Register tx in state.ws_hub
    {
        let mut map = state.ws_hub.senders.lock().await;
        map.entry(user_id).or_default().push(tx);
    }

    // Send initial connection confirmation
    let _ = socket.send(Message::Text(r#"{"msg_type":"connected"}"#.into())).await;

    // Loop sending messages from rx to socket
    while let Some(msg) = rx.recv().await {
        if socket.send(Message::Text(msg.into())).await.is_err() {
            break;
        }
    }

    // On disconnect, remove dead senders
    let mut map = state.ws_hub.senders.lock().await;
    if let Some(senders) = map.get_mut(&user_id) {
        senders.retain(|t| !t.is_closed());
    }
}
