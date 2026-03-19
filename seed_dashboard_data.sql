-- Add dummy enrollment and data for student@aipl.com
-- Durkkas Innovations Private Limited

DO $$
DECLARE
    v_company_id BIGINT;
    v_user_id BIGINT;
    v_student_id BIGINT;
    v_course_id BIGINT;
    v_batch_id BIGINT;
    v_academic_id BIGINT;
BEGIN
    -- 1. Get Company (Try multiple common names from setups)
    SELECT id INTO v_company_id FROM core.companies WHERE name ILIKE '%ALL INDIA%' OR name ILIKE '%AI Power%' LIMIT 1;
    
    -- Fallback to first company if still null (for dev environments)
    IF v_company_id IS NULL THEN
        SELECT id INTO v_company_id FROM core.companies LIMIT 1;
    END IF;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'No company found in core.companies. Please run setup_ems_complete.sql first.';
    END IF;

    -- 2. Get User
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'student@aipl.com' LIMIT 1;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User "student@aipl.com" not found. please run setup_ems_complete.sql first.';
    END IF;

    -- 3. Get or Create Student
    SELECT id INTO v_student_id FROM ems.students WHERE email = 'student@aipl.com' AND company_id = v_company_id LIMIT 1;
    
    IF v_student_id IS NULL THEN
        RAISE NOTICE 'Student record missing, creating for user %...', v_user_id;
        
        -- Get an academic manager to be the creator
        SELECT id INTO v_academic_id FROM app_auth.users WHERE email = 'academic@aipl.com' LIMIT 1;
        
        INSERT INTO ems.students (
            company_id, user_id, student_code, first_name, last_name, email, phone, status, is_active, created_by
        ) VALUES (
            v_company_id, v_user_id, 'STD-2026-001', 'Priya', 'Sharma', 'student@aipl.com', '+91 9876543210', 'ACTIVE', true, v_academic_id
        ) RETURNING id INTO v_student_id;
        
        RAISE NOTICE '✅ Created Student ID: %', v_student_id;
    END IF;

    -- 4. Get or create a course
    SELECT id INTO v_course_id FROM ems.courses WHERE company_id = v_company_id LIMIT 1;
    IF v_course_id IS NULL THEN
        INSERT INTO ems.courses (company_id, course_code, course_name, course_description, course_level, status, is_active)
        VALUES (v_company_id, 'CS-101', 'Intro to Computer Science', 'Learn the basics of coding', 'BEGINNER', 'PUBLISHED', true)
        RETURNING id INTO v_course_id;
    END IF;

    -- 5. Get or create a batch
    SELECT id INTO v_batch_id FROM ems.batches WHERE course_id = v_course_id AND company_id = v_company_id LIMIT 1;
    IF v_batch_id IS NULL THEN
        INSERT INTO ems.batches (company_id, course_id, batch_code, batch_name, status, is_active)
        VALUES (v_company_id, v_course_id, 'BATCH-2026-A', 'Morning Batch', 'ONGOING', true)
        RETURNING id INTO v_batch_id;
    END IF;

    -- 6. Create Enrollment if not exists
    IF NOT EXISTS (SELECT 1 FROM ems.student_enrollments WHERE student_id = v_student_id AND course_id = v_course_id) THEN
        INSERT INTO ems.student_enrollments (company_id, student_id, course_id, batch_id, enrollment_status, completion_percentage)
        VALUES (v_company_id, v_student_id, v_course_id, v_batch_id, 'ACTIVE', 15);
        RAISE NOTICE '✅ Student enrolled in CS-101';
    END IF;

    -- 7. Create a Live Class for TODAY
    INSERT INTO ems.live_classes (
        company_id, course_id, batch_id, class_title, scheduled_date, start_time, end_time, class_status, meeting_link
    ) VALUES (
        v_company_id, v_course_id, v_batch_id, 'Live Q&A Session', CURRENT_DATE, '10:00:00', '11:00:00', 'SCHEDULED', 'https://meet.google.com/abc-defg-hij'
    );
    RAISE NOTICE '✅ Live class scheduled for today';

    -- 8. Create an Attendance Session for TODAY
    INSERT INTO ems.attendance_sessions (
        company_id, course_id, batch_id, session_date, status, session_type, class_mode
    ) VALUES (
        v_company_id, v_course_id, v_batch_id, CURRENT_DATE, 'OPEN', 'LECTURE', 'OFFLINE'
    );
    RAISE NOTICE '✅ Attendance session opened for today';

END $$;

