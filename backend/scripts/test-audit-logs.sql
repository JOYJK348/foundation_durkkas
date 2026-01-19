-- Test script to verify audit_logs table structure and insert test data
-- Run this in your Supabase SQL editor

-- First, check the current structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'app_auth' 
AND table_name = 'audit_logs'
ORDER BY ordinal_position;

-- Check if there are any existing audit logs
SELECT COUNT(*) as total_logs FROM app_auth.audit_logs;

-- Insert a test DELETE audit log
INSERT INTO app_auth.audit_logs (
    user_id,
    user_email,
    company_id,
    action,
    resource_type,
    resource_id,
    schema_name,
    table_name,
    old_values,
    new_values,
    ip_address,
    user_agent,
    created_at
) VALUES (
    1,
    'admin@durkkas.com',
    1,
    'DELETE',
    'companies',
    1,
    'core',
    'companies',
    '{"id": 1, "name": "Test Company", "code": "TEST", "is_active": true}'::jsonb,
    '{"delete_reason": "Testing archive system - Manual test entry", "is_active": false, "deleted_at": "2026-01-12T14:52:00Z"}'::jsonb,
    '127.0.0.1',
    'Test Script',
    NOW()
);

-- Verify the insert
SELECT 
    id,
    action,
    table_name,
    resource_id,
    created_at,
    old_values->>'name' as company_name,
    new_values->>'delete_reason' as reason
FROM app_auth.audit_logs
WHERE action IN ('DELETE', 'SOFT_DELETE')
ORDER BY created_at DESC
LIMIT 5;
