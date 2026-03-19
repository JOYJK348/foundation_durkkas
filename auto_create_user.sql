-- ========================================
-- AUTOMATED USER CREATION - NO MANUAL EDITS NEEDED
-- Just run this entire script!
-- ========================================

-- Step 1: Create/Update user
INSERT INTO app_auth.users (
    email,
    password_hash,
    first_name,
    last_name,
    is_active,
    is_locked
)
VALUES (
    'rkvmcrackers@gmail.com',
    crypt('Welcome@2026', gen_salt('bf')),
    'RKVM',
    'Admin',
    true,
    false
)
ON CONFLICT (email) DO UPDATE
SET 
    password_hash = crypt('Welcome@2026', gen_salt('bf')),
    is_active = true,
    is_locked = false;

-- Step 2: Automatically assign role to latest company and branch
WITH user_info AS (
    SELECT id FROM app_auth.users WHERE email = 'rkvmcrackers@gmail.com'
),
company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
branch_info AS (
    SELECT id FROM core.branches ORDER BY created_at DESC LIMIT 1
),
role_info AS (
    SELECT id FROM app_auth.roles WHERE name = 'EMS_ADMIN' LIMIT 1
)
INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
SELECT 
    user_info.id,
    role_info.id,
    company_info.id,
    branch_info.id
FROM user_info, company_info, branch_info, role_info
ON CONFLICT (user_id, role_id, company_id, branch_id) DO NOTHING;

-- Step 3: Verify everything worked
SELECT 
    u.email,
    u.is_active,
    u.is_locked,
    r.name as role,
    c.name as company,
    b.name as branch,
    '✅ Ready to login with: Welcome@2026' as status
FROM app_auth.users u
LEFT JOIN app_auth.user_roles ur ON u.id = ur.user_id
LEFT JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.companies c ON ur.company_id = c.id
LEFT JOIN core.branches b ON ur.branch_id = b.id
WHERE u.email = 'rkvmcrackers@gmail.com';

-- ========================================
-- LOGIN CREDENTIALS:
-- Email: rkvmcrackers@gmail.com
-- Password: Welcome@2026
-- ========================================
