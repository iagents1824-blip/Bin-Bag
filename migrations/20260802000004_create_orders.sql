-- Orders table and status enum
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'refunded', 'failed');

CREATE TABLE orders (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id                 UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    seller_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price_cents                BIGINT NOT NULL,
    status                     order_status NOT NULL DEFAULT 'pending',
    stripe_checkout_session_id TEXT UNIQUE,
    stripe_payment_intent_id   TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at               TIMESTAMPTZ
);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_listing_id ON orders(listing_id);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_checkout_session_id);
