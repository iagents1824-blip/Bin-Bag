use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "thread_type", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum ThreadType {
    General,
    Qa,
}

impl std::fmt::Display for ThreadType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ThreadType::General => write!(f, "general"),
            ThreadType::Qa => write!(f, "qa"),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TopicTag {
    Accuracy,
    TrainingData,
    FineTuning,
    Benchmarks,
    Deployment,
}

impl TopicTag {
    pub fn as_str(&self) -> &'static str {
        match self {
            TopicTag::Accuracy => "accuracy",
            TopicTag::TrainingData => "training_data",
            TopicTag::FineTuning => "fine_tuning",
            TopicTag::Benchmarks => "benchmarks",
            TopicTag::Deployment => "deployment",
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            TopicTag::Accuracy => "Accuracy",
            TopicTag::TrainingData => "Training Data",
            TopicTag::FineTuning => "Fine-Tuning",
            TopicTag::Benchmarks => "Benchmarks",
            TopicTag::Deployment => "Deployment",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "accuracy" => Some(TopicTag::Accuracy),
            "training_data" | "trainingdata" => Some(TopicTag::TrainingData),
            "fine_tuning" | "finetuning" => Some(TopicTag::FineTuning),
            "benchmarks" => Some(TopicTag::Benchmarks),
            "deployment" => Some(TopicTag::Deployment),
            _ => None,
        }
    }

    pub fn all() -> &'static [TopicTag] {
        &[
            TopicTag::Accuracy,
            TopicTag::TrainingData,
            TopicTag::FineTuning,
            TopicTag::Benchmarks,
            TopicTag::Deployment,
        ]
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, sqlx::FromRow)]
pub struct Thread {
    pub id: Uuid,
    pub user_id: Uuid,
    pub listing_id: Option<Uuid>,
    pub thread_type: ThreadType,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub upvote_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ThreadWithAuthor {
    pub thread: Thread,
    pub author_username: String,
    pub author_role: String,
    pub author_avatar_url: Option<String>,
    pub reply_count: i64,
    pub user_has_upvoted: bool,
    pub listing_title: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Reply {
    pub id: Uuid,
    pub thread_id: Uuid,
    pub user_id: Uuid,
    pub content: String,
    pub is_accepted_answer: bool,
    pub is_expert_answer: bool,
    pub upvote_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplyWithAuthor {
    pub reply: Reply,
    pub author_username: String,
    pub author_role: String,
    pub author_avatar_url: Option<String>,
    pub user_has_upvoted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateThreadInput {
    pub title: String,
    pub content: String,
    pub thread_type: String,
    pub listing_id: Option<Uuid>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateReplyInput {
    pub thread_id: Uuid,
    pub content: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_topic_tag_conversion() {
        assert_eq!(TopicTag::from_str("fine_tuning"), Some(TopicTag::FineTuning));
        assert_eq!(TopicTag::from_str("Accuracy"), Some(TopicTag::Accuracy));
        assert_eq!(TopicTag::from_str("unknown"), None);
        assert_eq!(TopicTag::FineTuning.as_str(), "fine_tuning");
        assert_eq!(TopicTag::FineTuning.display_name(), "Fine-Tuning");
    }

    #[test]
    fn test_thread_type_display() {
        assert_eq!(ThreadType::Qa.to_string(), "qa");
        assert_eq!(ThreadType::General.to_string(), "general");
    }
}
