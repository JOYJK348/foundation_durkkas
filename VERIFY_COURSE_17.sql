-- Quick verification: Check if the tables exist and what students would be affected
-- Run this first to verify before running the main script

-- 1. Check if Course 17 exists
SELECT id, course_name, company_id, enabled_practice_modules 
FROM ems.courses 
WHERE id = 17;

-- 2. Check batches for Course 17
SELECT b.id, b.batch_name, b.course_id, b.is_active
FROM ems.batches b
WHERE b.course_id = 17;

-- 3. Check students in Course 17
SELECT COUNT(DISTINCT e.student_id) as total_students
FROM ems.courses c
JOIN ems.student_enrollments e ON c.id = e.course_id
WHERE c.id = 17 AND e.deleted_at IS NULL;

-- 4. Check existing practice quotas
SELECT * FROM ems.practice_quotas WHERE module_type IN ('GST', 'GST_LAB', 'TDS', 'INCOME_TAX');

-- 5. Check existing allocations for Course 17
SELECT module_type, COUNT(*) as allocated_count
FROM ems.student_practice_allocations
WHERE course_id = 17
GROUP BY module_type;
