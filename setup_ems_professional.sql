-- ========================================
-- PROFESSIONAL EMS SETUP FOR AIPL
-- Institution: ALL INDIA Private Limited
-- Following STRICT institutional hierarchy
-- ========================================

-- ========================================
-- STEP 1: Create TUTOR User Account
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
new_tutor_user AS (
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
)
INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
SELECT 
    new_tutor_user.id,
    tutor_role.id,
    company_info.id,
    NULL
FROM new_tutor_user, tutor_role, company_info
ON CONFLICT (user_id, role_id, company_id) DO NOTHING
RETURNING user_id, 'Tutor user created ✅' as status;

-- ========================================
-- STEP 2: Create COURSE (by Tutor)
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
tutor_info AS (
    SELECT id FROM app_auth.users WHERE email = 'tutor@aipl.com' LIMIT 1
)
INSERT INTO ems.courses (
    company_id,
    branch_id,
    tutor_id,
    course_code,
    course_name,
    course_description,
    course_category,
    course_level,
    course_type,
    duration_hours,
    enrollment_capacity,
    price,
    is_published,
    status,
    is_active,
    created_by
)
SELECT
    company_info.id,
    NULL,
    NULL,  -- tutor_id references employees, not users
    'FSD-2026-001',
    'Full Stack Development',
    'Complete web development course covering React, Node.js, MongoDB, and deployment',
    'Technology',
    'Intermediate',
    'Professional',
    160,
    30,
    25000.00,
    true,
    'ACTIVE',
    true,
    tutor_info.id
FROM company_info, tutor_info
ON CONFLICT (company_id, course_code) DO UPDATE
SET 
    status = 'ACTIVE',
    is_published = true,
    updated_at = NOW()
RETURNING id, course_code, course_name, 'Course created ✅' as status;

-- ========================================
-- STEP 3: Create BATCH
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
course_info AS (
    SELECT id FROM ems.courses WHERE course_code = 'FSD-2026-001' LIMIT 1
)
INSERT INTO ems.batches (
    company_id,
    branch_id,
    course_id,
    batch_code,
    batch_name,
    batch_type,
    start_date,
    end_date,
    start_time,
    end_time,
    max_students,
    current_strength,
    status,
    is_active
)
SELECT
    company_info.id,
    NULL,
    course_info.id,
    'FSD-2026-M',
    'FSD-2026-Morning',
    'Regular',
    '2026-02-10',
    '2026-06-10',
    '09:00:00',
    '12:00:00',
    30,
    0,
    'ACTIVE',
    true
FROM company_info, course_info
ON CONFLICT (company_id, batch_code) DO UPDATE
SET 
    status = 'ACTIVE',
    updated_at = NOW()
RETURNING id, batch_code, batch_name, 'Batch created ✅' as status;

-- ========================================
-- STEP 4: Create STUDENT User Account
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
new_student_user AS (
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
)
INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
SELECT 
    new_student_user.id,
    student_role.id,
    company_info.id,
    NULL
FROM new_student_user, student_role, company_info
ON CONFLICT (user_id, role_id, company_id) DO NOTHING
RETURNING user_id, 'Student user created ✅' as status;

-- ========================================
-- STEP 5: Create STUDENT Record in EMS
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
student_user AS (
    SELECT id FROM app_auth.users WHERE email = 'student@aipl.com' LIMIT 1
)
INSERT INTO ems.students (
    company_id,
    branch_id,
    user_id,
    student_code,
    first_name,
    last_name,
    email,
    phone,
    status,
    is_active,
    created_by
)
SELECT
    company_info.id,
    NULL,
    student_user.id,
    'STD-2026-001',
    'Priya',
    'Sharma',
    'student@aipl.com',
    '+91 9876543210',
    'ACTIVE',
    true,
    student_user.id
FROM company_info, student_user
ON CONFLICT (company_id, student_code) DO UPDATE
SET 
    status = 'ACTIVE',
    is_active = true,
    updated_at = NOW()
RETURNING id, student_code, first_name, 'Student record created ✅' as status;

