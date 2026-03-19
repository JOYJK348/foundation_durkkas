-- ========================================
-- FIX 401 LOGIN ERROR
-- Email: rkvmcrackers@gmail.com
-- Password: rkvm@123
-- ========================================

-- Step 1: Reset password with bcrypt hash
UPDATE app_auth.users
SET 
    password_hash = crypt('rkvm@123', gen_salt('bf')),
    is_active = true,
    is_locked = false
WHERE email = 'rkvmcrackers@gmail.com';

-- Step 2: Verify the user was updated
SELECT 
    email,
    first_name,
    last_name,
    is_active,
    is_locked,
    'Password reset successfully ✅' as status
FROM app_auth.users
WHERE email = 'rkvmcrackers@gmail.com';
