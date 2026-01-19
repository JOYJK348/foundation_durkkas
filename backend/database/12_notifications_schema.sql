-- Notification System Schema
-- Generates alerts for platform and company admins

SET search_path TO app_auth, core, public;

CREATE TABLE IF NOT EXISTS app_auth.notifications (
    id BIGSERIAL PRIMARY KEY,
    
    -- Target Audience
    user_id BIGINT REFERENCES app_auth.users(id) ON DELETE CASCADE,
    company_id BIGINT,
    branch_id BIGINT REFERENCES core.branches(id),  -- Added for branch isolation
    
    -- Target Scope (NEW for Isolation)
    target_type VARCHAR(50),  -- 'GLOBAL', 'COMPANY', 'BRANCH', 'USER', 'ROLE'
    target_role_level INT,    -- 5=Platform, 4=Company, 1=Branch
    
    -- Sender Context
    sender_id BIGINT REFERENCES app_auth.users(id),
    
    -- Content & Category
    category VARCHAR(50) DEFAULT 'INFO', -- 'ALERT', 'ANNOUNCEMENT', 'REMINDER', 'INFO'
    type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Payload & Actions
    action_url TEXT,
    metadata JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON app_auth.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON app_auth.notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_branch_id ON app_auth.notifications(branch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON app_auth.notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON app_auth.notifications(created_at);

-- Permissions
GRANT ALL ON TABLE app_auth.notifications TO postgres;
GRANT ALL ON TABLE app_auth.notifications TO authenticated;
GRANT ALL ON TABLE app_auth.notifications TO service_role;
