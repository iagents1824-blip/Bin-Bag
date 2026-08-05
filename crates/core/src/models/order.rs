use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "order_status", rename_all = "lowercase")]
pub enum OrderStatus {
    Pending,
    Completed,
    Refunded,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Order {
    pub id: Uuid,
    pub buyer_id: Uuid,
    pub listing_id: Uuid,
    pub seller_id: Uuid,
    pub price_cents: i64,
    pub status: OrderStatus,
    pub stripe_checkout_session_id: Option<String>,
    pub stripe_payment_intent_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateOrderInput {
    pub listing_id: Uuid,
    pub price_cents: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderWithListing {
    pub order: Order,
    pub listing_title: String,
    pub listing_type: String,
    pub seller_username: String,
    pub buyer_username: Option<String>,
    pub external_link: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SellerEarningsSummary {
    pub total_earnings_cents: i64,
    pub completed_orders_count: i64,
}
