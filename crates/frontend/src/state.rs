//! Bin Bag — App State
//!
//! Holds shared application state (database pool, JWT secret) for SSR.

#[cfg(feature = "ssr")]
use axum::extract::FromRef;
#[cfg(feature = "ssr")]
use leptos::prelude::LeptosOptions;

#[cfg(feature = "ssr")]
#[derive(Clone, Debug, Default)]
pub struct WsHub {
    pub senders: std::sync::Arc<
        tokio::sync::Mutex<
            std::collections::HashMap<
                uuid::Uuid,
                Vec<tokio::sync::mpsc::UnboundedSender<String>>,
            >,
        >,
    >,
}

#[cfg(feature = "ssr")]
impl WsHub {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn push_to_user(&self, user_id: &uuid::Uuid, message: &str) {
        let mut map = self.senders.lock().await;
        if let Some(senders) = map.get_mut(user_id) {
            senders.retain(|tx| tx.send(message.to_string()).is_ok());
        }
    }
}

#[cfg(feature = "ssr")]
#[derive(Clone, Debug)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub jwt_secret: String,
    pub leptos_options: LeptosOptions,
    pub ws_hub: WsHub,
}

#[cfg(feature = "ssr")]
impl FromRef<AppState> for LeptosOptions {
    fn from_ref(state: &AppState) -> Self {
        state.leptos_options.clone()
    }
}
