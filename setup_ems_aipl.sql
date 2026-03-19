-- ========================================
-- PROFESSIONAL EMS SETUP FOR AIPL
-- Institution: ALL INDIA Private Limited
-- ========================================
-- This script creates:
-- 1. Tutor account
-- 2. Student account
-- 3. Sample Course
-- 4. Sample Batch
-- 5. Proper mappings (NO DUMMY DATA)
-- ========================================

-- ========================================
-- STEP 1: Get Institution (Company) Details
-- ========================================
SELECT 
    id as company_id,
    name as institution_name,
    'Use this company_id below ⬇️' as note
FROM core.companies 
WHERE name ILIKE '%ALL INDIA%'
LIMIT 1;

-- Copy the company_id from above and replace COMPANY_ID_HERE in the script below

-- ========================================
-- STEP 2: Create TUTOR Account
-- Email: tutor@aipl.com
-- Password: Tutor@2026
-- ========================================
WITH new_tutor AS (
    INSERT INTO app_auth.users (
        email,
        password_hash,
        first_name,
        last_name,
        is_active,
        is_locked
    )
    VALUES (
        'tutor@aipl.com',
        crypt('Tutor@2026', gen_salt('bf')),
        'Rajesh',
        'Kumar',
        true,
        false
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        password_hash = crypt('Tutor@2026', gen_salt('bf')),
        is_active = true,
        is_locked = false
    RETURNING id
),
tutor_role AS (
    SELECT id FROM app_auth.roles WHERE name = 'TUTOR' LIMIT 1
),
company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
)
INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
SELECT 
    new_tutor.id,
    tutor_role.id,
    company_info.id,
    NULL  -- Tutors don't need branch assignment
FROM new_tutor, tutor_role, company_info
ON CONFLICT (user_id, role_id, company_id) DO NOTHING
RETURNING user_id, 'Tutor created ✅' as status;

-- ========================================
-- STEP 3: Create SAMPLE COURSE
-- Course: Full Stack Development
-- Created by: Tutor
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
tutor_info AS (
    SELECT id FROM app_auth.users WHERE email = 'tutor@aipl.com' LIMIT 1
)
INSERT INTO ems.courses (
    course_code,
    course_name,
    description,
    academic_level,
    institution_id,
    created_by,
    status,
    duration_weeks,
    created_at
)
SELECT
    'FSD-2026-001',
    'Full Stack Development',
    'Complete web development course covering frontend, backend, and deployment',
    'Intermediate',
    company_info.id,
    tutor_info.id,
    'ACTIVE',
    16,
    NOW()
FROM company_info, tutor_info
ON CONFLICT (course_code, institution_id) DO UPDATE
SET 
    status = 'ACTIVE',
    updated_at = NOW()
RETURNING id, course_code, course_name, 'Course created ✅' as status;

-- ========================================
-- STEP 4: Create BATCH
-- Batch: FSD-2026-Morning
-- Under: Full Stack Development Course
-- ========================================
WITH course_info AS (
    SELECT id, institution_id FROM ems.courses WHERE course_code = 'FSD-2026-001' LIMIT 1
),
tutor_info AS (
    SELECT id FROM app_auth.users WHERE email = 'tutor@aipl.com' LIMIT 1
)
INSERT INTO ems.batches (
    batch_code,
    batch_name,
    course_id,
    institution_id,
    tutor_id,
    start_date,
    end_date,
    max_students,
    status,
    schedule,
    created_at
)
SELECT
    'FSD-2026-M',
    'FSD-2026-Morning',
    course_info.id,
    course_info.institution_id,
    tutor_info.id,
    '2026-02-10',
    '2026-06-10',
    30,
    'ACTIVE',
    'Monday to Friday, 9:00 AM - 12:00 PM',
    NOW()
FROM course_info, tutor_info
ON CONFLICT (batch_code, institution_id) DO UPDATE
SET 
    status = 'ACTIVE',
    updated_at = NOW()
