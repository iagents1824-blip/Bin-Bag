use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, sqlx::FromRow)]
pub struct TrendingScoreRow {
    pub listing_id: Uuid,
    pub rank: i32,
    pub score: f64,
    pub rank_change: i32,
    pub calculated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TrendingLeaderboardItem {
    pub rank: i32,
    pub rank_change: i32,
    pub score: f64,
    pub listing: crate::models::listing::ListingWithTags,
    pub seller_username: String,
    pub seller_avatar_url: Option<String>,
    pub seller_role: crate::models::user::UserRole,
}

impl TrendingLeaderboardItem {
    pub fn is_new(&self) -> bool {
        self.rank_change == 999
    }

    pub fn format_rank_change(&self) -> String {
        if self.is_new() {
            "NEW".to_string()
        } else if self.rank_change > 0 {
            format!("+{}", self.rank_change)
        } else if self.rank_change < 0 {
            format!("{}", self.rank_change)
        } else {
            "—".to_string()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::listing::{LicenseType, ListingStatus, ListingType, ListingWithTags};
    use crate::models::user::UserRole;
    use chrono::Utc;
    use uuid::Uuid;

    #[test]
    fn test_format_rank_change() {
        let dummy_listing = ListingWithTags {
            id: Uuid::new_v4(),
            seller_id: Uuid::new_v4(),
            title: "Test Listing".to_string(),
            description: "Desc".to_string(),
            listing_type: ListingType::Model,
            category: "LLM".to_string(),
            price_cents: 0,
            license: LicenseType::Mit,
            external_link: None,
            status: ListingStatus::Active,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            tags: vec![],
            rating_avg: None,
            review_count: 0,
        };

        let mut item = TrendingLeaderboardItem {
            rank: 1,
            rank_change: 999,
            score: 85.5,
            listing: dummy_listing.clone(),
            seller_username: "seller".to_string(),
            seller_avatar_url: None,
            seller_role: UserRole::Seller,
        };
        assert!(item.is_new());
        assert_eq!(item.format_rank_change(), "NEW");

        item.rank_change = 3;
        assert_eq!(item.format_rank_change(), "+3");

        item.rank_change = -2;
        assert_eq!(item.format_rank_change(), "-2");

        item.rank_change = 0;
        assert_eq!(item.format_rank_change(), "—");
    }
}
