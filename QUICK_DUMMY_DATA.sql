-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- EMS DUMMY DATA - COPY & PASTE THIS INTO SUPABASE SQL EDITOR
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ✅ READY TO USE! Just copy-paste and run!
-- Using: Durkkas Academy (company_id = 13)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INSERT COURSES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO ems.courses (
    company_id, course_code, course_name, course_description, 
    duration_hours, status, is_published, course_category, course_level, 
    total_lessons, created_at
) VALUES
(13, 'FS-2026-01', 'Full Stack Web Development Bootcamp', 
'Master modern web development with React, Node.js, and PostgreSQL. Build real-world projects and deploy to production.',
640, 'PUBLISHED', true, 'Programming', 'INTERMEDIATE', 64, NOW()),

(13, 'DS-2026-01', 'Data Science & Machine Learning', 
'Learn Python, Pandas, NumPy, Scikit-learn, and TensorFlow. Work on real datasets and build ML models.',
800, 'PUBLISHED', true, 'Data Science', 'ADVANCED', 80, NOW()),

(13, 'DM-2026-01', 'Digital Marketing Masterclass', 
'Complete digital marketing course covering SEO, SEM, Social Media Marketing, Email Marketing, and Analytics.',
480, 'PUBLISHED', true, 'Marketing', 'BEGINNER', 48, NOW());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INSERT BATCHES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO ems.batches (
    company_id, batch_code, batch_name, course_id,
    start_date, end_date, max_students, current_strength, status, created_at
) VALUES
(13, 'FS-MORN-FEB26', 'Full Stack Morning Batch', 
(SELECT id FROM ems.courses WHERE course_code = 'FS-2026-01' AND company_id = 13),
'2026-02-10', '2026-06-10', 30, 0, 'ACTIVE', NOW()),

(13, 'DS-WKND-FEB26', 'Data Science Weekend Batch', 
(SELECT id FROM ems.courses WHERE course_code = 'DS-2026-01' AND company_id = 13),
'2026-02-08', '2026-07-08', 25, 0, 'ACTIVE', NOW());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INSERT STUDENTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO ems.students (
    company_id, student_code, first_name, last_name, 
    email, phone, gender, date_of_birth, status, created_at
) VALUES
(13, 'STU-2026-001', 'Rajesh', 'Kumar', 'rajesh.kumar@gmail.com', '+91 9876543210', 'MALE', '2000-05-15', 'ACTIVE', NOW()),
(13, 'STU-2026-002', 'Priya', 'Sharma', 'priya.sharma@gmail.com', '+91 9876543211', 'FEMALE', '2001-08-22', 'ACTIVE', NOW()),
(13, 'STU-2026-003', 'Amit', 'Patel', 'amit.patel@gmail.com', '+91 9876543212', 'MALE', '1999-12-10', 'ACTIVE', NOW()),
(13, 'STU-2026-004', 'Sneha', 'Reddy', 'sneha.reddy@gmail.com', '+91 9876543213', 'FEMALE', '2002-03-18', 'ACTIVE', NOW()),
(13, 'STU-2026-005', 'Vikram', 'Singh', 'vikram.singh@gmail.com', '+91 9876543214', 'MALE', '2000-11-25', 'ACTIVE', NOW());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INSERT ENROLLMENTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO ems.student_enrollments (
    company_id, student_id, course_id, batch_id,
    enrollment_date, enrollment_status, payment_status, created_at
)
SELECT 
    13, s.id,
    (SELECT id FROM ems.courses WHERE course_code = 'FS-2026-01' AND company_id = 13),
    (SELECT id FROM ems.batches WHERE batch_code = 'FS-MORN-FEB26' AND company_id = 13),
    '2026-02-01', 'ACTIVE', 'PAID', NOW()
FROM ems.students s
WHERE s.student_code IN ('STU-2026-001', 'STU-2026-002', 'STU-2026-003')
AND s.company_id = 13;

-- Update batch strength
UPDATE ems.batches SET current_strength = 3 WHERE batch_code = 'FS-MORN-FEB26' AND company_id = 13;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'Courses' as entity, COUNT(*) as count FROM ems.courses WHERE company_id = 13 AND deleted_at IS NULL
UNION ALL
SELECT 'Batches', COUNT(*) FROM ems.batches WHERE company_id = 13 AND deleted_at IS NULL
UNION ALL
SELECT 'Students', COUNT(*) FROM ems.students WHERE company_id = 13 AND deleted_at IS NULL
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM ems.student_enrollments WHERE company_id = 13 AND deleted_at IS NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ✅ EXPECTED RESULTS:
-- Courses: 3
-- Batches: 2
-- Students: 5
-- Enrollments: 3
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
