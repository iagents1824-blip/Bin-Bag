-- Enable trigram extension for similarity matching if available
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create expert verification applications table
CREATE TABLE IF NOT EXISTS expert_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expertise_area VARCHAR(255) NOT NULL,
    credentials_url VARCHAR(512),
    statement TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying pending expert applications quickly
CREATE INDEX IF NOT EXISTS idx_expert_applications_status ON expert_applications(status);
CREATE INDEX IF NOT EXISTS idx_expert_applications_user_id ON expert_applications(user_id);

-- Full-Text Search GIN indexes across listings, threads, and news_articles
CREATE INDEX IF NOT EXISTS idx_listings_fts ON listings 
USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')));

CREATE INDEX IF NOT EXISTS idx_threads_fts ON threads 
USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

CREATE INDEX IF NOT EXISTS idx_news_fts ON news_articles 
USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(source_name, '')));
