-- ========================================
-- COMPLETE EMS SETUP FOR AIPL - FIXED
-- Following Jay Kumar's Vision
-- ========================================

-- First, run setup_ems_roles.sql to create the roles and tables!

-- ========================================
-- STEP 1: Create ACADEMIC_MANAGER
-- ========================================
DO $$
DECLARE
    v_company_id BIGINT;
    v_user_id BIGINT;
    v_role_id BIGINT;
BEGIN
    -- Get company ID
    SELECT id INTO v_company_id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1;
    
    -- Create or update user
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, is_active, is_locked)
    VALUES ('academic@aipl.com', crypt('Academic@2026', gen_salt('bf')), 'Dr. Ramesh', 'Patel', true, false)
    ON CONFLICT (email) DO UPDATE
    SET password_hash = crypt('Academic@2026', gen_salt('bf')), is_active = true, is_locked = false
    RETURNING id INTO v_user_id;
    
    -- Get role ID
    SELECT id INTO v_role_id FROM app_auth.roles WHERE name = 'ACADEMIC_MANAGER' LIMIT 1;
    
    -- Assign role (delete existing first to avoid conflict)
    DELETE FROM app_auth.user_roles WHERE user_id = v_user_id AND role_id = v_role_id AND company_id = v_company_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
    VALUES (v_user_id, v_role_id, v_company_id, NULL);
    
    RAISE NOTICE '✅ Academic Manager created: academic@aipl.com';
END $$;

-- ========================================
-- STEP 2: Create Academic Manager Settings
-- ========================================
INSERT INTO ems.academic_manager_settings (
    company_id,
    academic_manager_id,
    default_tutor_permissions,
    allow_student_self_enrollment,
    require_payment_for_enrollment,
    auto_generate_certificates
)
SELECT
    c.id,
    u.id,
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
    true
FROM core.companies c, app_auth.users u
WHERE c.name ILIKE '%ALL INDIA%' AND u.email = 'academic@aipl.com'
ON CONFLICT (company_id, academic_manager_id) DO UPDATE
SET updated_at = NOW();

-- ========================================
-- STEP 3: Create TUTOR
-- ========================================
DO $$
DECLARE
    v_company_id BIGINT;
    v_user_id BIGINT;
    v_role_id BIGINT;
BEGIN
    SELECT id INTO v_company_id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1;
    
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, is_active, is_locked)
    VALUES ('tutor@aipl.com', crypt('Tutor@2026', gen_salt('bf')), 'Rajesh', 'Kumar', true, false)
    ON CONFLICT (email) DO UPDATE
    SET password_hash = crypt('Tutor@2026', gen_salt('bf')), is_active = true, is_locked = false
    RETURNING id INTO v_user_id;
    
    SELECT id INTO v_role_id FROM app_auth.roles WHERE name = 'TUTOR' LIMIT 1;
    
    DELETE FROM app_auth.user_roles WHERE user_id = v_user_id AND role_id = v_role_id AND company_id = v_company_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
    VALUES (v_user_id, v_role_id, v_company_id, NULL);
    
    RAISE NOTICE '✅ Tutor created: tutor@aipl.com';
END $$;

-- ========================================
-- STEP 4: Set Tutor Permissions
-- ========================================
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
    c.id,
    t.id,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    a.id
FROM core.companies c, app_auth.users t, app_auth.users a
WHERE c.name ILIKE '%ALL INDIA%' 
  AND t.email = 'tutor@aipl.com'
  AND a.email = 'academic@aipl.com'
ON CONFLICT (company_id, tutor_id) DO UPDATE
SET 
    can_create_assignments = true,
    can_create_quizzes = true,
    updated_at = NOW();

-- ========================================
-- STEP 5: Create STUDENT User
-- ========================================
DO $$
DECLARE
    v_company_id BIGINT;
    v_user_id BIGINT;
    v_role_id BIGINT;
BEGIN
    SELECT id INTO v_company_id FROM core.companies WHERE name ILIKE '%ALL INDIA%' LIMIT 1;
    
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, is_active, is_locked)
    VALUES ('student@aipl.com', crypt('Student@2026', gen_salt('bf')), 'Priya', 'Sharma', true, false)
    ON CONFLICT (email) DO UPDATE
    SET password_hash = crypt('Student@2026', gen_salt('bf')), is_active = true, is_locked = false
    RETURNING id INTO v_user_id;
    
    SELECT id INTO v_role_id FROM app_auth.roles WHERE name = 'STUDENT' LIMIT 1;
    
    DELETE FROM app_auth.user_roles WHERE user_id = v_user_id AND role_id = v_role_id AND company_id = v_company_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
    VALUES (v_user_id, v_role_id, v_company_id, NULL);
    
    RAISE NOTICE '✅ Student user created: student@aipl.com';
END $$;

-- ========================================
-- STEP 6: Create Student Record in EMS
-- ========================================
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
    c.id,
    s.id,
    'STD-2026-001',
    'Priya',
    'Sharma',
    'student@aipl.com',
    '+91 9876543210',
    'ACTIVE',
    true,
    a.id
FROM core.companies c, app_auth.users s, app_auth.users a
WHERE c.name ILIKE '%ALL INDIA%'
  AND s.email = 'student@aipl.com'
  AND a.email = 'academic@aipl.com'
ON CONFLICT (company_id, student_code) DO UPDATE
SET 
    status = 'ACTIVE',
    is_active = true,
    updated_at = NOW();

-- ========================================
-- VERIFICATION
-- ========================================

-- 1. Academic Manager
SELECT 
    '🎓 ACADEMIC MANAGER' as role_type,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    r.name as role,
    r.level,
    c.name as institution
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
    tp.can_schedule_live_classes
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN ems.tutor_permissions tp ON u.id = tp.tutor_id
WHERE u.email = 'tutor@aipl.com';

-- 3. Student
SELECT 
    '👨🎓 STUDENT' as role_type,
    u.email,
    s.student_code,
    s.first_name || ' ' || s.last_name as full_name,
    r.name as role,
    c.name as institution
FROM app_auth.users u
JOIN ems.students s ON u.id = s.user_id
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.companies c ON s.company_id = c.id
WHERE u.email = 'student@aipl.com';

-- ========================================
-- SUMMARY
-- ========================================
SELECT 
    '✅ EMS SETUP COMPLETE' as status,
    '
🎓 ACADEMIC MANAGER:
   Email: academic@aipl.com
   Password: Academic@2026

🧑🏫 TUTOR:
   Email: tutor@aipl.com
   Password: Tutor@2026

👨🎓 STUDENT:
   Email: student@aipl.com
   Password: Student@2026
    ' as credentials;
