-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ENHANCED NOTIFICATION SYSTEM (HIERARCHICAL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO app_auth, core, public;

-- 1. Update existing table to support hierarchy
ALTER TABLE app_auth.notifications 
ADD COLUMN IF NOT EXISTS sender_id BIGINT REFERENCES app_auth.users(id),
ADD COLUMN IF NOT EXISTS branch_id BIGINT,
ADD COLUMN IF NOT EXISTS role_id BIGINT,
ADD COLUMN IF NOT EXISTS target_type VARCHAR(50) DEFAULT 'USER', -- USER, ROLE, BRANCH, COMPANY, GLOBAL
ADD COLUMN IF NOT EXISTS target_role_level INTEGER, -- 4 for Company Admins, 1 for Branch Admins, etc.
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'INFORMATION'; 

-- 2. Delivery tracking table for broadcast notifications
-- This allows multiple users to mark a single broadcast notification as read
CREATE TABLE IF NOT EXISTS app_auth.notification_read_receipts (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES app_auth.notifications(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

-- 3. RLS and Security
ALTER TABLE app_auth.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see notifications targeted specifically to them, or to their company/branch/role
-- NOTE: We handle most scoping in the API for now to maintain consistency with the rest of the app, 
-- but RLS is added for extra safety.

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON app_auth.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON app_auth.notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_read_receipts_user_id ON app_auth.notification_read_receipts(user_id);

COMMENT ON COLUMN app_auth.notifications.target_type IS 'Targeting level: USER, ROLE, BRANCH, COMPANY (broadcast), GLOBAL (platform)';
COMMENT ON COLUMN app_auth.notifications.category IS 'Type of communication: ANNOUNCEMENT, ALERT, REMINDER, INFORMATION';
