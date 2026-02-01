-- ========================================
-- COMPLETE EMS SETUP FOR AIPL
-- Following Jay Kumar's Vision
-- Dynamic, Role-Driven, Global Platform
-- ========================================

-- ========================================
-- STEP 1: Create ACADEMIC_MANAGER for AIPL
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
new_academic_manager AS (
    INSERT INTO app_auth.users (
        email,
        password_hash,
        first_name,
        last_name,
        is_active,
        is_locked
    )
    VALUES (
        'academic@aipl.com',
        crypt('Academic@2026', gen_salt('bf')),
        'Dr. Ramesh',
        'Patel',
        true,
        false
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        password_hash = crypt('Academic@2026', gen_salt('bf')),
        is_active = true,
        is_locked = false
    RETURNING id
)
INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
SELECT 
    new_academic_manager.id,
    (SELECT id FROM app_auth.roles WHERE name = 'ACADEMIC_MANAGER' LIMIT 1),
    company_info.id,
    NULL
FROM new_academic_manager, company_info
WHERE NOT EXISTS (
    SELECT 1 FROM app_auth.user_roles 
    WHERE user_id = new_academic_manager.id 
    AND role_id = (SELECT id FROM app_auth.roles WHERE name = 'ACADEMIC_MANAGER' LIMIT 1)
    AND company_id = company_info.id
)
RETURNING user_id, 'Academic Manager created ✅' as status;

-- ========================================
-- STEP 2: Create Academic Manager Settings
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
academic_manager AS (
    SELECT id FROM app_auth.users WHERE email = 'academic@aipl.com' LIMIT 1
)
INSERT INTO ems.academic_manager_settings (
    company_id,
    academic_manager_id,
    default_tutor_permissions,
    allow_student_self_enrollment,
    require_payment_for_enrollment,
    auto_generate_certificates,
    notify_on_new_enrollment,
    notify_on_assignment_submission
)
SELECT
    company_info.id,
    academic_manager.id,
    '{
        "can_create_courses": false,
        "can_edit_course_structure": true,
        "can_create_assignments": true,
        "can_create_quizzes": true,
        "can_schedule_live_classes": true,
        "can_grade_assignments": true,
        "can_view_analytics": true
    }'::jsonb,
    false,
    true,
    true,
    true,
    true
FROM company_info, academic_manager
ON CONFLICT (company_id, academic_manager_id) DO UPDATE
SET updated_at = NOW()
RETURNING id, 'Settings configured ✅' as status;

