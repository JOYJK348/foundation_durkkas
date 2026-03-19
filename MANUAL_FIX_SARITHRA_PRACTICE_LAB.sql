-- ============================================================================
-- MANUAL FIX: Enable Finance Practice Lab for sarithra@gmail.com
-- ============================================================================
-- This script will:
-- 1. Find sarithra's student_id and course enrollment
-- 2. Enable practice modules on Course 17
-- 3. Create practice quota if not exists
-- 4. Allocate practice module to sarithra
-- ============================================================================

-- STEP 1: Check Current Status
-- ============================================================================
SELECT 'STEP 1: Checking sarithra student details...' AS status;

SELECT 
    id as student_id,
    student_code,
    first_name,
    last_name,
    email
FROM ems.students 
WHERE email = 'sarithra@gmail.com';

-- Expected: Should return student_id (let's say it's 123)


-- STEP 2: Check Course 17 Enrollment
-- ============================================================================
SELECT 'STEP 2: Checking if sarithra is enrolled in Course 17...' AS status;

SELECT 
    e.id as enrollment_id,
    e.student_id,
    e.course_id,
    c.course_name,
    c.enabled_practice_modules
FROM ems.student_enrollments e
JOIN ems.courses c ON c.id = e.course_id
WHERE e.student_id = (SELECT id FROM ems.students WHERE email = 'sarithra@gmail.com')
  AND e.course_id = 17
  AND e.deleted_at IS NULL;

-- Expected: Should show enrollment details


-- STEP 3: Enable Practice Modules on Course 17
-- ============================================================================
SELECT 'STEP 3: Enabling GST and TDS modules on Course 17...' AS status;

UPDATE ems.courses
SET enabled_practice_modules = '["GST", "TDS"]'::jsonb
WHERE id = 17;

-- Verify the update
SELECT id, course_name, enabled_practice_modules 
FROM ems.courses 
WHERE id = 17;


-- STEP 4: Ensure Practice Quota Exists
-- ============================================================================
SELECT 'STEP 4: Checking/Creating practice quotas...' AS status;

-- Get the correct company_id from sarithra's record
DO $$
DECLARE
    v_company_id INT;
BEGIN
    -- Get company_id from sarithra's student record
    SELECT company_id INTO v_company_id
    FROM ems.students
    WHERE email = 'sarithra@gmail.com';

    -- Check if quota exists
    RAISE NOTICE 'Using company_id: %', v_company_id;

    -- Create quotas if they don't exist
    INSERT INTO ems.practice_quotas (company_id, module_type, total_licenses, used_licenses)
    VALUES 
        (v_company_id, 'GST', 100, 0),
        (v_company_id, 'TDS', 100, 0),
        (v_company_id, 'INCOME_TAX', 100, 0)
    ON CONFLICT (company_id, module_type) 
    DO UPDATE SET 
        total_licenses = EXCLUDED.total_licenses;

    RAISE NOTICE 'Practice quotas created/updated successfully!';
END $$;

-- Verify
SELECT * 
FROM ems.practice_quotas
WHERE company_id = (SELECT company_id FROM ems.students WHERE email = 'sarithra@gmail.com');


-- STEP 5: Allocate Practice Module to Sarithra
-- ============================================================================
SELECT 'STEP 5: Allocating GST and TDS modules to sarithra...' AS status;

-- Allocate practice modules
DO $$
DECLARE
    v_student_id INT;
    v_company_id INT;
    v_course_id INT := 17;
BEGIN
    -- Get student ID and company ID
    SELECT id, company_id INTO v_student_id, v_company_id
    FROM ems.students 
    WHERE email = 'sarithra@gmail.com';

    RAISE NOTICE 'Student ID: %, Company ID: %', v_student_id, v_company_id;

    -- Delete any existing allocation (to avoid duplicates)
    DELETE FROM ems.student_practice_allocations
    WHERE student_id = v_student_id 
      AND course_id = v_course_id;

    -- Insert GST allocation
    INSERT INTO ems.student_practice_allocations (
        company_id,
        student_id,
        course_id,
        module_type,
        allocated_by,
        usage_limit,
        used_count,
        status
    ) VALUES (
        v_company_id,
        v_student_id,
        v_course_id,
        'GST',
        1, -- allocated by admin
        5, -- 5 attempts
        0, -- 0 used
        'ACTIVE'
    );

    -- Insert TDS allocation
    INSERT INTO ems.student_practice_allocations (
        company_id,
        student_id,
        course_id,
        module_type,
        allocated_by,
        usage_limit,
        used_count,
        status
    ) VALUES (
        v_company_id,
        v_student_id,
        v_course_id,
        'TDS',
        1, -- allocated by admin
        5, -- 5 attempts
        0, -- 0 used
        'ACTIVE'
    );

    -- Update quota used count
    UPDATE ems.practice_quotas
    SET used_licenses = used_licenses + 2
    WHERE company_id = v_company_id 
      AND module_type IN ('GST', 'TDS');

    RAISE NOTICE 'Successfully allocated GST and TDS modules to sarithra!';
END $$;


-- STEP 6: Verify Final Status
-- ============================================================================
SELECT 'STEP 6: Verifying allocation...' AS status;

SELECT 
    spa.id,
    spa.module_type,
    spa.usage_limit,
    spa.used_count,
    spa.status,
    s.first_name,
    s.email,
    c.course_name
FROM ems.student_practice_allocations spa
JOIN ems.students s ON s.id = spa.student_id
JOIN ems.courses c ON c.id = spa.course_id
WHERE s.email = 'sarithra@gmail.com'
  AND spa.course_id = 17;

-- Expected: Should show 2 rows (GST and TDS allocations)


-- ============================================================================
-- FINAL CHECK: What the API should return
-- ============================================================================
SELECT 'FINAL: What sarithra should see in her dashboard...' AS status;

SELECT 
    spa.*,
    c.course_name,
    c.enabled_practice_modules
FROM ems.student_practice_allocations spa
JOIN ems.courses c ON c.id = spa.course_id
WHERE spa.student_id = (SELECT id FROM ems.students WHERE email = 'sarithra@gmail.com')
  AND spa.course_id = 17;


-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT '✅ DONE! Now ask sarithra to:' AS message
UNION ALL
SELECT '1. Refresh the page: http://localhost:3001/ems/student/courses/17'
UNION ALL
SELECT '2. She should see the "Launch Finance Lab" button'
UNION ALL
SELECT '3. Click it to access GST and TDS practice modules';
