-- PRACTICAL SIMULATION LAB - ENABLE GST FINANCE LAB (GST_LAB)
-- Target: Course ID 17

-- 1. UPDATE CONSTRAINTS TO ALLOW 'GST_LAB'
DO $$ 
BEGIN
    -- Update ems.practice_quotas constraint
    ALTER TABLE ems.practice_quotas DROP CONSTRAINT IF EXISTS practice_quotas_module_type_check;
    ALTER TABLE ems.practice_quotas ADD CONSTRAINT practice_quotas_module_type_check 
        CHECK (module_type IN ('GST', 'GST_LAB', 'TDS', 'INCOME_TAX'));

    -- Update ems.student_practice_allocations constraint
    ALTER TABLE ems.student_practice_allocations DROP CONSTRAINT IF EXISTS student_practice_allocations_module_type_check;
    ALTER TABLE ems.student_practice_allocations ADD CONSTRAINT student_practice_allocations_module_type_check 
        CHECK (module_type IN ('GST', 'GST_LAB', 'TDS', 'INCOME_TAX'));
END $$;

-- 2. ENABLE 'GST_LAB' ON COURSE 17
-- Using JSONB concatenation to add it to existing modules if it's not already there
UPDATE ems.courses 
SET enabled_practice_modules = 
    CASE 
        WHEN enabled_practice_modules @> '["GST_LAB"]'::jsonb THEN enabled_practice_modules
        ELSE enabled_practice_modules || '["GST_LAB"]'::jsonb
    END
WHERE id = 17;

-- 3. ENSURE QUOTA EXISTS FOR THE COMPANY
-- This gives 100 licenses to the company belonging to Course 17
INSERT INTO ems.practice_quotas (company_id, module_type, total_licenses, used_licenses)
SELECT company_id, 'GST_LAB', 100, 0
FROM ems.courses 
WHERE id = 17
ON CONFLICT (company_id, module_type) DO UPDATE 
SET total_licenses = GREATEST(ems.practice_quotas.total_licenses, 100);

-- 4. ALLOCATE GST_LAB TO ALL ACTIVE STUDENTS IN COURSE 17
-- This automatically enables the "Start Practice" button for all students in this course
INSERT INTO ems.student_practice_allocations (company_id, student_id, course_id, module_type, usage_limit, used_count, allocated_at, status)
SELECT c.company_id, e.student_id, c.id, 'GST_LAB', 10, 0, NOW(), 'ACTIVE'
FROM ems.courses c
JOIN ems.student_enrollments e ON c.id = e.course_id
WHERE c.id = 17 AND e.deleted_at IS NULL
ON CONFLICT (student_id, module_type, course_id) DO NOTHING;

-- 5. VERIFY
SELECT 'GST_LAB' as module, count(*) as allocated_students 
FROM ems.student_practice_allocations 
WHERE course_id = 17 AND module_type = 'GST_LAB';
