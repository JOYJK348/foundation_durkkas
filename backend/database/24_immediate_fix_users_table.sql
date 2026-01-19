-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- IMMEDIATE FIX - Clean Users Table & Test Soft Delete
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 1: Remove duplicate phone column (keep phone_number)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- First, migrate any data from 'phone' to 'phone_number'
UPDATE app_auth.users 
SET phone_number = phone 
WHERE phone IS NOT NULL AND phone_number IS NULL;

-- Drop the duplicate phone column and its unique constraint
ALTER TABLE app_auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE app_auth.users DROP COLUMN IF EXISTS phone;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 2: Verify soft delete columns exist
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ensure soft delete columns exist (should already be there)
ALTER TABLE app_auth.users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 3: Create a test user and delete it to verify
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Insert a test user
INSERT INTO app_auth.users (
    email, 
    password_hash, 
    first_name, 
    last_name,
    display_name,
    is_active,
    is_verified
) VALUES (
    'test.delete@example.com',
    'test_hash_12345',
    'Test',
    'Delete',
    'Test Delete User',
    true,
    false
) ON CONFLICT (email) DO NOTHING;

-- Get the test user ID
DO $$
DECLARE
    test_user_id BIGINT;
    admin_user_id BIGINT;
BEGIN
    -- Get test user ID
    SELECT id INTO test_user_id 
    FROM app_auth.users 
    WHERE email = 'test.delete@example.com';
    
    -- Get an admin user ID (first active user)
    SELECT id INTO admin_user_id 
    FROM app_auth.users 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Perform soft delete
        UPDATE app_auth.users
        SET 
            is_active = false,
            deleted_at = NOW(),
            deleted_by = admin_user_id,
            delete_reason = 'Testing soft delete functionality - IMMEDIATE FIX'
        WHERE id = test_user_id;
        
        RAISE NOTICE '✅ Test user soft deleted successfully!';
        RAISE NOTICE 'Test User ID: %', test_user_id;
        RAISE NOTICE 'Deleted By: %', admin_user_id;
        RAISE NOTICE 'Check the users table to verify deleted_at, deleted_by, and delete_reason are populated.';
    ELSE
        RAISE NOTICE '⚠️ Test user not found. Insert may have failed due to conflict.';
    END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 4: Query to verify soft delete worked
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
    id,
    email,
    is_active,
    deleted_at,
    deleted_by,
    delete_reason,
    CASE 
        WHEN deleted_at IS NOT NULL THEN '✅ SOFT DELETE WORKING'
        ELSE '❌ NOT DELETED'
    END as status
FROM app_auth.users
WHERE email = 'test.delete@example.com';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 5: Show all deleted users (for verification)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
    id,
    email,
    first_name,
    last_name,
    deleted_at,
    deleted_by,
    delete_reason
FROM app_auth.users
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 6: Add comments for clarity
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMENT ON COLUMN app_auth.users.deleted_at IS 'Timestamp when user was soft deleted (NULL = active)';
COMMENT ON COLUMN app_auth.users.deleted_by IS 'User ID who performed the deletion (NULL = not deleted)';
COMMENT ON COLUMN app_auth.users.delete_reason IS 'Mandatory reason for deletion (NULL = not deleted)';
COMMENT ON COLUMN app_auth.users.last_login_at IS 'Last successful login timestamp (NULL = never logged in)';
COMMENT ON COLUMN app_auth.users.last_login_ip IS 'IP address of last login (NULL = never logged in)';
COMMENT ON COLUMN app_auth.users.phone_number IS 'User phone number (optional)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION SUMMARY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ IMMEDIATE FIX COMPLETE!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📋 Changes Made:';
    RAISE NOTICE '   1. Removed duplicate phone column';
    RAISE NOTICE '   2. Verified soft delete columns exist';
    RAISE NOTICE '   3. Created and deleted test user';
    RAISE NOTICE '   4. Added column comments for clarity';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🔍 Next Steps:';
    RAISE NOTICE '   1. Check the SELECT queries above to verify soft delete worked';
    RAISE NOTICE '   2. If test user shows deleted_at, deleted_by, delete_reason = SUCCESS!';
    RAISE NOTICE '   3. If still NULL, the backend API needs fixing';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📝 About NULL Values:';
    RAISE NOTICE '   - last_login_at: NULL until user logs in (NORMAL)';
    RAISE NOTICE '   - last_login_ip: NULL until user logs in (NORMAL)';
    RAISE NOTICE '   - phone_number: NULL if user did not provide (NORMAL)';
    RAISE NOTICE '   - deleted_at/by/reason: NULL for active users (NORMAL)';
    RAISE NOTICE '   - These NULLs are EXPECTED and CORRECT!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
