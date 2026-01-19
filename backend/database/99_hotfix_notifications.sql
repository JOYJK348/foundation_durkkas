-- HOTFIX: Add missing columns to notifications table
-- Run this in your Supabase SQL Editor or psql terminal

SET search_path TO app_auth, core, public;

-- Add new columns if they don't exist
ALTER TABLE app_auth.notifications 
ADD COLUMN IF NOT EXISTS target_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS target_role_level INT,
ADD COLUMN IF NOT EXISTS sender_id BIGINT REFERENCES app_auth.users(id),
ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES core.branches(id),
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'INFO';

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_notifications_branch_id ON app_auth.notifications(branch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON app_auth.notifications(target_type);

-- Verification
DO $$
BEGIN
    RAISE NOTICE '✅ Notifications table updated successfully with isolation columns';
END $$;
