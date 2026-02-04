-- ============================================================================
-- SIMPLE PASSWORD RESET - ALL USERS
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Reset ALL @durkkas.com emails to Manager@123
UPDATE app_auth.users 
SET password_hash = crypt('Manager@123', gen_salt('bf'))
WHERE email LIKE '%@durkkas.com' AND email NOT LIKE '%student%';

-- Reset ALL student emails to Student@123
UPDATE app_auth.users 
SET password_hash = crypt('Student@123', gen_salt('bf'))
WHERE email LIKE '%student.durkkas.com';

-- Verify
SELECT 
    email,
    'Manager@123 or Student@123' as password,
    is_active
FROM app_auth.users
WHERE email LIKE '%durkkas.com'
ORDER BY email;

-- ============================================================================
-- DONE! Now login with:
-- ============================================================================
-- Managers/Tutors: (their email) / Manager@123
-- Students: (their email) / Student@123
-- ============================================================================
