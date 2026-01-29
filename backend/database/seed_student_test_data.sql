-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STUDENT ROLE SETUP & TEST DATA (ROBUST VERSION)
-- Purpose: Create Student role and seed test student for "DIPL" company
-- This version uses subqueries to avoid ON CONFLICT errors due to schema variations.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Step 1: Create STUDENT Role
INSERT INTO app_auth.roles (name, display_name, description, role_type, product, level, is_system_role) 
SELECT 'STUDENT', 'Student', 'Student user with access to learning portal', 'PRODUCT', 'EMS', 0, TRUE
WHERE NOT EXISTS (SELECT 1 FROM app_auth.roles WHERE name = 'STUDENT');

-- Step 2: Create Student-specific permissions
INSERT INTO app_auth.permissions (name, display_name, description, permission_scope, schema_name, resource, action)
SELECT p.name, p.display_name, p.description, p.permission_scope, p.schema_name, p.resource, p.action
FROM (VALUES 
    ('ems.courses.view', 'View Courses', 'View enrolled courses', 'COMPANY', 'ems', 'courses', 'view'),
    ('ems.lessons.view', 'View Lessons', 'View course lessons', 'COMPANY', 'ems', 'lessons', 'view'),
    ('ems.assignments.submit', 'Submit Assignments', 'Submit assignments', 'COMPANY', 'ems', 'assignments', 'submit'),
    ('ems.quizzes.attempt', 'Attempt Quizzes', 'Attempt quizzes', 'COMPANY', 'ems', 'quizzes', 'attempt'),
    ('ems.attendance.view', 'View Attendance', 'View own attendance', 'COMPANY', 'ems', 'attendance', 'view'),
    ('ems.profile.view', 'View Profile', 'View own profile', 'COMPANY', 'ems', 'students', 'view_own')
) AS p(name, display_name, description, permission_scope, schema_name, resource, action)
WHERE NOT EXISTS (SELECT 1 FROM app_auth.permissions WHERE name = p.name);

-- Step 3: Assign permissions to STUDENT role
INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_auth.roles r
CROSS JOIN app_auth.permissions p
WHERE r.name = 'STUDENT'
  AND p.name IN (
    'ems.courses.view',
    'ems.lessons.view',
    'ems.assignments.submit',
    'ems.quizzes.attempt',
    'ems.attendance.view',
    'ems.profile.view'
  )
  AND NOT EXISTS (
      SELECT 1 FROM app_auth.role_permissions rp 
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Step 4: Create test company "DIPL" (if not exists)
INSERT INTO core.companies (name, legal_name, code, email, phone, subscription_plan, subscription_start_date, subscription_end_date, is_active)
SELECT 'Durkkas Institute of Professional Learning', 'DIPL Pvt Ltd', 'DIPL', 'admin@dipl.edu', '+91-9876543210', 'ENTERPRISE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', TRUE
WHERE NOT EXISTS (SELECT 1 FROM core.companies WHERE code = 'DIPL');

-- Step 5: Create a branch for DIPL
INSERT INTO core.branches (company_id, name, code, branch_type, email, phone, is_active)
SELECT (SELECT id FROM core.companies WHERE code = 'DIPL'), 'DIPL Main Campus', 'DIPL-MAIN', 'HQ', 'campus@dipl.edu', '+91-9876543211', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM core.branches 
    WHERE code = 'DIPL-MAIN' AND company_id = (SELECT id FROM core.companies WHERE code = 'DIPL')
);

-- Step 6: Create user account for the student
-- Password: student@123 (hashed with bcrypt: $2a$10$k91.jqhvMdHoITckgcxzBuO56/cJuwIsFKr1GN.EVbMD/i9KzagY.)
INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, is_verified)
SELECT 'rajesh.sharma@student.dipl.edu', '$2a$10$k91.jqhvMdHoITckgcxzBuO56/cJuwIsFKr1GN.EVbMD/i9KzagY.', 'Rajesh', 'Sharma', 'Rajesh Kumar Sharma', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM app_auth.users WHERE email = 'rajesh.sharma@student.dipl.edu');

-- Ensure the password is correct even if user already existed
UPDATE app_auth.users 
SET password_hash = '$2a$10$k91.jqhvMdHoITckgcxzBuO56/cJuwIsFKr1GN.EVbMD/i9KzagY.',
    is_active = TRUE,
    is_verified = TRUE
WHERE email = 'rajesh.sharma@student.dipl.edu';

