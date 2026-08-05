use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct PlatformAnalytics {
    pub total_users: i64,
    pub total_sellers: i64,
    pub total_experts: i64,
    pub new_users_7d: i64,
    pub total_gmv_cents: i64,
    pub gmv_7d_cents: i64,
    pub total_orders: i64,
    pub completed_orders_7d: i64,
    pub active_listings: i64,
    pub total_listings: i64,
    pub delisted_listings: i64,
    pub total_threads: i64,
    pub total_replies: i64,
    pub expert_answers: i64,
    pub total_news_articles: i64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExpertApplicationStatus {
    Pending,
    Approved,
    Rejected,
}

impl ExpertApplicationStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Approved => "approved",
            Self::Rejected => "rejected",
        }
    }
}

impl std::fmt::Display for ExpertApplicationStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, sqlx::FromRow)]
pub struct ExpertApplication {
    pub id: Uuid,
    pub user_id: Uuid,
    pub username: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub expertise_area: String,
    pub credentials_url: Option<String>,
    pub statement: String,
    pub status: String,
    pub reviewed_by: Option<Uuid>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_expert_application_status_str() {
        assert_eq!(ExpertApplicationStatus::Pending.as_str(), "pending");
        assert_eq!(ExpertApplicationStatus::Approved.as_str(), "approved");
        assert_eq!(ExpertApplicationStatus::Rejected.as_str(), "rejected");
    }

    #[test]
    fn test_platform_analytics_default() {
        let analytics = PlatformAnalytics::default();
        assert_eq!(analytics.total_gmv_cents, 0);
        assert_eq!(analytics.total_users, 0);
    }
}