-- ========================================
-- STEP 6: ENROLL Student to Course & Batch
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
student_info AS (
    SELECT id FROM ems.students WHERE student_code = 'STD-2026-001' LIMIT 1
),
course_info AS (
    SELECT id FROM ems.courses WHERE course_code = 'FSD-2026-001' LIMIT 1
),
batch_info AS (
    SELECT id FROM ems.batches WHERE batch_code = 'FSD-2026-M' LIMIT 1
)
INSERT INTO ems.student_enrollments (
    company_id,
    student_id,
    course_id,
    batch_id,
    enrollment_date,
    enrollment_status,
    payment_status,
    payment_amount,
    completion_percentage,
    created_by
)
SELECT
    company_info.id,
    student_info.id,
    course_info.id,
    batch_info.id,
    CURRENT_DATE,
    'ACTIVE',
    'PAID',
    25000.00,
    0,
    student_info.id
FROM company_info, student_info, course_info, batch_info
ON CONFLICT (company_id, student_id, course_id, batch_id) DO UPDATE
SET 
    enrollment_status = 'ACTIVE',
    updated_at = NOW()
RETURNING id, 'Student enrolled ✅' as status;

-- Update batch strength
UPDATE ems.batches
SET current_strength = (
    SELECT COUNT(*) 
    FROM ems.student_enrollments 
    WHERE batch_id = ems.batches.id 
    AND enrollment_status = 'ACTIVE'
)
WHERE batch_code = 'FSD-2026-M';

-- ========================================
-- VERIFICATION: Check Complete Setup
-- ========================================

-- 1. Tutor Account
SELECT 
    '🧑🏫 TUTOR' as account_type,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    r.name as role,
    c.name as institution,
    u.is_active,
    'Login: tutor@aipl.com / Tutor@2026' as credentials
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.companies c ON ur.company_id = c.id
WHERE u.email = 'tutor@aipl.com';

-- 2. Student Account with Full Mapping
SELECT 
    '👨🎓 STUDENT' as account_type,
    u.email,
    s.student_code,
    s.first_name || ' ' || s.last_name as full_name,
    c.name as institution,
    co.course_name,
    b.batch_name,
    b.schedule as class_schedule,
    se.enrollment_status,
    'Login: student@aipl.com / Student@2026' as credentials
FROM app_auth.users u
JOIN ems.students s ON u.id = s.user_id
JOIN ems.student_enrollments se ON s.id = se.student_id
JOIN core.companies c ON s.company_id = c.id
JOIN ems.courses co ON se.course_id = co.id
JOIN ems.batches b ON se.batch_id = b.id
WHERE u.email = 'student@aipl.com';

-- 3. Course & Batch Structure
SELECT 
    '📚 ACADEMIC STRUCTURE' as type,
    co.course_code,
    co.course_name,
    co.course_level,
    co.status as course_status,
    b.batch_code,
    b.batch_name,
    b.start_date,
    b.end_date,
    b.start_time || ' - ' || b.end_time as timings,
    b.max_students,
    b.current_strength as enrolled_students,
    b.status as batch_status
FROM ems.courses co
JOIN ems.batches b ON co.id = b.course_id
WHERE co.course_code = 'FSD-2026-001';

-- ========================================
-- 📋 SUMMARY - LOGIN CREDENTIALS
-- ========================================
SELECT 
    '✅ SETUP COMPLETE' as status,
    'ALL INDIA Private Limited' as institution,
    '
🧑🏫 TUTOR LOGIN:
   Email: tutor@aipl.com
   Password: Tutor@2026
   Role: Content Creator & Academic Manager

👨🎓 STUDENT LOGIN:
   Email: student@aipl.com
   Password: Student@2026
   Student Code: STD-2026-001
   Course: Full Stack Development
   Batch: FSD-2026-Morning
   Schedule: 09:00 AM - 12:00 PM
   
📚 COURSE DETAILS:
   Code: FSD-2026-001
   Name: Full Stack Development
   Level: Intermediate
   Duration: 160 hours
   Fee: ₹25,000
   Status: ACTIVE
    ' as details;
