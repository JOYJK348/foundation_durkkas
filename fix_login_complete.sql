-- ========================================
-- COMPLETE FIX FOR LOGIN ISSUE
-- ========================================

-- STEP 1: Check if user exists
SELECT 
    id,
    email,
    first_name,
    last_name,
    is_active,
    is_locked,
    created_at,
    password_hash IS NOT NULL as has_password
FROM app_auth.users
WHERE email = 'rkvmcrackers@gmail.com';

-- If user exists, continue with STEP 2
-- If user doesn't exist, you need to create the user first

-- STEP 2: Delete old password and set new one
UPDATE app_auth.users
SET 
    password_hash = crypt('Welcome@2026', gen_salt('bf')),
    is_active = true,
    is_locked = false,
    updated_at = NOW()
WHERE email = 'rkvmcrackers@gmail.com';

-- STEP 3: Check user roles
SELECT 
    u.email,
    r.name as role_name,
    r.level as role_level,
    ur.company_id,
    ur.branch_id
FROM app_auth.users u
LEFT JOIN app_auth.user_roles ur ON u.id = ur.user_id
LEFT JOIN app_auth.roles r ON ur.role_id = r.id
WHERE u.email = 'rkvmcrackers@gmail.com';

-- STEP 4: If no roles found, check available roles
SELECT id, name, display_name, level
FROM app_auth.roles
WHERE name LIKE '%ADMIN%'
ORDER BY level DESC;

-- STEP 5: Verify final status
SELECT 
    email,
    first_name,
    is_active,
    is_locked,
    password_hash IS NOT NULL as has_password,
    LENGTH(password_hash) as hash_length,
    'Ready to login with: Welcome@2026' as new_password
FROM app_auth.users
WHERE email = 'rkvmcrackers@gmail.com';
