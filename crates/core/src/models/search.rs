use serde::{Deserialize, Serialize};
use crate::models::listing::ListingWithTags;
use crate::models::community::ThreadWithAuthor;
use crate::models::news::NewsArticle;

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct SearchQuery {
    pub q: String,
    pub content_type: Option<String>, // "all", "listings", "threads", "news"
    pub listing_type: Option<String>, // "Model", "Chatbot", etc.
    pub category: Option<String>,
    pub min_price_cents: Option<i32>,
    pub max_price_cents: Option<i32>,
    pub min_rating: Option<f64>,
    pub license: Option<String>,
    pub sort_by: Option<String>, // "relevance", "newest", "popular"
    pub limit: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", content = "data")]
pub enum SearchResultItem {
    Listing(ListingWithTags),
    Thread(ThreadWithAuthor),
    News(NewsArticle),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CrossContentSearchResult {
    pub query: String,
    pub items: Vec<SearchResultItem>,
    pub total_count: usize,
    pub listings_count: usize,
    pub threads_count: usize,
    pub news_count: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_query_default() {
        let query = SearchQuery::default();
        assert!(query.q.is_empty());
        assert!(query.content_type.is_none());
        assert!(query.limit.is_none());
    }

    #[test]
    fn test_search_result_item_serialization() {
        let news = NewsArticle {
            id: uuid::Uuid::nil(),
            title: "Test AI Article".to_string(),
            url: "https://example.com/ai".to_string(),
            source_name: "AI Blog".to_string(),
            summary: "Summary text".to_string(),
            published_at: chrono::Utc::now(),
            created_at: chrono::Utc::now(),
        };
        let item = SearchResultItem::News(news);
        let json = serde_json::to_string(&item).unwrap();
        assert!(json.contains("Test AI Article"));
        assert!(json.contains("\"type\":\"News\""));
    }
}