RETURNING id, batch_code, batch_name, 'Batch created ✅' as status;

-- ========================================
-- STEP 5: Create STUDENT Account
-- Email: student@aipl.com
-- Password: Student@2026
-- Assigned to: FSD-2026-Morning Batch
-- ========================================
WITH new_student AS (
    INSERT INTO app_auth.users (
        email,
        password_hash,
        first_name,
        last_name,
        is_active,
        is_locked
    )
    VALUES (
        'student@aipl.com',
        crypt('Student@2026', gen_salt('bf')),
        'Priya',
        'Sharma',
        true,
        false
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        password_hash = crypt('Student@2026', gen_salt('bf')),
        is_active = true,
        is_locked = false
    RETURNING id
),
student_role AS (
    SELECT id FROM app_auth.roles WHERE name = 'STUDENT' LIMIT 1
),
company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
batch_info AS (
    SELECT id, course_id FROM ems.batches WHERE batch_code = 'FSD-2026-M' LIMIT 1
)
INSERT INTO ems.student_enrollments (
    student_id,
    institution_id,
    course_id,
    batch_id,
    enrollment_date,
    status,
    created_at
)
SELECT
    new_student.id,
    company_info.id,
    batch_info.course_id,
    batch_info.id,
    NOW(),
    'ACTIVE',
    NOW()
FROM new_student, company_info, batch_info
ON CONFLICT (student_id, batch_id) DO UPDATE
SET 
    status = 'ACTIVE',
    updated_at = NOW()
RETURNING student_id, 'Student enrolled ✅' as status;

-- Also assign STUDENT role
WITH new_student AS (
    SELECT id FROM app_auth.users WHERE email = 'student@aipl.com' LIMIT 1
),
student_role AS (
    SELECT id FROM app_auth.roles WHERE name = 'STUDENT' LIMIT 1
),
company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
)
INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
SELECT 
    new_student.id,
    student_role.id,
    company_info.id,
    NULL
FROM new_student, student_role, company_info
ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

-- ========================================
-- STEP 6: VERIFICATION - Check Everything
-- ========================================

-- Check Tutor
SELECT 
    u.email,
    u.first_name,
    r.name as role,
    c.name as institution,
    '✅ Tutor Account' as account_type
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.companies c ON ur.company_id = c.id
WHERE u.email = 'tutor@aipl.com';

-- Check Student with Full Mapping
SELECT 
    u.email,
    u.first_name,
    r.name as role,
    c.name as institution,
    co.course_name,
    b.batch_name,
    se.status as enrollment_status,
    '✅ Student Account' as account_type
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.companies c ON ur.company_id = c.id
LEFT JOIN ems.student_enrollments se ON u.id = se.student_id
LEFT JOIN ems.courses co ON se.course_id = co.id
LEFT JOIN ems.batches b ON se.batch_id = b.id
WHERE u.email = 'student@aipl.com';

-- Check Course & Batch
SELECT 
    c.course_code,
    c.course_name,
    c.status as course_status,
    b.batch_code,
    b.batch_name,
    b.status as batch_status,
    b.schedule,
    u.first_name as tutor_name,
    '✅ Academic Structure' as verification
FROM ems.courses c
JOIN ems.batches b ON c.id = b.course_id
JOIN app_auth.users u ON b.tutor_id = u.id
WHERE c.course_code = 'FSD-2026-001';

-- ========================================
-- 📋 LOGIN CREDENTIALS SUMMARY
-- ========================================
-- 
-- 🧑🏫 TUTOR:
-- Email: tutor@aipl.com
-- Password: Tutor@2026
-- Role: Content Creator & Academic Manager
--
-- 👨🎓 STUDENT:
-- Email: student@aipl.com
-- Password: Student@2026
-- Institution: ALL INDIA Private Limited
-- Course: Full Stack Development
-- Batch: FSD-2026-Morning
--
-- ========================================
