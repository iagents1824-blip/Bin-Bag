-- Phase 1: Tags + listing_tags junction table
CREATE TABLE tags (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE listing_tags (
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, tag_id)
);

CREATE INDEX idx_listing_tags_tag ON listing_tags (tag_id);
CREATE INDEX idx_tags_name ON tags (name);
