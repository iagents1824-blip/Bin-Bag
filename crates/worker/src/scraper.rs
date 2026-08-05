//! RSS News Scraper & Ingestor
//!
//! Fetches AI news feeds, applies untrusted-content sanitization, deduplicates by URL,
//! and stores articles into PostgreSQL.

use crate::sanitizer::{is_safe_url, sanitize_untrusted_text};
use chrono::Utc;
use sqlx::PgPool;
use tracing::{info, warn};
use uuid::Uuid;

pub struct RssSource {
    pub name: &'static str,
    pub url: &'static str,
}

pub const DEFAULT_RSS_SOURCES: &[RssSource] = &[
    RssSource {
        name: "Hugging Face Blog",
        url: "https://huggingface.co/blog/feed.xml",
    },
    RssSource {
        name: "PyTorch Official Blog",
        url: "https://pytorch.org/blog/feed.xml",
    },
];

/// Fetches configured RSS feeds and ingests new articles into `news_articles`.
/// Also seeds curated AI articles if the database is empty or feeds are unreachable.
pub async fn fetch_and_ingest_rss_feeds(pool: &PgPool) -> Result<usize, sqlx::Error> {
    info!("Starting AI news ingestion cycle...");
    let mut total_inserted = 0;

    let client = reqwest::Client::builder()
        .user_agent("BinBag-AI-News-Aggregator/1.0 (Security-Audited Data Bot)")
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .unwrap_or_default();

    for source in DEFAULT_RSS_SOURCES {
        match fetch_single_feed(&client, pool, source).await {
            Ok(count) => {
                info!("Ingested {} articles from {}", count, source.name);
                total_inserted += count;
            }
            Err(e) => {
                warn!("Failed to fetch RSS from {}: {}", source.name, e);
            }
        }
    }

    // Ensure we always have high-quality seed AI news articles if feeds were offline
    let count_query = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM news_articles")
        .fetch_one(pool)
        .await?;
    if count_query == 0 {
        info!("No news articles found in DB; seeding curated AI headlines...");
        total_inserted += seed_default_ai_news(pool).await?;
    }

    info!("Completed news ingestion cycle. Total new articles: {}", total_inserted);
    Ok(total_inserted)
}

async fn fetch_single_feed(
    client: &reqwest::Client,
    pool: &PgPool,
    source: &RssSource,
) -> Result<usize, Box<dyn std::error::Error + Send + Sync>> {
    let resp_bytes = client.get(source.url).send().await?.bytes().await?;
    let channel = rss::Channel::read_from(&resp_bytes[..])?;

    let mut inserted = 0;
    for item in channel.items().iter().take(15) {
        let raw_url = match item.link() {
            Some(link) => link,
            None => continue,
        };
        if !is_safe_url(raw_url) {
            continue;
        }

        let raw_title = item.title().unwrap_or("Untitled AI Article");
        let raw_summary = item
            .description()
            .or(item.content())
            .unwrap_or("No description provided.");

        let title = sanitize_untrusted_text(raw_title, 200);
        let summary = sanitize_untrusted_text(raw_summary, 450);
        let now = Utc::now();

        // Parse RSS pubDate or default to current time
        let published_at = item
            .pub_date()
            .and_then(|d_str| chrono::DateTime::parse_from_rfc2822(d_str).ok())
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or(now);

        let res = sqlx::query(
            r#"
            INSERT INTO news_articles (id, title, url, source_name, summary, published_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (url) DO NOTHING
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(title)
        .bind(raw_url)
        .bind(source.name)
        .bind(summary)
        .bind(published_at)
        .bind(now)
        .execute(pool)
        .await?;

        if res.rows_affected() > 0 {
            inserted += 1;
        }
    }

    Ok(inserted)
}

pub async fn seed_default_ai_news(pool: &PgPool) -> Result<usize, sqlx::Error> {
    let now = Utc::now();
    let sample_articles = vec![
        (
            "Meta Releases Llama 3.2 with Lightweight Vision and Edge Optimization",
            "https://ai.meta.com/blog/llama-3-2-release-announcement/",
            "Meta AI Blog",
            "Meta has unveiled Llama 3.2, introducing small 1B and 3B parameter text models alongside 11B and 90B multimodal vision models optimized for edge devices.",
            now - chrono::Duration::hours(2),
        ),
        (
            "Hugging Face Launches Open Benchmarking Suite for Specialist Embeddings",
            "https://huggingface.co/blog/open-embedding-suite",
            "Hugging Face Blog",
            "The new evaluation framework allows researchers to test retrieval-augmented generation (RAG) embeddings against specialized code and medical domains.",
            now - chrono::Duration::hours(5),
        ),
        (
            "PyTorch 2.5 Released with Enhanced torch.compile and SDPA Improvements",
            "https://pytorch.org/blog/pytorch-2-5-released/",
            "PyTorch Official Blog",
            "PyTorch 2.5 brings significant speedups to scaled dot-product attention kernels and expands torch.compile compatibility for custom autograd functions.",
            now - chrono::Duration::hours(12),
        ),
        (
            "Meilisearch 1.10 Enhances Hybrid Search with Re-Ranking Support",
            "https://blog.meilisearch.com/meilisearch-1-10/",
            "Meilisearch Engineering",
            "Meilisearch 1.10 introduces native support for vector embedding rerankers, improving semantic search accuracy across large AI model catalogs.",
            now - chrono::Duration::hours(20),
        ),
        (
            "New Study on Parameter-Efficient Fine-Tuning (PEFT) for Code Generation",
            "https://arxiv.org/abs/2408.00001",
            "arXiv AI Daily",
            "Researchers demonstrate that LoRA rank adaptation combined with QLoRA 4-bit quantization matches full fine-tuning accuracy on HumanEval benchmarks.",
            now - chrono::Duration::hours(36),
        ),
    ];

    let mut count = 0;
    for (title, url, source, summary, pub_time) in sample_articles {
        let res = sqlx::query(
            r#"
            INSERT INTO news_articles (id, title, url, source_name, summary, published_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (url) DO NOTHING
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(title)
        .bind(url)
        .bind(source)
        .bind(summary)
        .bind(pub_time)
        .bind(now)
        .execute(pool)
        .await?;

        if res.rows_affected() > 0 {
            count += 1;
        }
    }

    Ok(count)
}
