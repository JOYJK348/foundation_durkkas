-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIX SEQUENCE PERMISSIONS
-- Run this in Supabase SQL Editor to resolve "permission denied for sequence" errors
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Grant USAGE on existing sequences (Required for ID auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA core TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app_auth TO anon, authenticated, service_role;

-- 2. Ensure future sequences automatically get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_auth GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- 3. Notify Schema Cache Reload
NOTIFY pgrst, 'reload schema';
