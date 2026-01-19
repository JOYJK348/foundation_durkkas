-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- EXPOSE CORE SCHEMA IN SUPABASE
-- Run this in your Supabase SQL Editor to make 'core' schema accessible via REST API
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Step 1: Grant usage on core schema to anon and authenticated roles
GRANT USAGE ON SCHEMA core TO anon, authenticated, service_role;

-- Step 1.5: Grant usage on sequences (CRITICAL for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA core TO anon, authenticated, service_role;

-- Step 2: Grant SELECT on all tables in core schema
GRANT SELECT ON ALL TABLES IN SCHEMA core TO anon, authenticated, service_role;

-- Step 3: Grant INSERT, UPDATE, DELETE on all tables (for service_role only)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA core TO service_role;

-- Step 4: Grant EXECUTE on all functions in core schema
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA core TO anon, authenticated, service_role;

-- Step 5: Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT SELECT ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- Step 6: Update PostgREST schema cache (this tells Supabase to expose the schema)
NOTIFY pgrst, 'reload schema';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Check if core schema is accessible
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'core';

-- Check tables in core schema
SELECT table_name FROM information_schema.tables WHERE table_schema = 'core';

-- Check table permissions
SELECT grantee, table_schema, table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema = 'core'
ORDER BY table_name, grantee;
