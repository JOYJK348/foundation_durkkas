-- ============================================================================
-- EMS TEST USERS - INSERT SCRIPT
-- Description: Create test users for Manager, Tutors, and Students
-- Company: Durkkas Academy (company_id = 13)
-- ============================================================================

-- Note: Run this script in Supabase SQL Editor
-- Make sure the company exists first

DO $$
DECLARE
    v_company_id BIGINT := 13; -- Durkkas Academy
    v_manager_id BIGINT;
    v_tutor1_id BIGINT;
    v_tutor2_id BIGINT;
    v_student1_id BIGINT;
    v_student2_id BIGINT;
    v_student3_id BIGINT;
    v_course1_id BIGINT;
    v_course2_id BIGINT;
    v_course3_id BIGINT;
    v_course4_id BIGINT;
    v_batch1_id BIGINT;
    v_batch2_id BIGINT;
    v_batch3_id BIGINT;
    v_batch4_id BIGINT;
BEGIN
    -- ========================================================================
    -- 1. CREATE MANAGER USER
    -- ========================================================================
    
    -- Insert into app_auth.users
    INSERT INTO app_auth.users (email, password_hash, is_active, created_at)
    VALUES ('rajesh.kumar@durkkas.com', crypt('Manager@123', gen_salt('bf')), true, NOW())
    RETURNING id INTO v_manager_id;
    
    -- Insert into core.employees
    INSERT INTO core.employees (
        company_id, first_name, last_name, email, phone, 
        designation, department, is_active
    ) VALUES (
        v_company_id, 'Rajesh', 'Kumar', 'rajesh.kumar@durkkas.com', '+91-9876543210',
        'Academic Manager', 'EMS', true
    );
    
    -- Assign ACADEMIC_MANAGER role
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, is_primary)
    SELECT v_manager_id, id, v_company_id, true
    FROM app_auth.roles WHERE role_name = 'ACADEMIC_MANAGER';
    
    -- ========================================================================
    -- 2. CREATE TUTOR 1 - Priya Sharma
    -- ========================================================================
    
    INSERT INTO app_auth.users (email, password_hash, is_active, created_at)
    VALUES ('priya.sharma@durkkas.com', crypt('Tutor@123', gen_salt('bf')), true, NOW())
    RETURNING id INTO v_tutor1_id;
    
    INSERT INTO core.employees (
        company_id, first_name, last_name, email, phone, 
        designation, department, is_active
    ) VALUES (
        v_company_id, 'Priya', 'Sharma', 'priya.sharma@durkkas.com', '+91-9876543211',
        'Senior Tutor', 'EMS', true
    );
    
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, is_primary)
    SELECT v_tutor1_id, id, v_company_id, true
    FROM app_auth.roles WHERE role_name = 'TUTOR';
    
    -- ========================================================================
    -- 3. CREATE TUTOR 2 - Arun Patel
    -- ========================================================================
    
    INSERT INTO app_auth.users (email, password_hash, is_active, created_at)
    VALUES ('arun.patel@durkkas.com', crypt('Tutor@123', gen_salt('bf')), true, NOW())
    RETURNING id INTO v_tutor2_id;
    
    INSERT INTO core.employees (
        company_id, first_name, last_name, email, phone, 
        designation, department, is_active
    ) VALUES (
        v_company_id, 'Arun', 'Patel', 'arun.patel@durkkas.com', '+91-9876543212',
        'Senior Tutor', 'EMS', true
    );
    
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, is_primary)
    SELECT v_tutor2_id, id, v_company_id, true
    FROM app_auth.roles WHERE role_name = 'TUTOR';
    
    -- ========================================================================
    -- 4. CREATE COURSES
    -- ========================================================================
    
    -- Course 1: Full Stack Development (Tutor: Priya)
    INSERT INTO ems.courses (
        company_id, course_code, course_name, course_description,
        duration_hours, course_level, course_category, is_published, status
    ) VALUES (
        v_company_id, 'FS-2026', 'Full Stack Web Development',
        'Master modern web development with React, Node.js, and PostgreSQL',
        120, 'INTERMEDIATE', 'Programming', true, 'PUBLISHED'
    ) RETURNING id INTO v_course1_id;
    
    -- Course 2: Python Programming (Tutor: Priya)
    INSERT INTO ems.courses (
        company_id, course_code, course_name, course_description,
        duration_hours, course_level, course_category, is_published, status
    ) VALUES (
        v_company_id, 'PY-2026', 'Python Programming Fundamentals',
        'Learn Python from basics to advanced concepts',
        80, 'BEGINNER', 'Programming', true, 'PUBLISHED'
    ) RETURNING id INTO v_course2_id;
    
    -- Course 3: Data Science (Tutor: Arun)
    INSERT INTO ems.courses (
        company_id, course_code, course_name, course_description,
        duration_hours, course_level, course_category, is_published, status
    ) VALUES (
        v_company_id, 'DS-2026', 'Data Science with Python',
        'Data analysis, visualization, and machine learning basics',
        100, 'INTERMEDIATE', 'Data Science', true, 'PUBLISHED'
    ) RETURNING id INTO v_course3_id;
    
    -- Course 4: Machine Learning (Tutor: Arun)
    INSERT INTO ems.courses (
        company_id, course_code, course_name, course_description,
        duration_hours, course_level, course_category, is_published, status
    ) VALUES (
        v_company_id, 'ML-2026', 'Machine Learning Fundamentals',
        'Deep dive into ML algorithms and implementations',
        120, 'ADVANCED', 'Data Science', true, 'PUBLISHED'
    ) RETURNING id INTO v_course4_id;
    
    -- ========================================================================
    -- 5. CREATE BATCHES
    -- ========================================================================
    
    INSERT INTO ems.batches (
        company_id, course_id, batch_code, batch_name,
        start_date, end_date, max_students, status
    ) VALUES (
        v_company_id, v_course1_id, 'FS-2026-01', 'Morning Batch',
        '2026-02-01', '2026-05-31', 30, 'ACTIVE'
    ) RETURNING id INTO v_batch1_id;
    
    INSERT INTO ems.batches (
        company_id, course_id, batch_code, batch_name,
        start_date, end_date, max_students, status
    ) VALUES (
        v_company_id, v_course2_id, 'PY-2026-01', 'Evening Batch',
        '2026-02-01', '2026-04-30', 30, 'ACTIVE'
    ) RETURNING id INTO v_batch2_id;
    
    INSERT INTO ems.batches (
        company_id, course_id, batch_code, batch_name,
        start_date, end_date, max_students, status
    ) VALUES (
        v_company_id, v_course3_id, 'DS-2026-01', 'Weekend Batch',
        '2026-02-01', '2026-05-31', 25, 'ACTIVE'
    ) RETURNING id INTO v_batch3_id;
    
    INSERT INTO ems.batches (
        company_id, course_id, batch_code, batch_name,
        start_date, end_date, max_students, status
    ) VALUES (
        v_company_id, v_course4_id, 'ML-2026-01', 'Weekday Batch',
        '2026-02-01', '2026-05-31', 20, 'ACTIVE'
    ) RETURNING id INTO v_batch4_id;
    
    -- ========================================================================
    -- 6. CREATE STUDENTS
    -- ========================================================================
    
    -- Student 1: Vikram Reddy
    INSERT INTO app_auth.users (email, password_hash, is_active, created_at)
    VALUES ('vikram.reddy@student.durkkas.com', crypt('Student@123', gen_salt('bf')), true, NOW())
    RETURNING id INTO v_student1_id;
    
    INSERT INTO ems.students (
        company_id, student_code, first_name, last_name, email, phone,
        date_of_birth, gender, address, city, state, country, is_active
    ) VALUES (
        v_company_id, 'STU-2026-001', 'Vikram', 'Reddy',
        'vikram.reddy@student.durkkas.com', '+91-9876543220',
        '2000-05-15', 'MALE', '123 MG Road', 'Bangalore', 'Karnataka', 'India', true
    );
    
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, is_primary)
    SELECT v_student1_id, id, v_company_id, true
    FROM app_auth.roles WHERE role_name = 'STUDENT';
    
    -- Student 2: Sneha Iyer
    INSERT INTO app_auth.users (email, password_hash, is_active, created_at)
    VALUES ('sneha.iyer@student.durkkas.com', crypt('Student@123', gen_salt('bf')), true, NOW())
    RETURNING id INTO v_student2_id;
    
    INSERT INTO ems.students (
        company_id, student_code, first_name, last_name, email, phone,
        date_of_birth, gender, address, city, state, country, is_active
    ) VALUES (
        v_company_id, 'STU-2026-002', 'Sneha', 'Iyer',
        'sneha.iyer@student.durkkas.com', '+91-9876543221',
        '2001-08-22', 'FEMALE', '456 Brigade Road', 'Bangalore', 'Karnataka', 'India', true
    );
    
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, is_primary)
    SELECT v_student2_id, id, v_company_id, true
    FROM app_auth.roles WHERE role_name = 'STUDENT';
    
    -- Student 3: Arjun Nair
    INSERT INTO app_auth.users (email, password_hash, is_active, created_at)
    VALUES ('arjun.nair@student.durkkas.com', crypt('Student@123', gen_salt('bf')), true, NOW())
    RETURNING id INTO v_student3_id;
    
    INSERT INTO ems.students (
        company_id, student_code, first_name, last_name, email, phone,
        date_of_birth, gender, address, city, state, country, is_active
    ) VALUES (
        v_company_id, 'STU-2026-003', 'Arjun', 'Nair',
        'arjun.nair@student.durkkas.com', '+91-9876543222',
        '2000-12-10', 'MALE', '789 Residency Road', 'Bangalore', 'Karnataka', 'India', true
    );
    
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, is_primary)
    SELECT v_student3_id, id, v_company_id, true
    FROM app_auth.roles WHERE role_name = 'STUDENT';
    
    -- ========================================================================
    -- 7. CREATE ENROLLMENTS
    -- ========================================================================
    
    -- Vikram: Full Stack + Python
    INSERT INTO ems.enrollments (
        company_id, student_id, course_id, batch_id,
        enrollment_date, enrollment_status, payment_status
    ) VALUES
    (v_company_id, (SELECT id FROM ems.students WHERE student_code = 'STU-2026-001'), 
     v_course1_id, v_batch1_id, NOW(), 'ACTIVE', 'PAID'),
    (v_company_id, (SELECT id FROM ems.students WHERE student_code = 'STU-2026-001'), 
     v_course2_id, v_batch2_id, NOW(), 'ACTIVE', 'PAID');
    
    -- Sneha: Data Science + ML
    INSERT INTO ems.enrollments (
        company_id, student_id, course_id, batch_id,
        enrollment_date, enrollment_status, payment_status
    ) VALUES
    (v_company_id, (SELECT id FROM ems.students WHERE student_code = 'STU-2026-002'), 
     v_course3_id, v_batch3_id, NOW(), 'ACTIVE', 'PAID'),
    (v_company_id, (SELECT id FROM ems.students WHERE student_code = 'STU-2026-002'), 
     v_course4_id, v_batch4_id, NOW(), 'ACTIVE', 'PAID');
    
    -- Arjun: Full Stack + Data Science
    INSERT INTO ems.enrollments (
        company_id, student_id, course_id, batch_id,
        enrollment_date, enrollment_status, payment_status
    ) VALUES
    (v_company_id, (SELECT id FROM ems.students WHERE student_code = 'STU-2026-003'), 
     v_course1_id, v_batch1_id, NOW(), 'ACTIVE', 'PAID'),
    (v_company_id, (SELECT id FROM ems.students WHERE student_code = 'STU-2026-003'), 
     v_course3_id, v_batch3_id, NOW(), 'ACTIVE', 'PAID');
    
    RAISE NOTICE 'Test users created successfully!';
    RAISE NOTICE 'Manager: rajesh.kumar@durkkas.com / Manager@123';
    RAISE NOTICE 'Tutor 1: priya.sharma@durkkas.com / Tutor@123';
    RAISE NOTICE 'Tutor 2: arun.patel@durkkas.com / Tutor@123';
    RAISE NOTICE 'Student 1: vikram.reddy@student.durkkas.com / Student@123';
    RAISE NOTICE 'Student 2: sneha.iyer@student.durkkas.com / Student@123';
    RAISE NOTICE 'Student 3: arjun.nair@student.durkkas.com / Student@123';
    
END $$;

-- ============================================================================
-- VERIFY USERS
-- ============================================================================

SELECT 
    u.email,
    r.role_name,
    CASE 
        WHEN e.first_name IS NOT NULL THEN e.first_name || ' ' || e.last_name
        WHEN s.first_name IS NOT NULL THEN s.first_name || ' ' || s.last_name
        ELSE 'Unknown'
    END as full_name
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.employees e ON u.email = e.email
LEFT JOIN ems.students s ON u.email = s.email
WHERE u.email LIKE '%durkkas.com'
ORDER BY r.role_name, u.email;

-- ============================================================================
-- DONE!
-- ============================================================================
