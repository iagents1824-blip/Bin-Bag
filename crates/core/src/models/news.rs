use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, sqlx::FromRow)]
pub struct NewsArticle {
    pub id: Uuid,
    pub title: String,
    pub url: String,
    pub source_name: String,
    pub summary: String,
    pub published_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateNewsArticleInput {
    pub title: String,
    pub url: String,
    pub source_name: String,
    pub summary: String,
    pub published_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DailyDigest {
    pub date_str: String,
    pub articles: Vec<NewsArticle>,
    pub total_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NewsFilter {
    pub source_name: Option<String>,
    pub date_str: Option<String>,
    pub query: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use uuid::Uuid;

    #[test]
    fn test_news_article_serialization() {
        let now = Utc::now();
        let article = NewsArticle {
            id: Uuid::new_v4(),
            title: "OpenAI Releases GPT-5 Beta".to_string(),
            url: "https://openai.com/blog/gpt-5-beta".to_string(),
            source_name: "OpenAI Blog".to_string(),
            summary: "OpenAI has announced the beta release of GPT-5 with improved reasoning."
                .to_string(),
            published_at: now,
            created_at: now,
        };

        let json = serde_json::to_string(&article).expect("Failed to serialize NewsArticle");
        let deserialized: NewsArticle =
            serde_json::from_str(&json).expect("Failed to deserialize NewsArticle");
        assert_eq!(article, deserialized);
    }
}
