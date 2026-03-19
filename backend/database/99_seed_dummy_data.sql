-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PRODUCTION-GRADE EMS DUMMY DATA SEED
-- Institution: Durkkas Academy of Research and Education (DARE)
-- Structure: 1 Manager | 5 Tutors | 30 Students | 3 Courses | 3 Batches
-- Password for ALL users: Durk@123
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- Schema Fixes
ALTER TABLE ems.course_modules ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE ems.lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE ems.course_materials ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE ems.course_materials ADD COLUMN IF NOT EXISTS menu_id BIGINT;
ALTER TABLE ems.course_materials ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE ems.live_classes ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE ems.live_classes ALTER COLUMN end_time DROP NOT NULL;
ALTER TABLE ems.courses ALTER COLUMN tutor_id DROP NOT NULL;

DO $$
DECLARE
    -- Company & Branch
    v_company_id BIGINT;
    v_branch_id BIGINT;
    v_dept_id BIGINT;
    v_desig_id BIGINT;
    
    -- Roles
    v_role_manager_id BIGINT;
    v_role_tutor_id BIGINT;
    v_role_student_id BIGINT;
    
    -- Manager
    v_manager_user_id BIGINT;
    
    -- Tutors
    v_tutor1_user_id BIGINT;
    v_tutor1_emp_id BIGINT;
    v_tutor2_user_id BIGINT;
    v_tutor2_emp_id BIGINT;
    v_tutor3_user_id BIGINT;
    v_tutor3_emp_id BIGINT;
    v_tutor4_user_id BIGINT;
    v_tutor4_emp_id BIGINT;
    v_tutor5_user_id BIGINT;
    v_tutor5_emp_id BIGINT;
    
    -- Courses
    v_course1_id BIGINT;
    v_course2_id BIGINT;
    v_course3_id BIGINT;
    
    -- Batches
    v_batch1_id BIGINT;
    v_batch2_id BIGINT;
    v_batch3_id BIGINT;
    
    -- Modules & Lessons
    v_module_id BIGINT;
    v_lesson_id BIGINT;
    
    -- Quizzes
    v_quiz1_id BIGINT;
    v_quiz2_id BIGINT;
    v_quiz3_id BIGINT;
    
    -- Assignments
    v_assign1_id BIGINT;
    v_assign2_id BIGINT;
    v_assign3_id BIGINT;
    
    -- Attendance Sessions
    v_attend_session1_id BIGINT;
    v_attend_session2_id BIGINT;
    v_attend_session3_id BIGINT;
    
    -- Student tracking
    v_student_user_id BIGINT;
    v_student_id BIGINT;
    
    -- Utilities
    v_now TIMESTAMPTZ := NOW();
    v_pass_hash TEXT := crypt('Durk@123', gen_salt('bf'));
    
    -- Student Names (30 realistic Indian names)
    v_first_names TEXT[] := ARRAY['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
                                   'Ananya', 'Diya', 'Aadhya', 'Kiara', 'Saanvi', 'Anika', 'Pari', 'Navya', 'Angel', 'Ira',
                                   'Rohan', 'Kabir', 'Reyansh', 'Shaurya', 'Atharv', 'Advait', 'Pranav', 'Dhruv', 'Kian', 'Vedant'];
    v_last_names TEXT[] := ARRAY['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Nair', 'Iyer', 'Gupta', 'Joshi',
                                  'Mehta', 'Desai', 'Kulkarni', 'Rao', 'Pillai', 'Menon', 'Shetty', 'Naidu', 'Das', 'Bose',
                                  'Choudhury', 'Malhotra', 'Kapoor', 'Khanna', 'Agarwal', 'Bansal', 'Chopra', 'Sethi', 'Arora', 'Bhatt'];
    i INTEGER;

