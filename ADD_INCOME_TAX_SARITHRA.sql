-- ============================================================================
-- ADD INCOME TAX MODULE FOR SARITHRA
-- ============================================================================

-- Get sarithra's details
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

    RAISE NOTICE 'Adding Income Tax module for Student ID: %, Company ID: %', v_student_id, v_company_id;

    -- Insert INCOME_TAX allocation
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
        'INCOME_TAX',
        1, -- allocated by admin
        5, -- 5 attempts
        0, -- 0 used
        'ACTIVE'
    )
    ON CONFLICT (student_id, course_id, module_type) 
    DO UPDATE SET 
        status = 'ACTIVE',
        usage_limit = 5,
        used_count = 0;

    -- Update quota used count
    UPDATE ems.practice_quotas
    SET used_licenses = used_licenses + 1
    WHERE company_id = v_company_id 
      AND module_type = 'INCOME_TAX';

    RAISE NOTICE 'Successfully allocated INCOME_TAX module to sarithra!';
END $$;

-- Verify all allocations
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
  AND spa.course_id = 17
ORDER BY spa.module_type;

-- Expected: Should show 3 rows (GST, TDS, INCOME_TAX)
