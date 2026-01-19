-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIX USERS SOFT DELETE - IMMEDIATE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- STEP 1: Check the current state of users
SELECT 
    id,
    email,
    is_active,
    deleted_at,
    deleted_by,
    delete_reason
FROM app_auth.users
ORDER BY id DESC
LIMIT 10;

-- STEP 2: Show users that are inactive but have NULL delete_reason
SELECT 
    id,
    email,
    is_active,
    deleted_at,
    deleted_by,
    delete_reason
FROM app_auth.users
WHERE is_active = false;

-- STEP 3: Fix all inactive users that don't have delete_reason
UPDATE app_auth.users
SET 
    delete_reason = COALESCE(delete_reason, 'Legacy deletion - reason not captured'),
    deleted_at = COALESCE(deleted_at, updated_at, NOW()),
    deleted_by = COALESCE(deleted_by, 1)
WHERE is_active = false 
  AND delete_reason IS NULL;

-- STEP 4: Verify the fix
SELECT 
    id,
    email,
    is_active,
    deleted_at,
    deleted_by,
    delete_reason
FROM app_auth.users
WHERE is_active = false;

-- STEP 5: Create and delete a test user
DO $$
DECLARE
    test_user_id BIGINT;
    admin_id BIGINT;
BEGIN
    -- Get an admin user
    SELECT id INTO admin_id FROM app_auth.users WHERE is_active = true LIMIT 1;
    
    -- Create a test user
    INSERT INTO app_auth.users (
        email, 
        password_hash,
        first_name,
        last_name,
        display_name,
        is_active
    ) VALUES (
        'test.user.delete.now@example.com',
        'test_hash_xyz',
        'Test',
        'UserDelete',
        'Test Delete Now',
        true
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO test_user_id;
    
    IF test_user_id IS NOT NULL THEN
        -- Now delete it
        UPDATE app_auth.users
        SET 
            is_active = false,
            deleted_at = NOW(),
            deleted_by = admin_id,
            delete_reason = 'NEW TEST - From SQL direct update - Should work!'
        WHERE id = test_user_id;
        
        RAISE NOTICE '✅ New test user created and deleted!';
        RAISE NOTICE 'Test User ID: %', test_user_id;
    ELSE
        -- User already exists, update it
        UPDATE app_auth.users
        SET 
            is_active = false,
            deleted_at = NOW(),
            deleted_by = admin_id,
            delete_reason = 'NEW TEST - From SQL direct update - Should work!'
        WHERE email = 'test.user.delete.now@example.com';
        
        RAISE NOTICE '✅ Existing test user updated!';
    END IF;
END $$;

-- STEP 6: Verify the new test user
SELECT 
    id,
    email,
    is_active,
    deleted_at,
    deleted_by,
    delete_reason,
    CASE 
        WHEN delete_reason IS NOT NULL THEN '✅ WORKING'
        ELSE '❌ STILL NULL'
    END as status
FROM app_auth.users
WHERE email = 'test.user.delete.now@example.com';

-- STEP 7: Show ALL users with their soft delete status
SELECT 
    id,
    email,
    first_name || ' ' || last_name as name,
    is_active,
    CASE WHEN deleted_at IS NOT NULL THEN deleted_at::text ELSE 'NOT DELETED' END as deleted_at,
    CASE WHEN deleted_by IS NOT NULL THEN deleted_by::text ELSE 'N/A' END as deleted_by,
    CASE WHEN delete_reason IS NOT NULL THEN delete_reason ELSE 'NO REASON' END as delete_reason
FROM app_auth.users
ORDER BY is_active ASC, id DESC;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ USERS SOFT DELETE FIX COMPLETE!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Check the final SELECT to see all users with their status';
    RAISE NOTICE 'The test user should show "NEW TEST - From SQL direct update"';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🔧 Now try deleting a user from the FRONTEND';
    RAISE NOTICE '   Watch the backend terminal for the 🗑️ logs';
    RAISE NOTICE '   The reason should be saved!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
