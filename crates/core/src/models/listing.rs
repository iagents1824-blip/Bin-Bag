use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "listing_type", rename_all = "lowercase")]
pub enum ListingType {
    Model,
    Chatbot,
    Assistant,
    Workflow,
    Prompt,
    Dataset,
}

impl fmt::Display for ListingType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            ListingType::Model => "Model",
            ListingType::Chatbot => "Chatbot",
            ListingType::Assistant => "Assistant",
            ListingType::Workflow => "Workflow",
            ListingType::Prompt => "Prompt",
            ListingType::Dataset => "Dataset",
        };
        write!(f, "{}", s)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "listing_status", rename_all = "lowercase")]
pub enum ListingStatus {
    Draft,
    Active,
    Delisted,
}

impl fmt::Display for ListingStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            ListingStatus::Draft => "Draft",
            ListingStatus::Active => "Active",
            ListingStatus::Delisted => "Delisted",
        };
        write!(f, "{}", s)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "license_type", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum LicenseType {
    Mit,
    Apache2,
    Gpl3,
    Proprietary,
    Custom,
    Other,
}

impl fmt::Display for LicenseType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            LicenseType::Mit => "MIT",
            LicenseType::Apache2 => "Apache 2.0",
            LicenseType::Gpl3 => "GPLv3",
            LicenseType::Proprietary => "Proprietary",
            LicenseType::Custom => "Custom",
            LicenseType::Other => "Other",
        };
        write!(f, "{}", s)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Listing {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub title: String,
    pub description: String,
    pub listing_type: ListingType,
    pub category: String,
    pub price_cents: i32,
    pub license: LicenseType,
    pub external_link: Option<String>,
    pub status: ListingStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, sqlx::FromRow)]
pub struct ListingWithTags {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub title: String,
    pub description: String,
    pub listing_type: ListingType,
    pub category: String,
    pub price_cents: i32,
    pub license: LicenseType,
    pub external_link: Option<String>,
    pub status: ListingStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tags: Vec<String>,
    pub rating_avg: Option<f64>,
    pub review_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateListingInput {
    pub title: String,
    pub description: String,
    pub listing_type: ListingType,
    pub category: String,
    pub price_cents: i32,
    pub license: LicenseType,
    pub external_link: Option<String>,
    pub status: ListingStatus,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateListingInput {
    pub title: Option<String>,
    pub description: Option<String>,
    pub listing_type: Option<ListingType>,
    pub category: Option<String>,
    pub price_cents: Option<i32>,
    pub license: Option<LicenseType>,
    pub external_link: Option<String>,
    pub status: Option<ListingStatus>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ListingsFilter {
    pub listing_type: Option<ListingType>,
    pub category: Option<String>,
    pub tag: Option<String>,
    pub status: Option<ListingStatus>,
    pub seller_id: Option<Uuid>,
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResult<T: Serialize + Clone> {
    pub items: Vec<T>,
    pub next_cursor: Option<String>,
    pub total_estimate: Option<i64>,
}
