-- ============================================================================
-- COMPLETE EMS DATABASE SETUP - ALL WORKING CHANGES
-- Run this in Supabase SQL Editor to set up the complete EMS system
-- ============================================================================

-- ============================================================================
-- PART 1: GRANT SCHEMA PERMISSIONS
-- ============================================================================

-- Grant permissions to service_role
GRANT USAGE ON SCHEMA ems TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA ems TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ems TO service_role;

GRANT USAGE ON SCHEMA core TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA core TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA core TO service_role;

GRANT USAGE ON SCHEMA app_auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA app_auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app_auth TO service_role;

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA ems TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA ems TO authenticated;

GRANT USAGE ON SCHEMA core TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA core TO authenticated;

GRANT USAGE ON SCHEMA app_auth TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA app_auth TO authenticated;

SELECT '✅ Schema permissions granted' as status;

-- ============================================================================
-- PART 2: CREATE EMPLOYEE RECORDS (IF NOT EXISTS)
-- ============================================================================

-- Create employees for tutors and managers
INSERT INTO core.employees (
    company_id,
    branch_id,
    employee_code,
    first_name,
    last_name,
    email,
    date_of_joining,
    employment_type,
    is_active,
    created_at
) VALUES 
-- Manager
(13, 46, 'EMP00001', 'Rajesh', 'Kumar', 'rajesh.kumar@durkkas.com', NOW(), 'FULL_TIME', true, NOW()),
-- Tutor 1
(13, 46, 'EMP00002', 'Priya', 'Sharma', 'priya.sharma@durkkas.com', NOW(), 'FULL_TIME', true, NOW()),
-- Tutor 2
(13, 46, 'EMP00003', 'Arun', 'Patel', 'arun.patel@durkkas.com', NOW(), 'FULL_TIME', true, NOW())
ON CONFLICT (company_id, employee_code) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

SELECT '✅ Employee records created/updated' as status;

-- ============================================================================
-- PART 3: VERIFY EMPLOYEE CREATION
-- ============================================================================

SELECT 
    'Employee Verification' as check_type,
    id,
    employee_code,
    first_name,
    last_name,
    email
FROM core.employees 
WHERE company_id = 13
ORDER BY employee_code;

-- ============================================================================
-- PART 4: CREATE TEST DATA - MODULES
-- ============================================================================

DO $$
DECLARE
    v_fs_course_id INT;
    v_py_course_id INT;
    v_ds_course_id INT;
    v_ml_course_id INT;
