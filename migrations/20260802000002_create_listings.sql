-- Phase 1: Listings table
CREATE TYPE listing_type AS ENUM (
    'model', 'chatbot', 'assistant', 'workflow', 'prompt', 'dataset'
);

CREATE TYPE listing_status AS ENUM ('draft', 'active', 'delisted');

CREATE TYPE license_type AS ENUM (
    'mit', 'apache2', 'gpl3', 'proprietary', 'custom', 'other'
);

CREATE TABLE listings (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_type   listing_type NOT NULL,
    title          TEXT NOT NULL,
    description    TEXT NOT NULL,
    category       TEXT NOT NULL,
    price_cents    INTEGER NOT NULL DEFAULT 0,
    license        license_type NOT NULL DEFAULT 'other',
    external_link  TEXT,
    status         listing_status NOT NULL DEFAULT 'draft',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_seller ON listings (seller_id);
CREATE INDEX idx_listings_status ON listings (status);
CREATE INDEX idx_listings_type ON listings (listing_type);
CREATE INDEX idx_listings_category ON listings (category);
CREATE INDEX idx_listings_created ON listings (created_at DESC);
