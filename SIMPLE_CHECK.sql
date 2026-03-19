-- ============================================================================
-- SIMPLE CHECK - JUST SHOW THE DATA
-- ============================================================================

-- 1. Show all employees for company 13
SELECT * FROM core.employees WHERE company_id = 13;

-- 2. Show user-employee mapping
SELECT 
    u.id as user_id,
    u.email,
    e.id as employee_id,
    e.employee_code,
    e.first_name
FROM app_auth.users u
LEFT JOIN core.employees e ON u.email = e.email AND e.company_id = 13
WHERE u.email LIKE '%durkkas.com'
AND u.email NOT LIKE '%student%';

-- 3. Check if user_id column exists
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'core'
AND table_name = 'employees';
