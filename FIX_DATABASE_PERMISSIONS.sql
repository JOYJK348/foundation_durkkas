-- ============================================================================
-- FIX DATABASE PERMISSIONS & EMPLOYEE RECORDS
-- ============================================================================

-- ============================================================================
-- 1. GRANT PERMISSIONS TO EMS SCHEMA
-- ============================================================================

-- Grant usage on ems schema to service role
GRANT USAGE ON SCHEMA ems TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA ems TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ems TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA ems TO service_role;

-- Grant usage on ems schema to authenticated users
GRANT USAGE ON SCHEMA ems TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA ems TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ems TO authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA ems GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ems GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ems GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA ems GRANT ALL ON SEQUENCES TO authenticated;

-- ============================================================================
-- 2. CHECK EXISTING USERS AND EMPLOYEES
-- ============================================================================

-- See which users exist
SELECT 
    u.id as user_id,
    u.email,
    r.role_type,
    e.id as employee_id,
    e.first_name,
    e.last_name
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.employees e ON u.email = e.email
WHERE u.email LIKE '%durkkas.com'
ORDER BY r.role_type, u.email;

-- ============================================================================
-- 3. CREATE EMPLOYEE RECORDS FOR TUTORS/MANAGERS
-- ============================================================================

-- Create employee records for users who don't have them
INSERT INTO core.employees (
    company_id,
    branch_id,
    email,
    first_name,
    last_name,
    employee_code,
    designation,
    department,
    date_of_joining,
    employment_status,
    is_active,
    created_at
)
SELECT 
    13 as company_id,  -- Durkkas Academy
    46 as branch_id,   -- Main branch
    u.email,
    SPLIT_PART(SPLIT_PART(u.email, '@', 1), '.', 1) as first_name,
    SPLIT_PART(SPLIT_PART(u.email, '@', 1), '.', 2) as last_name,
    'EMP' || LPAD(u.id::text, 5, '0') as employee_code,
    CASE 
        WHEN r.role_type = 'ACADEMIC_MANAGER' THEN 'Academic Manager'
        WHEN r.role_type = 'TUTOR' THEN 'Tutor'
        ELSE 'Staff'
    END as designation,
    'Education' as department,
    NOW() as date_of_joining,
    'ACTIVE' as employment_status,
    true as is_active,
    NOW() as created_at
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.employees e ON u.email = e.email
WHERE u.email LIKE '%@durkkas.com'
AND u.email NOT LIKE '%student%'
AND e.id IS NULL
ON CONFLICT (email, company_id) DO NOTHING;

-- ============================================================================
-- 4. LINK USER_ID TO EMPLOYEES
-- ============================================================================

-- Update employees with user_id
UPDATE core.employees e
SET user_id = u.id
FROM app_auth.users u
WHERE e.email = u.email
AND e.user_id IS NULL;

-- ============================================================================
-- 5. VERIFY SETUP
-- ============================================================================

-- Check employees created
SELECT 
    e.id as employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.designation,
    u.id as user_id,
    r.role_type
FROM core.employees e
JOIN app_auth.users u ON e.email = u.email
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
WHERE e.company_id = 13
ORDER BY r.role_type, e.email;

-- ============================================================================
-- DONE! Now backend should work
-- ============================================================================
