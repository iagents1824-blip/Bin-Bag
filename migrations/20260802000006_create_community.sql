-- Create custom enum for thread type
CREATE TYPE thread_type AS ENUM ('general', 'qa');

-- Threads table
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NULL REFERENCES listings(id) ON DELETE SET NULL,
    thread_type thread_type NOT NULL DEFAULT 'general',
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    upvote_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices on threads
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_listing_id ON threads(listing_id);
CREATE INDEX idx_threads_type ON threads(thread_type);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX idx_threads_tags ON threads USING GIN(tags);

-- Thread replies table
CREATE TABLE thread_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_accepted_answer BOOLEAN NOT NULL DEFAULT FALSE,
    is_expert_answer BOOLEAN NOT NULL DEFAULT FALSE,
    upvote_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices on replies
CREATE INDEX idx_replies_thread_id ON thread_replies(thread_id);
CREATE INDEX idx_replies_user_id ON thread_replies(user_id);
CREATE INDEX idx_replies_created_at ON thread_replies(created_at ASC);

-- Upvotes table (prevents duplicate votes)
CREATE TABLE upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- 'thread' or 'reply'
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uniq_upvote UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_upvotes_user_target ON upvotes(user_id, target_type, target_id);
CREATE INDEX idx_upvotes_target ON upvotes(target_type, target_id);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    notification_type VARCHAR(30) NOT NULL, -- 'reply', 'answer', 'accepted'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_url VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
