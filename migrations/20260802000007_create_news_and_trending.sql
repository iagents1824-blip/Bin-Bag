-- Migration: Create news_articles and trending_scores tables

-- Table: news_articles
-- Stores RSS/API aggregated AI news items (sanitized plain text only)
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source_name VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_source_name ON news_articles (source_name);

-- Table: trending_scores
-- Stores daily recalculated ranking scores and rank changes for marketplace listings
CREATE TABLE IF NOT EXISTS trending_scores (
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    rank_change INTEGER NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (listing_id, calculated_at)
);

CREATE INDEX IF NOT EXISTS idx_trending_scores_rank ON trending_scores (rank ASC);
CREATE INDEX IF NOT EXISTS idx_trending_scores_calculated_at ON trending_scores (calculated_at DESC);
