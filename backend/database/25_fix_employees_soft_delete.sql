-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIX EMPLOYEES SOFT DELETE COLUMNS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- STEP 1: First check if columns exist in employees table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'core' 
AND table_name = 'employees' 
AND column_name IN ('deleted_at', 'deleted_by', 'delete_reason')
ORDER BY column_name;

-- STEP 2: Add soft delete columns to employees if they don't exist
ALTER TABLE core.employees
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- STEP 3: Create test employee and delete it
DO $$
DECLARE
    test_emp_id BIGINT;
    admin_user_id BIGINT;
    test_company_id BIGINT;
    test_dept_id BIGINT;
    test_desig_id BIGINT;
BEGIN
    -- Get a company, department, and designation for the test
    SELECT id INTO test_company_id FROM core.companies WHERE is_active = true LIMIT 1;
    SELECT id INTO test_dept_id FROM core.departments WHERE is_active = true LIMIT 1;
    SELECT id INTO test_desig_id FROM core.designations WHERE is_active = true LIMIT 1;
    SELECT id INTO admin_user_id FROM app_auth.users WHERE is_active = true LIMIT 1;
    
    IF test_company_id IS NOT NULL AND test_dept_id IS NOT NULL AND test_desig_id IS NOT NULL THEN
        -- Create test employee
        INSERT INTO core.employees (
            first_name, last_name, email, employee_code,
            company_id, department_id, designation_id,
            employment_type, is_active
        ) VALUES (
            'Test', 'Employee', 'test.employee.delete@example.com', 'TEST-DEL-001',
            test_company_id, test_dept_id, test_desig_id,
            'FULL_TIME', true
        ) ON CONFLICT DO NOTHING
        RETURNING id INTO test_emp_id;
        
        -- If insert succeeded, do soft delete
        IF test_emp_id IS NOT NULL THEN
            UPDATE core.employees
            SET 
                is_active = false,
                deleted_at = NOW(),
                deleted_by = admin_user_id,
                delete_reason = 'Testing employee soft delete - IMMEDIATE FIX'
            WHERE id = test_emp_id;
            
            RAISE NOTICE '✅ Test employee created and deleted!';
            RAISE NOTICE 'Employee ID: %', test_emp_id;
            RAISE NOTICE 'Deleted By: %', admin_user_id;
        ELSE
            -- Employee already exists, just update it
            UPDATE core.employees
            SET 
                is_active = false,
                deleted_at = NOW(),
                deleted_by = admin_user_id,
                delete_reason = 'Testing employee soft delete - IMMEDIATE FIX'
            WHERE email = 'test.employee.delete@example.com';
            
            RAISE NOTICE '✅ Existing test employee updated!';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Missing required reference data. Creating columns only.';
    END IF;
END $$;

-- STEP 4: Verify the test worked
SELECT 
    id,
    first_name,
    last_name,
    email,
    is_active,
    deleted_at,
    deleted_by,
    delete_reason,
    CASE 
        WHEN delete_reason IS NOT NULL THEN '✅ WORKING'
        ELSE '❌ NOT WORKING'
    END as soft_delete_status
FROM core.employees
WHERE email = 'test.employee.delete@example.com'
   OR (deleted_at IS NOT NULL AND delete_reason IS NOT NULL);

-- STEP 5: Show all deleted employees
SELECT 
    id,
    first_name || ' ' || last_name as name,
    email,
    deleted_at,
    deleted_by,
    delete_reason
FROM core.employees
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- STEP 6: Summary
DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ EMPLOYEES SOFT DELETE FIX COMPLETE!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📋 Check the SELECT queries above to verify:';
    RAISE NOTICE '   1. Test employee should show soft delete data';
    RAISE NOTICE '   2. Your 3 deleted employees should have delete_reason now';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🔧 If your 3 employees still show NULL delete_reason:';
    RAISE NOTICE '   - They were deleted BEFORE the columns were added';
    RAISE NOTICE '   - Run the update below to fix them manually';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- STEP 7: OPTIONAL - Fix old deleted employees manually (UNCOMMENT TO RUN)
-- UPDATE core.employees
-- SET delete_reason = 'Legacy deletion - reason not captured'
-- WHERE is_active = false 
--   AND deleted_at IS NULL 
--   AND delete_reason IS NULL;

-- UPDATE core.employees
-- SET deleted_at = updated_at
-- WHERE is_active = false 
--   AND deleted_at IS NULL;