-- Step 7: Create test student in EMS schema and link to user
-- We use DO UPDATE style for the link if it exists, but first we ensure it exists
INSERT INTO ems.students (company_id, branch_id, user_id, student_code, first_name, middle_name, last_name, date_of_birth, gender, email, phone, address_line1, city, state, country, postal_code, status, is_active)
SELECT 
    (SELECT id FROM core.companies WHERE code = 'DIPL'),
    (SELECT id FROM core.branches WHERE code = 'DIPL-MAIN' AND company_id = (SELECT id FROM core.companies WHERE code = 'DIPL')),
    (SELECT id FROM app_auth.users WHERE email = 'rajesh.sharma@student.dipl.edu'),
    'DIPL2026001', 'Rajesh', 'Kumar', 'Sharma', '2005-06-15', 'Male', 'rajesh.sharma@student.dipl.edu', '+91-9123456789', '123, MG Road', 'Chennai', 'Tamil Nadu', 'India', '600001', 'ACTIVE', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM ems.students 
    WHERE student_code = 'DIPL2026001' AND company_id = (SELECT id FROM core.companies WHERE code = 'DIPL')
);

-- Update user_id in case it was missing in an existing record
UPDATE ems.students 
SET user_id = (SELECT id FROM app_auth.users WHERE email = 'rajesh.sharma@student.dipl.edu')
WHERE student_code = 'DIPL2026001' 
  AND company_id = (SELECT id FROM core.companies WHERE code = 'DIPL')
  AND user_id IS NULL;

-- Step 8: Assign STUDENT role to the user (scoped to DIPL company)
INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id, is_active)
SELECT u.id, r.id, c.id, b.id, TRUE
FROM app_auth.users u
CROSS JOIN app_auth.roles r
CROSS JOIN core.companies c
LEFT JOIN core.branches b ON b.company_id = c.id AND b.code = 'DIPL-MAIN'
WHERE u.email = 'rajesh.sharma@student.dipl.edu'
  AND r.name = 'STUDENT'
  AND c.code = 'DIPL'
  AND NOT EXISTS (
      SELECT 1 FROM app_auth.user_roles ur 
      WHERE ur.user_id = u.id AND ur.role_id = r.id AND ur.company_id = c.id
  );

-- Step 9: Create a sample course for testing
INSERT INTO ems.courses (company_id, branch_id, course_code, course_name, course_description, course_category, course_level, course_type, duration_hours, total_lessons, price, is_published, status, is_active)
SELECT 
    (SELECT id FROM core.companies WHERE code = 'DIPL'),
    (SELECT id FROM core.branches WHERE code = 'DIPL-MAIN' AND company_id = (SELECT id FROM core.companies WHERE code = 'DIPL')),
    'WEB101', 'Full Stack Web Development', 'Learn modern web development with React, Node.js, and databases', 'Technology', 'Beginner', 'ONLINE', 120, 48, 15000, TRUE, 'PUBLISHED', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM ems.courses 
    WHERE course_code = 'WEB101' AND company_id = (SELECT id FROM core.companies WHERE code = 'DIPL')
);

-- Step 10: Enroll the student in the course
INSERT INTO ems.student_enrollments (company_id, student_id, course_id, enrollment_date, enrollment_status, payment_status, payment_amount, total_lessons, lessons_completed, completion_percentage)
SELECT 
    (SELECT id FROM core.companies WHERE code = 'DIPL'),
    (SELECT id FROM ems.students WHERE student_code = 'DIPL2026001'),
    (SELECT id FROM ems.courses WHERE course_code = 'WEB101'),
    CURRENT_DATE, 'ACTIVE', 'PAID', 15000, 48, 12, 25
WHERE NOT EXISTS (
    SELECT 1 FROM ems.student_enrollments 
    WHERE student_id = (SELECT id FROM ems.students WHERE student_code = 'DIPL2026001')
      AND course_id = (SELECT id FROM ems.courses WHERE course_code = 'WEB101')
      AND company_id = (SELECT id FROM core.companies WHERE code = 'DIPL')
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION QUERIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
    RAISE NOTICE '✅ Student Setup Complete!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🏢 Company: DIPL (Durkkas Institute of Professional Learning)';
    RAISE NOTICE '👤 Student: Rajesh Kumar Sharma';
    RAISE NOTICE '🆔 Student Code: DIPL2026001';
    RAISE NOTICE '📧 Email: rajesh.sharma@student.dipl.edu';
    RAISE NOTICE '🔑 Password: student@123';
    RAISE NOTICE '📚 Enrolled Course: Full Stack Web Development (WEB101)';
    RAISE NOTICE '📊 Progress: 25%% (12/48 lessons completed)';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
