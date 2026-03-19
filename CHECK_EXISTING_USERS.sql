-- ============================================================================
-- CHECK EXISTING TEST USERS
-- Description: Verify existing test users and their credentials
-- ============================================================================

-- ============================================================================
-- 1. LIST ALL EXISTING USERS WITH ROLES
-- ============================================================================

SELECT 
    u.id as user_id,
    u.email,
    r.role_type,
    CASE 
        WHEN e.first_name IS NOT NULL THEN e.first_name || ' ' || e.last_name
        WHEN s.first_name IS NOT NULL THEN s.first_name || ' ' || s.last_name
        ELSE 'Unknown'
    END as full_name,
    c.name as company_name,
    u.is_active
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.employees e ON u.email = e.email
LEFT JOIN ems.students s ON u.email = s.email
LEFT JOIN core.companies c ON ur.company_id = c.id
WHERE u.email LIKE '%durkkas.com'
ORDER BY r.role_type, u.email;

-- ============================================================================
-- 2. FIND MANAGER
-- ============================================================================

SELECT 
    u.email,
    e.first_name || ' ' || e.last_name as name,
    'Manager@123' as suggested_password,
    r.role_type
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.employees e ON u.email = e.email
WHERE r.role_type = 'ACADEMIC_MANAGER'
LIMIT 1;

-- ============================================================================
-- 3. FIND TUTORS
-- ============================================================================

SELECT 
    u.email,
    e.first_name || ' ' || e.last_name as name,
    'Tutor@123' as suggested_password,
    r.role_type
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.employees e ON u.email = e.email
WHERE r.role_type = 'TUTOR'
LIMIT 3;

-- ============================================================================
-- 4. FIND STUDENTS
-- ============================================================================

SELECT 
    u.email,
    s.first_name || ' ' || s.last_name as name,
    'Student@123' as suggested_password,
    r.role_type,
    s.student_code
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN ems.students s ON u.email = s.email
WHERE r.role_type = 'STUDENT'
LIMIT 5;

-- ============================================================================
-- 5. CHECK ENROLLMENTS (OPTIONAL - uncomment if enrollments table exists)
-- ============================================================================

-- SELECT 
--     s.student_code,
--     s.first_name || ' ' || s.last_name as student_name,
--     c.course_code,
--     c.course_name,
--     b.batch_code,
--     e.enrollment_status
-- FROM ems.enrollments e
-- JOIN ems.students s ON e.student_id = s.id
-- JOIN ems.courses c ON e.course_id = c.id
-- JOIN ems.batches b ON e.batch_id = b.id
-- WHERE e.enrollment_status = 'ACTIVE'
-- ORDER BY s.student_code, c.course_code;

-- ============================================================================
-- 6. RESET PASSWORD (IF NEEDED)
-- ============================================================================

-- Uncomment and run if you need to reset passwords

-- UPDATE app_auth.users 
-- SET password_hash = crypt('Manager@123', gen_salt('bf'))
-- WHERE email LIKE '%@durkkas.com' 
-- AND email IN (
--     SELECT u.email FROM app_auth.users u
--     JOIN app_auth.user_roles ur ON u.id = ur.user_id
--     JOIN app_auth.roles r ON ur.role_id = r.id
--     WHERE r.role_type = 'ACADEMIC_MANAGER'
-- );

-- UPDATE app_auth.users 
-- SET password_hash = crypt('Tutor@123', gen_salt('bf'))
-- WHERE email LIKE '%@durkkas.com' 
-- AND email IN (
--     SELECT u.email FROM app_auth.users u
--     JOIN app_auth.user_roles ur ON u.id = ur.user_id
--     JOIN app_auth.roles r ON ur.role_id = r.id
--     WHERE r.role_type = 'TUTOR'
-- );

-- UPDATE app_auth.users 
-- SET password_hash = crypt('Student@123', gen_salt('bf'))
-- WHERE email LIKE '%student.durkkas.com';

-- ============================================================================
-- DONE! Use the emails shown above with their suggested passwords
-- ============================================================================
