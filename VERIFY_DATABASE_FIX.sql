-- ============================================================================
-- VERIFY DATABASE FIX - CHECK IF EVERYTHING WAS CREATED
-- ============================================================================

-- ============================================================================
-- 1. CHECK EMPLOYEES CREATED
-- ============================================================================

SELECT 
    'EMPLOYEES CHECK' as check_type,
    COUNT(*) as total_employees,
    COUNT(CASE WHEN email LIKE '%durkkas.com' THEN 1 END) as durkkas_employees
FROM core.employees
WHERE company_id = 13;

-- ============================================================================
-- 2. CHECK SPECIFIC USERS
-- ============================================================================

SELECT 
    'USER CHECK' as check_type,
    u.id as user_id,
    u.email,
    r.role_type,
    e.id as employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    CASE 
        WHEN e.id IS NULL THEN '❌ NO EMPLOYEE'
        ELSE '✅ HAS EMPLOYEE'
    END as status
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.employees e ON u.email = e.email AND e.company_id = 13
WHERE u.email IN (
    'rajesh.kumar@durkkas.com',
    'priya.sharma@durkkas.com',
    'arun.patel@durkkas.com'
)
ORDER BY u.email;

-- ============================================================================
-- 3. CHECK DESIGNATIONS
-- ============================================================================

SELECT 
    'DESIGNATIONS CHECK' as check_type,
    COUNT(*) as total_designations
FROM core.designations
WHERE company_id = 13;

SELECT * FROM core.designations WHERE company_id = 13;

-- ============================================================================
-- 4. CHECK DEPARTMENTS
-- ============================================================================

SELECT 
    'DEPARTMENTS CHECK' as check_type,
    COUNT(*) as total_departments
FROM core.departments
WHERE company_id = 13;

SELECT * FROM core.departments WHERE company_id = 13;

-- ============================================================================
-- 5. CHECK SCHEMA PERMISSIONS
-- ============================================================================

-- Check if current role has access to ems schema
SELECT 
    'SCHEMA PERMISSIONS' as check_type,
    has_schema_privilege('service_role', 'ems', 'USAGE') as service_role_can_use_ems,
    has_schema_privilege('authenticated', 'ems', 'USAGE') as authenticated_can_use_ems;

-- ============================================================================
-- 6. TEST QUERY THAT BACKEND USES
-- ============================================================================

-- This is the exact query the backend runs
-- Replace 428 with actual user_id
SELECT 
    'BACKEND QUERY TEST' as check_type,
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email
FROM core.employees e
WHERE e.email = 'priya.sharma@durkkas.com'
AND e.company_id = 13;

-- ============================================================================
-- 7. CHECK IF USER_ID COLUMN EXISTS
-- ============================================================================

SELECT 
    'COLUMN CHECK' as check_type,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'core'
AND table_name = 'employees'
AND column_name IN ('user_id', 'email', 'company_id');

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
    '✅ VERIFICATION COMPLETE' as status,
    'Check results above' as message;
