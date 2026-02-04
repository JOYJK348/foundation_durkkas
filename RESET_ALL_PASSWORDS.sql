-- ============================================================================
-- RESET ALL PASSWORDS - BCRYPT
-- Description: Reset passwords for all test users
-- ============================================================================

-- ============================================================================
-- 1. RESET MANAGER PASSWORDS
-- ============================================================================

UPDATE app_auth.users 
SET password_hash = crypt('Manager@123', gen_salt('bf'))
WHERE email IN (
    SELECT u.email FROM app_auth.users u
    JOIN app_auth.user_roles ur ON u.id = ur.user_id
    JOIN app_auth.roles r ON ur.role_id = r.id
    WHERE r.role_type = 'ACADEMIC_MANAGER'
);

-- ============================================================================
-- 2. RESET TUTOR PASSWORDS
-- ============================================================================

UPDATE app_auth.users 
SET password_hash = crypt('Tutor@123', gen_salt('bf'))
WHERE email IN (
    SELECT u.email FROM app_auth.users u
    JOIN app_auth.user_roles ur ON u.id = ur.user_id
    JOIN app_auth.roles r ON ur.role_id = r.id
    WHERE r.role_type = 'TUTOR'
);

-- ============================================================================
-- 3. RESET STUDENT PASSWORDS
-- ============================================================================

UPDATE app_auth.users 
SET password_hash = crypt('Student@123', gen_salt('bf'))
WHERE email IN (
    SELECT u.email FROM app_auth.users u
    JOIN app_auth.user_roles ur ON u.id = ur.user_id
    JOIN app_auth.roles r ON ur.role_id = r.id
    WHERE r.role_type = 'STUDENT'
);

-- ============================================================================
-- 4. RESET SPECIFIC USERS (IF ABOVE DOESN'T WORK)
-- ============================================================================

-- Manager
UPDATE app_auth.users 
SET password_hash = crypt('Manager@123', gen_salt('bf'))
WHERE email LIKE '%@durkkas.com' 
AND email NOT LIKE '%student%';

-- Students
UPDATE app_auth.users 
SET password_hash = crypt('Student@123', gen_salt('bf'))
WHERE email LIKE '%student.durkkas.com';

-- ============================================================================
-- 5. VERIFY UPDATES
-- ============================================================================

SELECT 
    u.email,
    r.role_type,
    CASE 
        WHEN u.password_hash IS NOT NULL THEN 'Password Set'
        ELSE 'No Password'
    END as password_status,
    u.is_active
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
WHERE u.email LIKE '%durkkas.com'
ORDER BY r.role_type, u.email;

-- ============================================================================
-- 6. TEST LOGIN QUERY (Optional - to verify password)
-- ============================================================================

-- Test Manager password
SELECT 
    email,
    password_hash = crypt('Manager@123', password_hash) as password_matches
FROM app_auth.users
WHERE email = 'rajesh.kumar@durkkas.com';

-- Test Tutor password
SELECT 
    email,
    password_hash = crypt('Tutor@123', password_hash) as password_matches
FROM app_auth.users
WHERE email = 'priya.sharma@durkkas.com';

-- Test Student password
SELECT 
    email,
    password_hash = crypt('Student@123', password_hash) as password_matches
FROM app_auth.users
WHERE email = 'vikram.reddy@student.durkkas.com';

-- ============================================================================
-- DONE! Passwords reset successfully
-- ============================================================================

-- Now you can login with:
-- Manager: rajesh.kumar@durkkas.com / Manager@123
-- Tutor: priya.sharma@durkkas.com / Tutor@123
-- Student: vikram.reddy@student.durkkas.com / Student@123
