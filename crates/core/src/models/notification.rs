use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NotificationType {
    Reply,
    Answer,
    Accepted,
    SystemAlert,
}

impl NotificationType {
    pub fn as_str(&self) -> &'static str {
        match self {
            NotificationType::Reply => "reply",
            NotificationType::Answer => "answer",
            NotificationType::Accepted => "accepted",
            NotificationType::SystemAlert => "system_alert",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Notification {
    pub id: Uuid,
    pub user_id: Uuid,
    pub sender_id: Option<Uuid>,
    pub notification_type: String,
    pub title: String,
    pub message: String,
    pub target_url: String,
    pub is_read: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketMessage {
    pub msg_type: String, // "notification" or "ping"
    pub payload: Option<Notification>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_notification_type_str() {
        assert_eq!(NotificationType::Reply.as_str(), "reply");
        assert_eq!(NotificationType::Answer.as_str(), "answer");
        assert_eq!(NotificationType::Accepted.as_str(), "accepted");
    }
}