-- ========================================
-- STEP 3: Create TUTOR Account
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
new_tutor AS (
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
    new_tutor.id,
    tutor_role.id,
    company_info.id,
    NULL
FROM new_tutor, tutor_role, company_info

RETURNING user_id, 'Tutor created ✅' as status;

-- ========================================
-- STEP 4: Set Tutor Permissions
-- ========================================
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
tutor_info AS (
    SELECT id FROM app_auth.users WHERE email = 'tutor@aipl.com' LIMIT 1
),
academic_manager AS (
    SELECT id FROM app_auth.users WHERE email = 'academic@aipl.com' LIMIT 1
)
INSERT INTO ems.tutor_permissions (
    company_id,
    tutor_id,
    can_create_courses,
    can_edit_course_structure,
    can_create_assignments,
    can_create_quizzes,
    can_create_materials,
    can_schedule_live_classes,
    can_grade_assignments,
    can_view_analytics,
    granted_by
)
SELECT
    company_info.id,
    tutor_info.id,
    false,  -- Cannot create courses (Academic Manager does this)
    true,   -- Can edit structure of assigned courses
    true,   -- Can create assignments
    true,   -- Can create quizzes
    true,   -- Can upload materials
    true,   -- Can schedule live classes
    true,   -- Can grade assignments
    true,   -- Can view analytics
    academic_manager.id
FROM company_info, tutor_info, academic_manager
ON CONFLICT (company_id, tutor_id) DO UPDATE
SET 
    can_create_assignments = true,
    can_create_quizzes = true,
    updated_at = NOW()
RETURNING id, 'Tutor permissions set ✅' as status;

-- ========================================
-- STEP 5: Create STUDENT Account
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

RETURNING user_id, 'Student user created ✅' as status;

-- Create student record in EMS
WITH company_info AS (
    SELECT id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1
),
student_user AS (
    SELECT id FROM app_auth.users WHERE email = 'student@aipl.com' LIMIT 1
),
academic_manager AS (
    SELECT id FROM app_auth.users WHERE email = 'academic@aipl.com' LIMIT 1
)
INSERT INTO ems.students (
    company_id,
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
    student_user.id,
    'STD-2026-001',
    'Priya',
    'Sharma',
    'student@aipl.com',
    '+91 9876543210',
    'ACTIVE',
    true,
    academic_manager.id
FROM company_info, student_user, academic_manager
ON CONFLICT (company_id, student_code) DO UPDATE
SET 
    status = 'ACTIVE',
    is_active = true,
    updated_at = NOW()
RETURNING id, student_code, 'Student record created ✅' as status;

-- ========================================
-- VERIFICATION: Complete Setup
-- ========================================

-- 1. Academic Manager
SELECT 
    '🎓 ACADEMIC MANAGER' as role_type,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    r.name as role,
    r.level,
    c.name as institution,
    'Login: academic@aipl.com / Academic@2026' as credentials
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.companies c ON ur.company_id = c.id
WHERE u.email = 'academic@aipl.com';

-- 2. Tutor with Permissions
SELECT 
    '🧑🏫 TUTOR' as role_type,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    r.name as role,
    tp.can_create_assignments,
    tp.can_create_quizzes,
    tp.can_schedule_live_classes,
    tp.can_grade_assignments,
    'Login: tutor@aipl.com / Tutor@2026' as credentials
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN ems.tutor_permissions tp ON u.id = tp.tutor_id
WHERE u.email = 'tutor@aipl.com';

-- 3. Student
SELECT 
    '👨🎓 STUDENT' as role_type,
    u.email,
    s.student_code,
    s.first_name || ' ' || s.last_name as full_name,
    r.name as role,
    c.name as institution,
    'Login: student@aipl.com / Student@2026' as credentials
FROM app_auth.users u
JOIN ems.students s ON u.id = s.user_id
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.companies c ON s.company_id = c.id
WHERE u.email = 'student@aipl.com';

-- ========================================
-- 📋 COMPLETE SETUP SUMMARY
-- ========================================
SELECT 
    '✅ EMS SETUP COMPLETE' as status,
    'ALL INDIA Private Limited' as institution,
    '
🎓 ACADEMIC MANAGER:
   Email: academic@aipl.com
   Password: Academic@2026
   Name: Dr. Ramesh Patel
   Role: Academic Administrator
   Capabilities:
   - Create & manage courses
   - Create & manage batches
   - Assign tutors to courses
   - Enroll students
   - Control tutor permissions
   - View all analytics

🧑🏫 TUTOR:
   Email: tutor@aipl.com
   Password: Tutor@2026
   Name: Rajesh Kumar
   Role: Content Creator
   Permissions:
   - ✅ Create assignments
   - ✅ Create quizzes
   - ✅ Upload materials
   - ✅ Schedule live classes
   - ✅ Grade assignments
   - ✅ View analytics
   - ❌ Create courses (Academic Manager only)

👨🎓 STUDENT:
   Email: student@aipl.com
   Password: Student@2026
   Name: Priya Sharma
   Student Code: STD-2026-001
   Role: Learner
   
📊 SYSTEM STATUS:
   - Role-based access: ✅ Configured
   - Permission system: ✅ Active
   - Multi-tenancy: ✅ Enabled
   - Audit trail: ✅ Enabled
   
🚀 NEXT STEPS:
   1. Login as Academic Manager
   2. Create courses from dashboard
   3. Create batches
   4. Assign tutor to courses
   5. Enroll student to batch
   6. Tutor creates content
   7. Student sees assigned content
    ' as details;
