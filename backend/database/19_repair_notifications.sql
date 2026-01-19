-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 19 - NOTIFICATION SYSTEM REPAIR
-- Ensures the app_auth.notifications table has the required hierarchical columns
-- Use this if you encounter "column target_role_level does not exist" errors
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO app_auth, core, public;

-- Add missing columns individually with safety checks
DO $$
BEGIN
    -- target_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'notifications' AND column_name = 'target_type') THEN
        ALTER TABLE app_auth.notifications ADD COLUMN target_type VARCHAR(50) DEFAULT 'USER';
    END IF;

    -- target_role_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'notifications' AND column_name = 'target_role_level') THEN
        ALTER TABLE app_auth.notifications ADD COLUMN target_role_level INTEGER;
    END IF;

    -- sender_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'notifications' AND column_name = 'sender_id') THEN
        ALTER TABLE app_auth.notifications ADD COLUMN sender_id BIGINT REFERENCES app_auth.users(id);
    END IF;

    -- branch_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'notifications' AND column_name = 'branch_id') THEN
        ALTER TABLE app_auth.notifications ADD COLUMN branch_id BIGINT;
    END IF;

    -- role_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'notifications' AND column_name = 'role_id') THEN
        ALTER TABLE app_auth.notifications ADD COLUMN role_id BIGINT;
    END IF;

    -- category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'notifications' AND column_name = 'category') THEN
        ALTER TABLE app_auth.notifications ADD COLUMN category VARCHAR(50) DEFAULT 'INFORMATION';
    END IF;
END $$;

-- Ensure receipts table exists
CREATE TABLE IF NOT EXISTS app_auth.notification_read_receipts (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES app_auth.notifications(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

-- Re-apply indexes for missing columns
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON app_auth.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON app_auth.notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_target_role_level ON app_auth.notifications(target_role_level);
CREATE INDEX IF NOT EXISTS idx_read_receipts_user_id ON app_auth.notification_read_receipts(user_id);
