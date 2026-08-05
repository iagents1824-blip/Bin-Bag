//! Bin Bag Worker — Scheduled Jobs
//!
//! Autonomous background daemon handling:
//! 1. AI news aggregation via RSS feeds (every 6 hours)
//! 2. Trending-models leaderboard recalculation (daily at midnight)
//! 3. Immediate startup ingestion cycle for local development & verification

use sqlx::postgres::PgPoolOptions;
use std::env;
use tokio_cron_scheduler::{Job, JobScheduler};
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("bin_bag_worker=info".parse()?))
        .init();

    info!("Starting Bin Bag Worker (Phase 4: AI News & Trending Leaderboard)...");

    // 2. Connect to Database
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/bin_bag".to_string());

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    info!("Connected to database. Performing initial Phase 4 ingestion cycle...");

    // 3. Perform initial verification run on startup
    match bin_bag_worker::scraper::fetch_and_ingest_rss_feeds(&pool).await {
        Ok(count) => info!("Startup news ingestion complete. Ingested: {} articles.", count),
        Err(e) => error!("Startup news ingestion error: {}", e),
    }

    match bin_bag_worker::trending_calc::recalculate_trending_scores(&pool).await {
        Ok(count) => info!("Startup trending leaderboard calculation complete. Scored: {} listings.", count),
        Err(e) => error!("Startup trending leaderboard error: {}", e),
    }

    // 4. Set up Scheduler
    let sched = JobScheduler::new().await?;

    let pool_news = pool.clone();
    let job_news = Job::new_async("0 0 */6 * * * *", move |_uuid, _l| {
        let pool_ref = pool_news.clone();
        Box::pin(async move {
            info!("Scheduled job triggered: RSS News Ingestion");
            if let Err(e) = bin_bag_worker::scraper::fetch_and_ingest_rss_feeds(&pool_ref).await {
                error!("Scheduled RSS ingestion error: {}", e);
            }
        })
    })?;
    sched.add(job_news).await?;

    let pool_trending = pool.clone();
    let job_trending = Job::new_async("0 0 0 * * * *", move |_uuid, _l| {
        let pool_ref = pool_trending.clone();
        Box::pin(async move {
            info!("Scheduled job triggered: Trending Leaderboard Calculation");
            if let Err(e) = bin_bag_worker::trending_calc::recalculate_trending_scores(&pool_ref).await {
                error!("Scheduled trending leaderboard error: {}", e);
            }
        })
    })?;
    sched.add(job_trending).await?;

    sched.start().await?;
    info!("Scheduler running. Background worker is active.");

    // Keep daemon running
    tokio::signal::ctrl_c().await?;
    info!("Shutting down Bin Bag Worker.");
    Ok(())
}