BEGIN
    -- Get course IDs
    SELECT id INTO v_fs_course_id FROM ems.courses WHERE course_code = 'FS101' AND company_id = 13;
    SELECT id INTO v_py_course_id FROM ems.courses WHERE course_code = 'PY101' AND company_id = 13;
    SELECT id INTO v_ds_course_id FROM ems.courses WHERE course_code = 'DS101' AND company_id = 13;
    SELECT id INTO v_ml_course_id FROM ems.courses WHERE course_code = 'ML101' AND company_id = 13;

    -- Create modules for Full Stack Course
    IF v_fs_course_id IS NOT NULL THEN
        INSERT INTO ems.course_modules (company_id, course_id, module_name, module_description, sequence_order, is_published, is_active, created_at)
        VALUES 
        (13, v_fs_course_id, 'HTML & CSS Fundamentals', 'Learn the building blocks of web development', 1, true, true, NOW()),
        (13, v_fs_course_id, 'JavaScript Basics', 'Master JavaScript fundamentals and ES6+', 2, true, true, NOW()),
        (13, v_fs_course_id, 'React Framework', 'Build modern UIs with React', 3, true, true, NOW()),
        (13, v_fs_course_id, 'Backend with Node.js', 'Create APIs and server-side applications', 4, true, true, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- Create modules for Python Course
    IF v_py_course_id IS NOT NULL THEN
        INSERT INTO ems.course_modules (company_id, course_id, module_name, module_description, sequence_order, is_published, is_active, created_at)
        VALUES 
        (13, v_py_course_id, 'Python Basics', 'Variables, data types, and control flow', 1, true, true, NOW()),
        (13, v_py_course_id, 'Object-Oriented Programming', 'Classes, objects, and inheritance', 2, true, true, NOW()),
        (13, v_py_course_id, 'Data Structures', 'Lists, dictionaries, sets, and tuples', 3, true, true, NOW()),
        (13, v_py_course_id, 'File Handling & APIs', 'Working with files and REST APIs', 4, true, true, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- Create modules for Data Science Course
    IF v_ds_course_id IS NOT NULL THEN
        INSERT INTO ems.course_modules (company_id, course_id, module_name, module_description, sequence_order, is_published, is_active, created_at)
        VALUES 
        (13, v_ds_course_id, 'Introduction to Data Science', 'Overview and tools', 1, true, true, NOW()),
        (13, v_ds_course_id, 'Data Analysis with Pandas', 'Data manipulation and analysis', 2, true, true, NOW()),
        (13, v_ds_course_id, 'Data Visualization', 'Matplotlib and Seaborn', 3, true, true, NOW()),
        (13, v_ds_course_id, 'Statistical Analysis', 'Hypothesis testing and inference', 4, true, true, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- Create modules for Machine Learning Course
    IF v_ml_course_id IS NOT NULL THEN
        INSERT INTO ems.course_modules (company_id, course_id, module_name, module_description, sequence_order, is_published, is_active, created_at)
        VALUES 
        (13, v_ml_course_id, 'ML Fundamentals', 'Introduction to machine learning concepts', 1, true, true, NOW()),
        (13, v_ml_course_id, 'Supervised Learning', 'Regression and classification algorithms', 2, true, true, NOW()),
        (13, v_ml_course_id, 'Unsupervised Learning', 'Clustering and dimensionality reduction', 3, true, true, NOW()),
        (13, v_ml_course_id, 'Neural Networks', 'Deep learning basics', 4, true, true, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE '✅ Modules created for all courses';
END $$;

-- ============================================================================
-- PART 5: CREATE TEST DATA - LESSONS
-- ============================================================================

DO $$
DECLARE
    v_fs_course_id INT;
    v_module_id INT;
BEGIN
    SELECT id INTO v_fs_course_id FROM ems.courses WHERE course_code = 'FS101' AND company_id = 13;
    
    IF v_fs_course_id IS NOT NULL THEN
        -- Get Module 1 ID
        SELECT id INTO v_module_id FROM ems.course_modules 
        WHERE course_id = v_fs_course_id AND module_name = 'HTML & CSS Fundamentals';
        
        IF v_module_id IS NOT NULL THEN
            INSERT INTO ems.lessons (company_id, course_id, module_id, lesson_title, lesson_type, duration_minutes, sequence_order, is_published, is_active, created_at)
            VALUES 
            (13, v_fs_course_id, v_module_id, 'Introduction to HTML', 'VIDEO', 45, 1, true, true, NOW()),
            (13, v_fs_course_id, v_module_id, 'HTML Tags and Elements', 'VIDEO', 60, 2, true, true, NOW()),
            (13, v_fs_course_id, v_module_id, 'CSS Basics', 'VIDEO', 50, 3, true, true, NOW()),
            (13, v_fs_course_id, v_module_id, 'CSS Flexbox and Grid', 'VIDEO', 70, 4, true, true, NOW())
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Get Module 2 ID
        SELECT id INTO v_module_id FROM ems.course_modules 
        WHERE course_id = v_fs_course_id AND module_name = 'JavaScript Basics';
        
        IF v_module_id IS NOT NULL THEN
            INSERT INTO ems.lessons (company_id, course_id, module_id, lesson_title, lesson_type, duration_minutes, sequence_order, is_published, is_active, created_at)
            VALUES 
            (13, v_fs_course_id, v_module_id, 'JavaScript Variables and Data Types', 'VIDEO', 55, 1, true, true, NOW()),
            (13, v_fs_course_id, v_module_id, 'Functions and Scope', 'VIDEO', 65, 2, true, true, NOW()),
            (13, v_fs_course_id, v_module_id, 'Arrays and Objects', 'VIDEO', 60, 3, true, true, NOW()),
            (13, v_fs_course_id, v_module_id, 'ES6 Features', 'VIDEO', 70, 4, true, true, NOW())
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    RAISE NOTICE '✅ Lessons created';
END $$;

-- ============================================================================
-- PART 6: CREATE TEST DATA - ASSIGNMENTS
-- ============================================================================

DO $$
DECLARE
    v_fs_course_id INT;
    v_ds_course_id INT;
    v_priya_employee_id INT;
    v_arun_employee_id INT;
BEGIN
    -- Get IDs
    SELECT id INTO v_fs_course_id FROM ems.courses WHERE course_code = 'FS101' AND company_id = 13;
    SELECT id INTO v_ds_course_id FROM ems.courses WHERE course_code = 'DS101' AND company_id = 13;
    SELECT id INTO v_priya_employee_id FROM core.employees WHERE email = 'priya.sharma@durkkas.com' AND company_id = 13;
    SELECT id INTO v_arun_employee_id FROM core.employees WHERE email = 'arun.patel@durkkas.com' AND company_id = 13;

    -- Create assignments for Full Stack
    IF v_fs_course_id IS NOT NULL AND v_priya_employee_id IS NOT NULL THEN
        INSERT INTO ems.assignments (
            company_id, course_id, tutor_id, assignment_title, assignment_description,
            max_marks, deadline, is_active, created_at
        ) VALUES 
        (13, v_fs_course_id, v_priya_employee_id, 'Build a Portfolio Website', 
         'Create a responsive portfolio website using HTML, CSS, and JavaScript',
         100, NOW() + INTERVAL '7 days', true, NOW()),
        (13, v_fs_course_id, v_priya_employee_id, 'JavaScript Calculator', 
         'Build a functional calculator using vanilla JavaScript',
         50, NOW() + INTERVAL '5 days', true, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Create assignments for Data Science
    IF v_ds_course_id IS NOT NULL AND v_arun_employee_id IS NOT NULL THEN
        INSERT INTO ems.assignments (
            company_id, course_id, tutor_id, assignment_title, assignment_description,
            max_marks, deadline, is_active, created_at
        ) VALUES 
        (13, v_ds_course_id, v_arun_employee_id, 'Data Analysis Project', 
         'Analyze a dataset using Pandas and create visualizations',
         100, NOW() + INTERVAL '10 days', true, NOW()),
        (13, v_ds_course_id, v_arun_employee_id, 'Statistical Report', 
         'Perform statistical analysis and write a report',
         75, NOW() + INTERVAL '8 days', true, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE '✅ Assignments created';
END $$;

-- ============================================================================
-- PART 7: CREATE TEST DATA - SUBMISSIONS
-- ============================================================================

DO $$
DECLARE
    v_assignment_id INT;
    v_vikram_student_id INT;
    v_sneha_student_id INT;
    v_arjun_student_id INT;
BEGIN
    -- Get student IDs
    SELECT id INTO v_vikram_student_id FROM ems.students WHERE email = 'vikram.reddy@student.durkkas.com' AND company_id = 13;
    SELECT id INTO v_sneha_student_id FROM ems.students WHERE email = 'sneha.iyer@student.durkkas.com' AND company_id = 13;
    SELECT id INTO v_arjun_student_id FROM ems.students WHERE email = 'arjun.nair@student.durkkas.com' AND company_id = 13;

    -- Get assignment ID for Portfolio Website
    SELECT id INTO v_assignment_id FROM ems.assignments 
    WHERE assignment_title = 'Build a Portfolio Website' AND company_id = 13
    LIMIT 1;
    
    IF v_assignment_id IS NOT NULL AND v_vikram_student_id IS NOT NULL THEN
        INSERT INTO ems.assignment_submissions (
            company_id, assignment_id, student_id, submission_text, submission_url,
            submission_status, submitted_at, created_at
        ) VALUES 
        (13, v_assignment_id, v_vikram_student_id, 
         'I have completed the portfolio website with all required features.',
         'https://github.com/vikram/portfolio',
         'SUBMITTED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF v_assignment_id IS NOT NULL AND v_arjun_student_id IS NOT NULL THEN
        INSERT INTO ems.assignment_submissions (
            company_id, assignment_id, student_id, submission_text, submission_url,
            submission_status, submitted_at, created_at
        ) VALUES 
        (13, v_assignment_id, v_arjun_student_id, 
         'Portfolio website completed with responsive design.',
         'https://github.com/arjun/portfolio',
         'SUBMITTED', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Get assignment ID for Data Analysis
    SELECT id INTO v_assignment_id FROM ems.assignments 
    WHERE assignment_title = 'Data Analysis Project' AND company_id = 13
    LIMIT 1;
    
    IF v_assignment_id IS NOT NULL AND v_sneha_student_id IS NOT NULL THEN
        INSERT INTO ems.assignment_submissions (
            company_id, assignment_id, student_id, submission_text, submission_url,
            submission_status, submitted_at, created_at
        ) VALUES 
        (13, v_assignment_id, v_sneha_student_id, 
         'Completed data analysis with visualizations and insights.',
         'https://github.com/sneha/data-analysis',
         'SUBMITTED', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours')
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE '✅ Submissions created';
END $$;

-- ============================================================================
-- PART 8: VERIFICATION QUERIES
-- ============================================================================

SELECT '📊 MODULES CREATED:' as status;
SELECT 
    c.course_name,
    c.course_code,
    COUNT(m.id) as module_count
FROM ems.courses c
LEFT JOIN ems.course_modules m ON c.id = m.course_id
WHERE c.company_id = 13
GROUP BY c.id, c.course_name, c.course_code
ORDER BY c.course_code;

SELECT '📚 LESSONS CREATED:' as status;
SELECT 
    c.course_name,
    COUNT(l.id) as lesson_count
FROM ems.courses c
LEFT JOIN ems.lessons l ON c.id = l.course_id
WHERE c.company_id = 13
GROUP BY c.id, c.course_name
ORDER BY c.course_name;

SELECT '📝 ASSIGNMENTS CREATED:' as status;
SELECT 
    c.course_name,
    a.assignment_title,
    a.max_marks,
    a.deadline
FROM ems.assignments a
JOIN ems.courses c ON a.course_id = c.id
WHERE a.company_id = 13
ORDER BY c.course_name, a.assignment_title;

SELECT '✍️ SUBMISSIONS CREATED:' as status;
SELECT 
    s.first_name || ' ' || s.last_name as student_name,
    a.assignment_title,
    sub.submission_status,
    sub.submitted_at
FROM ems.assignment_submissions sub
JOIN ems.students s ON sub.student_id = s.id
JOIN ems.assignments a ON sub.assignment_id = a.id
WHERE sub.company_id = 13
ORDER BY sub.submitted_at DESC;

SELECT '✅ COMPLETE EMS SETUP FINISHED!' as final_status;

-- ============================================================================
-- SUMMARY OF WHAT THIS SCRIPT DOES:
-- ============================================================================
-- 1. Grants all necessary schema permissions
-- 2. Creates employee records for tutors and managers
-- 3. Creates 16 course modules (4 per course)
-- 4. Creates 8 lessons for Full Stack course
-- 5. Creates 4 assignments (2 per tutor)
-- 6. Creates 3 student submissions
-- 7. Verifies all data was created successfully
-- ============================================================================
