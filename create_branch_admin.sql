-- ========================================
-- CREATE NEW BRANCH ADMIN USER
-- Email: rkvmcrackers@gmail.com
-- Password: Welcome@2026
-- ========================================

-- STEP 1: Check if user already exists
SELECT 
    id,
    email,
    'User already exists!' as status
FROM app_auth.users
WHERE email = 'rkvmcrackers@gmail.com';

-- If user exists, skip to STEP 4
-- If no results, continue with STEP 2

-- ========================================
-- STEP 2: Create new user
-- ========================================
INSERT INTO app_auth.users (
    email,
    password_hash,
    first_name,
    last_name,
    is_active,
    is_locked,
    created_at,
    updated_at
)
VALUES (
    'rkvmcrackers@gmail.com',
    crypt('Welcome@2026', gen_salt('bf')),
    'RKVM',
    'Crackers',
    true,
    false,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
    password_hash = crypt('Welcome@2026', gen_salt('bf')),
    is_active = true,
    is_locked = false,
    updated_at = NOW()
RETURNING id, email, first_name, 'User created/updated ✅' as status;

-- ========================================
-- STEP 3: Get the user ID for role assignment
-- ========================================
SELECT 
    id,
    email,
    first_name,
    last_name,
    is_active
FROM app_auth.users
WHERE email = 'rkvmcrackers@gmail.com';

-- Copy the 'id' from above result and use it in STEP 4

-- ========================================
-- STEP 4: Assign EMS_ADMIN role
-- Replace these values:
-- - USER_ID: from STEP 3
-- - COMPANY_ID: your company ID (e.g., for 'ALL INDIA private limited')
-- - BRANCH_ID: your branch ID
-- ========================================

-- First, find your company ID
SELECT id, name FROM core.companies WHERE name ILIKE '%ALL INDIA%';

-- Then find your branch ID
SELECT id, name, code FROM core.branches ORDER BY created_at DESC LIMIT 5;

-- Find EMS_ADMIN role ID
SELECT id, name, display_name FROM app_auth.roles WHERE name = 'EMS_ADMIN';

-- Now assign the role (REPLACE THE IDs)
INSERT INTO app_auth.user_roles (
    user_id,
    role_id,
    company_id,
    branch_id,
    created_at
)
VALUES (
    'USER_ID_HERE',  -- Replace with user ID from STEP 3
    (SELECT id FROM app_auth.roles WHERE name = 'EMS_ADMIN' LIMIT 1),
    COMPANY_ID_HERE,  -- Replace with your company ID
    BRANCH_ID_HERE,   -- Replace with your branch ID
    NOW()
)
ON CONFLICT (user_id, role_id, company_id, branch_id) DO NOTHING
RETURNING *;

-- ========================================
-- STEP 5: Verify everything is set up
-- ========================================
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.is_active,
    u.is_locked,
    r.name as role,
    c.name as company,
    b.name as branch,
    'Ready to login! ✅' as status
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