BEGIN
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 1: SETUP COMPANY & INFRASTRUCTURE
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    INSERT INTO core.companies (name, code, email, country, subscription_plan)
    VALUES ('Durkkas Academy of Research and Education', 'DARE', 'admin@darecentre.in', 'India', 'ENTERPRISE')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_company_id;

    INSERT INTO core.branches (company_id, name, code, is_head_office, city, state)
    VALUES (v_company_id, 'Chennai Campus', 'CHN-01', TRUE, 'Chennai', 'Tamil Nadu')
    ON CONFLICT (company_id, code) WHERE deleted_at IS NULL DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_branch_id;

    INSERT INTO core.departments (company_id, branch_id, name, code)
    VALUES (v_company_id, v_branch_id, 'Academic Department', 'ACAD')
    ON CONFLICT (company_id, code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_dept_id;

    INSERT INTO core.designations (company_id, title, code, level)
    VALUES (v_company_id, 'Senior Faculty', 'SF', 5)
    ON CONFLICT (company_id, code) DO UPDATE SET title = EXCLUDED.title RETURNING id INTO v_desig_id;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 2: SETUP ROLES
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    INSERT INTO app_auth.roles (name, display_name, role_type, level, is_system_role)
    VALUES ('ACADEMIC_MANAGER', 'Academic Manager', 'PRODUCT', 2, TRUE),
           ('TUTOR', 'Course Tutor', 'PRODUCT', 0, TRUE),
           ('STUDENT', 'Student', 'CUSTOM', 0, TRUE)
    ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name;

    SELECT id INTO v_role_manager_id FROM app_auth.roles WHERE name = 'ACADEMIC_MANAGER';
    SELECT id INTO v_role_tutor_id FROM app_auth.roles WHERE name = 'TUTOR';
    SELECT id INTO v_role_student_id FROM app_auth.roles WHERE name = 'STUDENT';

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 3: CREATE ACADEMIC MANAGER
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active)
    VALUES ('manager@durkkas.com', v_pass_hash, 'Academic', 'Manager', 'Dr. Academic Manager', TRUE)
    ON CONFLICT (email) DO UPDATE SET password_hash = v_pass_hash, is_active = TRUE RETURNING id INTO v_manager_user_id;

    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
    VALUES (v_manager_user_id, v_role_manager_id, v_company_id, v_branch_id)
    ON CONFLICT DO NOTHING;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 4: CREATE 5 TUTORS
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    -- Tutor 1: Rajesh Kumar (Full Stack Development)
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active)
    VALUES ('rajesh.kumar@durkkas.com', v_pass_hash, 'Rajesh', 'Kumar', 'Prof. Rajesh Kumar', TRUE)
    ON CONFLICT (email) DO UPDATE SET password_hash = v_pass_hash RETURNING id INTO v_tutor1_user_id;

    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
    VALUES (v_tutor1_user_id, v_role_tutor_id, v_company_id, v_branch_id) ON CONFLICT DO NOTHING;

    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, is_active)
    VALUES (v_company_id, v_branch_id, v_dept_id, v_desig_id, 'TUT-001', 'Rajesh', 'Kumar', 'rajesh.kumar@durkkas.com', TRUE)
    ON CONFLICT (company_id, employee_code) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO v_tutor1_emp_id;

    -- Tutor 2: Priya Sharma (Data Science)
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active)
    VALUES ('priya.sharma@durkkas.com', v_pass_hash, 'Priya', 'Sharma', 'Dr. Priya Sharma', TRUE)
    ON CONFLICT (email) DO UPDATE SET password_hash = v_pass_hash RETURNING id INTO v_tutor2_user_id;

    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
    VALUES (v_tutor2_user_id, v_role_tutor_id, v_company_id, v_branch_id) ON CONFLICT DO NOTHING;

    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, is_active)
    VALUES (v_company_id, v_branch_id, v_dept_id, v_desig_id, 'TUT-002', 'Priya', 'Sharma', 'priya.sharma@durkkas.com', TRUE)
    ON CONFLICT (company_id, employee_code) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO v_tutor2_emp_id;

    -- Tutor 3: Amit Patel (UI/UX Design)
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active)
    VALUES ('amit.patel@durkkas.com', v_pass_hash, 'Amit', 'Patel', 'Prof. Amit Patel', TRUE)
    ON CONFLICT (email) DO UPDATE SET password_hash = v_pass_hash RETURNING id INTO v_tutor3_user_id;

    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
    VALUES (v_tutor3_user_id, v_role_tutor_id, v_company_id, v_branch_id) ON CONFLICT DO NOTHING;

    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, is_active)
    VALUES (v_company_id, v_branch_id, v_dept_id, v_desig_id, 'TUT-003', 'Amit', 'Patel', 'amit.patel@durkkas.com', TRUE)
    ON CONFLICT (company_id, employee_code) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO v_tutor3_emp_id;

    -- Tutor 4: Sneha Reddy (Mobile Development)
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active)
    VALUES ('sneha.reddy@durkkas.com', v_pass_hash, 'Sneha', 'Reddy', 'Dr. Sneha Reddy', TRUE)
    ON CONFLICT (email) DO UPDATE SET password_hash = v_pass_hash RETURNING id INTO v_tutor4_user_id;

    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
    VALUES (v_tutor4_user_id, v_role_tutor_id, v_company_id, v_branch_id) ON CONFLICT DO NOTHING;

    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, is_active)
    VALUES (v_company_id, v_branch_id, v_dept_id, v_desig_id, 'TUT-004', 'Sneha', 'Reddy', 'sneha.reddy@durkkas.com', TRUE)
    ON CONFLICT (company_id, employee_code) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO v_tutor4_emp_id;

    -- Tutor 5: Vikram Singh (Cloud & DevOps)
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active)
    VALUES ('vikram.singh@durkkas.com', v_pass_hash, 'Vikram', 'Singh', 'Prof. Vikram Singh', TRUE)
    ON CONFLICT (email) DO UPDATE SET password_hash = v_pass_hash RETURNING id INTO v_tutor5_user_id;

    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
    VALUES (v_tutor5_user_id, v_role_tutor_id, v_company_id, v_branch_id) ON CONFLICT DO NOTHING;

    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, is_active)
    VALUES (v_company_id, v_branch_id, v_dept_id, v_desig_id, 'TUT-005', 'Vikram', 'Singh', 'vikram.singh@durkkas.com', TRUE)
    ON CONFLICT (company_id, employee_code) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO v_tutor5_emp_id;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 5: CREATE 30 STUDENTS
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    FOR i IN 1..30 LOOP
        INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active)
        VALUES ('student' || i || '@durkkas.com', v_pass_hash, v_first_names[i], v_last_names[i], 
                v_first_names[i] || ' ' || v_last_names[i], TRUE)
        ON CONFLICT (email) DO UPDATE SET password_hash = v_pass_hash RETURNING id INTO v_student_user_id;

        INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
        VALUES (v_student_user_id, v_role_student_id, v_company_id, v_branch_id) ON CONFLICT DO NOTHING;

        INSERT INTO ems.students (company_id, branch_id, user_id, student_code, first_name, last_name, email, status)
        VALUES (v_company_id, v_branch_id, v_student_user_id, 'DARE-2026-' || LPAD(i::text, 3, '0'), 
                v_first_names[i], v_last_names[i], 'student' || i || '@durkkas.com', 'ACTIVE')
        ON CONFLICT (company_id, student_code) DO UPDATE SET status = 'ACTIVE';
    END LOOP;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 6: CREATE 3 COURSES (Each assigned to different tutors)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    -- Course 1: Full Stack Development (Tutor: Rajesh Kumar)
    INSERT INTO ems.courses (company_id, branch_id, tutor_id, course_code, course_name, course_description, course_category, status, is_published)
    VALUES (v_company_id, v_branch_id, v_tutor1_emp_id, 'FSD-2026', 'Full Stack Development Bootcamp', 
            'Master MERN Stack with real-world projects', 'Technology', 'PUBLISHED', TRUE)
    ON CONFLICT (company_id, course_code) DO UPDATE SET status = 'PUBLISHED' RETURNING id INTO v_course1_id;

    -- Course 2: Data Science & AI (Tutor: Priya Sharma)
    INSERT INTO ems.courses (company_id, branch_id, tutor_id, course_code, course_name, course_description, course_category, status, is_published)
    VALUES (v_company_id, v_branch_id, v_tutor2_emp_id, 'DSAI-2026', 'Data Science & AI Mastery', 
            'Python, ML, Deep Learning & Generative AI', 'Data Science', 'PUBLISHED', TRUE)
    ON CONFLICT (company_id, course_code) DO UPDATE SET status = 'PUBLISHED' RETURNING id INTO v_course2_id;

    -- Course 3: UI/UX Design (Tutor: Amit Patel)
    INSERT INTO ems.courses (company_id, branch_id, tutor_id, course_code, course_name, course_description, course_category, status, is_published)
    VALUES (v_company_id, v_branch_id, v_tutor3_emp_id, 'UIUX-2026', 'Professional UI/UX Design', 
            'Figma, Design Systems & User Research', 'Design', 'PUBLISHED', TRUE)
    ON CONFLICT (company_id, course_code) DO UPDATE SET status = 'PUBLISHED' RETURNING id INTO v_course3_id;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 7: CREATE 3 BATCHES (One per course)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    -- Batch A: Full Stack Development (10 Students: 1-10)
    INSERT INTO ems.batches (company_id, course_id, batch_code, batch_name, status, start_date)
    VALUES (v_company_id, v_course1_id, 'FSD-BATCH-A', 'Full Stack Batch A - Morning', 'ACTIVE', CURRENT_DATE)
    ON CONFLICT (company_id, batch_code) DO UPDATE SET status = 'ACTIVE' RETURNING id INTO v_batch1_id;

    -- Batch B: Data Science (10 Students: 11-20)
    INSERT INTO ems.batches (company_id, course_id, batch_code, batch_name, status, start_date)
    VALUES (v_company_id, v_course2_id, 'DSAI-BATCH-B', 'Data Science Batch B - Afternoon', 'ACTIVE', CURRENT_DATE)
    ON CONFLICT (company_id, batch_code) DO UPDATE SET status = 'ACTIVE' RETURNING id INTO v_batch2_id;

    -- Batch C: UI/UX Design (10 Students: 21-30)
    INSERT INTO ems.batches (company_id, course_id, batch_code, batch_name, status, start_date)
    VALUES (v_company_id, v_course3_id, 'UIUX-BATCH-C', 'UI/UX Batch C - Evening', 'ACTIVE', CURRENT_DATE)
    ON CONFLICT (company_id, batch_code) DO UPDATE SET status = 'ACTIVE' RETURNING id INTO v_batch3_id;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 8: ENROLL STUDENTS IN BATCHES (Batch-wise mapping)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    -- Batch A: Students 1-10
    FOR i IN 1..10 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.student_enrollments (company_id, student_id, course_id, batch_id, enrollment_status)
        VALUES (v_company_id, v_student_id, v_course1_id, v_batch1_id, 'ACTIVE')
        ON CONFLICT (company_id, student_id, course_id, batch_id) DO NOTHING;
    END LOOP;

    -- Batch B: Students 11-20
    FOR i IN 11..20 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.student_enrollments (company_id, student_id, course_id, batch_id, enrollment_status)
        VALUES (v_company_id, v_student_id, v_course2_id, v_batch2_id, 'ACTIVE')
        ON CONFLICT (company_id, student_id, course_id, batch_id) DO NOTHING;
    END LOOP;

    -- Batch C: Students 21-30
    FOR i IN 21..30 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.student_enrollments (company_id, student_id, course_id, batch_id, enrollment_status)
        VALUES (v_company_id, v_student_id, v_course3_id, v_batch3_id, 'ACTIVE')
        ON CONFLICT (company_id, student_id, course_id, batch_id) DO NOTHING;
    END LOOP;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 9: CREATE MODULES & LESSONS (For Course 1)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    FOR i IN 1..5 LOOP
        INSERT INTO ems.course_modules (company_id, course_id, module_name, module_order, is_published)
        VALUES (v_company_id, v_course1_id, 'Module ' || i || ': Advanced Concepts', i, TRUE)
        RETURNING id INTO v_module_id;

        INSERT INTO ems.lessons (company_id, course_id, module_id, lesson_name, lesson_order, duration_minutes, is_published)
        VALUES (v_company_id, v_course1_id, v_module_id, 'Lesson ' || i || '.1: Practical Implementation', 1, 90, TRUE);
    END LOOP;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 10: CREATE QUIZZES WITH MARKS
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    -- Quiz 1: Full Stack Batch A
    INSERT INTO ems.quizzes (company_id, course_id, quiz_title, quiz_description, total_marks, passing_marks, is_active)
    VALUES (v_company_id, v_course1_id, 'React Fundamentals Assessment', 'Test your React knowledge', 100, 40, TRUE)
    RETURNING id INTO v_quiz1_id;

    -- Quiz 2: Data Science Batch B
    INSERT INTO ems.quizzes (company_id, course_id, quiz_title, quiz_description, total_marks, passing_marks, is_active)
    VALUES (v_company_id, v_course2_id, 'Python & ML Basics', 'Python programming and ML concepts', 100, 40, TRUE)
    RETURNING id INTO v_quiz2_id;

    -- Quiz 3: UI/UX Batch C
    INSERT INTO ems.quizzes (company_id, course_id, quiz_title, quiz_description, total_marks, passing_marks, is_active)
    VALUES (v_company_id, v_course3_id, 'Design Principles Quiz', 'UI/UX fundamentals and best practices', 100, 40, TRUE)
    RETURNING id INTO v_quiz3_id;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 11: CREATE QUIZ ATTEMPTS WITH MARKS (Students attempt quizzes)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    -- Batch A students attempt Quiz 1 (Random marks between 45-95)
    FOR i IN 1..10 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.quiz_attempts (company_id, quiz_id, student_id, attempt_number, marks_obtained, percentage, is_passed, status)
        VALUES (v_company_id, v_quiz1_id, v_student_id, 1, 45 + (i * 5), 45 + (i * 5), TRUE, 'COMPLETED');
    END LOOP;

    -- Batch B students attempt Quiz 2
    FOR i IN 11..20 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.quiz_attempts (company_id, quiz_id, student_id, attempt_number, marks_obtained, percentage, is_passed, status)
        VALUES (v_company_id, v_quiz2_id, v_student_id, 1, 50 + ((i-10) * 4), 50 + ((i-10) * 4), TRUE, 'COMPLETED');
    END LOOP;

    -- Batch C students attempt Quiz 3
    FOR i IN 21..30 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.quiz_attempts (company_id, quiz_id, student_id, attempt_number, marks_obtained, percentage, is_passed, status)
        VALUES (v_company_id, v_quiz3_id, v_student_id, 1, 55 + ((i-20) * 4), 55 + ((i-20) * 4), TRUE, 'COMPLETED');
    END LOOP;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 12: CREATE ASSIGNMENTS
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    INSERT INTO ems.assignments (company_id, course_id, tutor_id, assignment_title, assignment_description, max_marks, deadline)
    VALUES (v_company_id, v_course1_id, v_tutor1_emp_id, 'Build a MERN Stack App', 'Create a full-stack application', 100, v_now + interval '7 days')
    RETURNING id INTO v_assign1_id;

    INSERT INTO ems.assignments (company_id, course_id, tutor_id, assignment_title, assignment_description, max_marks, deadline)
    VALUES (v_company_id, v_course2_id, v_tutor2_emp_id, 'ML Model Development', 'Build and train a machine learning model', 100, v_now + interval '7 days')
    RETURNING id INTO v_assign2_id;

    INSERT INTO ems.assignments (company_id, course_id, tutor_id, assignment_title, assignment_description, max_marks, deadline)
    VALUES (v_company_id, v_course3_id, v_tutor3_emp_id, 'Design a Mobile App', 'Create a complete UI/UX design in Figma', 100, v_now + interval '7 days')
    RETURNING id INTO v_assign3_id;

    -- Create some submissions (first 3 students from each batch)
    FOR i IN 1..3 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.assignment_submissions (company_id, assignment_id, student_id, submission_file_url, submission_status)
        VALUES (v_company_id, v_assign1_id, v_student_id, 'https://github.com/student' || i || '/mern-app', 'SUBMITTED');
    END LOOP;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 13: CREATE ATTENDANCE SESSIONS
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    INSERT INTO ems.attendance_sessions (company_id, course_id, batch_id, session_date, session_type, status)
    VALUES (v_company_id, v_course1_id, v_batch1_id, CURRENT_DATE, 'LECTURE', 'COMPLETED')
    RETURNING id INTO v_attend_session1_id;

    INSERT INTO ems.attendance_sessions (company_id, course_id, batch_id, session_date, session_type, status)
    VALUES (v_company_id, v_course2_id, v_batch2_id, CURRENT_DATE, 'LECTURE', 'COMPLETED')
    RETURNING id INTO v_attend_session2_id;

    INSERT INTO ems.attendance_sessions (company_id, course_id, batch_id, session_date, session_type, status)
    VALUES (v_company_id, v_course3_id, v_batch3_id, CURRENT_DATE, 'LECTURE', 'COMPLETED')
    RETURNING id INTO v_attend_session3_id;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 14: MARK ATTENDANCE (80% attendance for each batch)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    -- Batch A: 8 out of 10 present
    FOR i IN 1..8 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.attendance_records (company_id, session_id, student_id, status)
        VALUES (v_company_id, v_attend_session1_id, v_student_id, 'PRESENT');
    END LOOP;

    -- Batch B: 8 out of 10 present
    FOR i IN 11..18 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.attendance_records (company_id, session_id, student_id, status)
        VALUES (v_company_id, v_attend_session2_id, v_student_id, 'PRESENT');
    END LOOP;

    -- Batch C: 8 out of 10 present
    FOR i IN 21..28 LOOP
        SELECT id INTO v_student_id FROM ems.students WHERE company_id = v_company_id AND student_code = 'DARE-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO ems.attendance_records (company_id, session_id, student_id, status)
        VALUES (v_company_id, v_attend_session3_id, v_student_id, 'PRESENT');
    END LOOP;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 15: CREATE LIVE CLASSES
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    INSERT INTO ems.live_classes (company_id, course_id, batch_id, tutor_id, class_title, scheduled_date, start_time, end_time, meeting_link, class_status)
    VALUES (v_company_id, v_course1_id, v_batch1_id, v_tutor1_emp_id, 'React Advanced Patterns', CURRENT_DATE + 1, '10:00:00', '11:30:00', 'https://meet.durkkas.com/fsd-batch-a', 'SCHEDULED');

    INSERT INTO ems.live_classes (company_id, course_id, batch_id, tutor_id, class_title, scheduled_date, start_time, end_time, meeting_link, class_status)
    VALUES (v_company_id, v_course2_id, v_batch2_id, v_tutor2_emp_id, 'Deep Learning Fundamentals', CURRENT_DATE + 1, '14:00:00', '15:30:00', 'https://meet.durkkas.com/dsai-batch-b', 'SCHEDULED');

    INSERT INTO ems.live_classes (company_id, course_id, batch_id, tutor_id, class_title, scheduled_date, start_time, end_time, meeting_link, class_status)
    VALUES (v_company_id, v_course3_id, v_batch3_id, v_tutor3_emp_id, 'Design System Workshop', CURRENT_DATE + 1, '18:00:00', '19:30:00', 'https://meet.durkkas.com/uiux-batch-c', 'SCHEDULED');

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- STEP 16: CREATE COURSE MATERIALS
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    INSERT INTO ems.course_materials (company_id, course_id, material_name, material_type, file_url, is_published)
    VALUES (v_company_id, v_course1_id, 'React Best Practices Guide', 'DOCUMENT', 'https://materials.durkkas.com/react-guide.pdf', TRUE);

    INSERT INTO ems.course_materials (company_id, course_id, material_name, material_type, file_url, is_published)
    VALUES (v_company_id, v_course2_id, 'Python ML Cheat Sheet', 'DOCUMENT', 'https://materials.durkkas.com/ml-cheatsheet.pdf', TRUE);

    INSERT INTO ems.course_materials (company_id, course_id, material_name, material_type, file_url, is_published)
    VALUES (v_company_id, v_course3_id, 'Figma Design Templates', 'DOCUMENT', 'https://materials.durkkas.com/figma-templates.zip', TRUE);

    -- Global Materials
    INSERT INTO ems.course_materials (company_id, material_name, material_type, file_url, is_published)
    VALUES (v_company_id, 'Student Handbook 2026', 'DOCUMENT', 'https://materials.durkkas.com/handbook.pdf', TRUE);

END $$;

COMMIT;
