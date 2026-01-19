-- Migration: Add Platform Admin capabilities to Companies table
-- Description: Adds subscription plans, limits, and module flags to support Platform Admin scope.

-- 1. Add Subscription and Limit Columns (Safe if exists)
ALTER TABLE core.companies
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'TRIAL', -- 'TRIAL', 'PRO', 'ENTERPRISE'
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'SUSPENDED'
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS max_users integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_branches integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS enabled_modules jsonb DEFAULT '["CORE"]'::jsonb;

-- 2. Data Cleanup (CRITICAL FIX)
-- Ensure ALL rows have valid data before applying constraints.
-- This handles existing rows that might have NULLs or invalid values from previous schema versions.

UPDATE core.companies
SET subscription_plan = 'TRIAL'
WHERE subscription_plan IS NULL 
   OR subscription_plan NOT IN ('TRIAL', 'PRO', 'ENTERPRISE');

UPDATE core.companies
SET subscription_status = 'ACTIVE'
WHERE subscription_status IS NULL 
   OR subscription_status NOT IN ('ACTIVE', 'EXPIRED', 'SUSPENDED');

-- Set default robust limits if not set
UPDATE core.companies
SET max_users = 10, max_branches = 1
WHERE max_users IS NULL OR max_branches IS NULL;

-- Ensure enabled_modules is valid JSON
UPDATE core.companies
SET enabled_modules = '["CORE"]'::jsonb
WHERE enabled_modules IS NULL;


-- 3. Add Constraints
-- Now that data is clean, these constraints will pass safely.

-- Dropping existing constraints if they exist to avoid "already exists" errors during re-runs
ALTER TABLE core.companies DROP CONSTRAINT IF EXISTS check_subscription_plan;
ALTER TABLE core.companies DROP CONSTRAINT IF EXISTS check_subscription_status;

ALTER TABLE core.companies 
ADD CONSTRAINT check_subscription_plan 
CHECK (subscription_plan IN ('TRIAL', 'PRO', 'ENTERPRISE'));

ALTER TABLE core.companies
ADD CONSTRAINT check_subscription_status
CHECK (subscription_status IN ('ACTIVE', 'EXPIRED', 'SUSPENDED'));

-- 4. Audit: Log that we upgraded the schema
INSERT INTO app_auth.audit_logs (action, table_name, changes, created_at)
VALUES ('SCHEMA_MIGRATION', 'core.companies', '{"action": "platform_admin_upgrade", "status": "completed"}'::jsonb, NOW());
