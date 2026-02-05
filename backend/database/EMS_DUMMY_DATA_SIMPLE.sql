-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COMPLETE EMS DUMMY DATA FOR MANUAL TESTING
-- ⚠️ IMPORTANT: Change the company_id and branch_id below to match YOUR database!
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 🔧 STEP 1: Find your company_id by running this query first:
-- SELECT id, company_name FROM core.companies WHERE company_name LIKE '%Dare%';

-- 🔧 STEP 2: Change these values to match your database:
\set COMPANY_ID 2
\set BRANCH_ID 1

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. COURSES (5 Realistic Courses)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO ems.courses (
    company_id, branch_id, course_code, course_name, course_description, 
    duration_hours, status, is_published, course_category, course_level, 
    total_lessons, created_at
) VALUES
(:COMPANY_ID, :BRANCH_ID, 'FS-2026-01', 'Full Stack Web Development Bootcamp', 
'Master modern web development with React, Node.js, and PostgreSQL. Build real-world projects and deploy to production.',
640, 'PUBLISHED', true, 'Programming', 'INTERMEDIATE', 64, NOW()),

(:COMPANY_ID, :BRANCH_ID, 'DS-2026-01', 'Data Science & Machine Learning', 
'Learn Python, Pandas, NumPy, Scikit-learn, and TensorFlow. Work on real datasets and build ML models.',
800, 'PUBLISHED', true, 'Data Science', 'ADVANCED', 80, NOW()),

(:COMPANY_ID, :BRANCH_ID, 'DM-2026-01', 'Digital Marketing Masterclass', 
'Complete digital marketing course covering SEO, SEM, Social Media Marketing, Email Marketing, and Analytics.',
480, 'PUBLISHED', true, 'Marketing', 'BEGINNER', 48, NOW()),

(:COMPANY_ID, :BRANCH_ID, 'MA-2026-01', 'React Native Mobile App Development', 
'Build cross-platform mobile apps for iOS and Android using React Native and Expo.',
560, 'PUBLISHED', true, 'Programming', 'INTERMEDIATE', 56, NOW()),

(:COMPANY_ID, :BRANCH_ID, 'UX-2026-01', 'UI/UX Design Fundamentals', 
'Learn user research, wireframing, prototyping, and design systems using Figma and Adobe XD.',
400, 'DRAFT', false, 'Design', 'BEGINNER', 40, NOW());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. BATCHES (6 Batches with Different Schedules)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO ems.batches (
    company_id, branch_id, batch_code, batch_name, course_id,
    start_date, end_date, max_students, current_strength, status, created_at
) VALUES
(:COMPANY_ID, :BRANCH_ID, 'FS-MORN-FEB26', 'Full Stack Morning Batch', 
(SELECT id FROM ems.courses WHERE course_code = 'FS-2026-01' AND company_id = :COMPANY_ID),
'2026-02-10', '2026-06-10', 30, 0, 'ACTIVE', NOW()),

(:COMPANY_ID, :BRANCH_ID, 'FS-EVE-FEB26', 'Full Stack Evening Batch', 
(SELECT id FROM ems.courses WHERE course_code = 'FS-2026-01' AND company_id = :COMPANY_ID),
'2026-02-15', '2026-06-15', 30, 0, 'ACTIVE', NOW()),

(:COMPANY_ID, :BRANCH_ID, 'DS-WKND-FEB26', 'Data Science Weekend Batch', 
(SELECT id FROM ems.courses WHERE course_code = 'DS-2026-01' AND company_id = :COMPANY_ID),
'2026-02-08', '2026-07-08', 25, 0, 'ACTIVE', NOW()),

(:COMPANY_ID, :BRANCH_ID, 'DM-FAST-FEB26', 'Digital Marketing Fast Track', 
(SELECT id FROM ems.courses WHERE course_code = 'DM-2026-01' AND company_id = :COMPANY_ID),
'2026-02-12', '2026-05-12', 40, 0, 'ACTIVE', NOW()),

(:COMPANY_ID, :BRANCH_ID, 'MA-MORN-MAR26', 'Mobile App Morning Batch', 
(SELECT id FROM ems.courses WHERE course_code = 'MA-2026-01' AND company_id = :COMPANY_ID),
'2026-03-01', '2026-06-15', 25, 0, 'ACTIVE', NOW()),

(:COMPANY_ID, :BRANCH_ID, 'UX-EVE-MAR26', 'UI/UX Evening Batch', 
(SELECT id FROM ems.courses WHERE course_code = 'UX-2026-01' AND company_id = :COMPANY_ID),
'2026-03-10', '2026-05-20', 20, 0, 'ACTIVE', NOW());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. STUDENTS (20 Students with Realistic Data)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO ems.students (
    company_id, branch_id, student_code, first_name, last_name, 
    email, phone, gender, date_of_birth, status, created_at
) VALUES
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-001', 'Rajesh', 'Kumar', 'rajesh.kumar@gmail.com', '+91 9876543210', 'MALE', '2000-05-15', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-002', 'Priya', 'Sharma', 'priya.sharma@gmail.com', '+91 9876543211', 'FEMALE', '2001-08-22', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-003', 'Amit', 'Patel', 'amit.patel@gmail.com', '+91 9876543212', 'MALE', '1999-12-10', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-004', 'Sneha', 'Reddy', 'sneha.reddy@gmail.com', '+91 9876543213', 'FEMALE', '2002-03-18', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-005', 'Vikram', 'Singh', 'vikram.singh@gmail.com', '+91 9876543214', 'MALE', '2000-11-25', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-006', 'Ananya', 'Iyer', 'ananya.iyer@gmail.com', '+91 9876543215', 'FEMALE', '2001-06-30', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-007', 'Karthik', 'Menon', 'karthik.menon@gmail.com', '+91 9876543216', 'MALE', '1998-09-14', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-008', 'Divya', 'Nair', 'divya.nair@gmail.com', '+91 9876543217', 'FEMALE', '2002-01-20', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-009', 'Arjun', 'Desai', 'arjun.desai@gmail.com', '+91 9876543218', 'MALE', '2000-07-08', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-010', 'Meera', 'Joshi', 'meera.joshi@gmail.com', '+91 9876543219', 'FEMALE', '2001-04-12', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-011', 'Rahul', 'Verma', 'rahul.verma@gmail.com', '+91 9876543220', 'MALE', '1999-10-05', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-012', 'Pooja', 'Gupta', 'pooja.gupta@gmail.com', '+91 9876543221', 'FEMALE', '2002-02-28', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-013', 'Sanjay', 'Rao', 'sanjay.rao@gmail.com', '+91 9876543222', 'MALE', '2000-08-16', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-014', 'Kavya', 'Pillai', 'kavya.pillai@gmail.com', '+91 9876543223', 'FEMALE', '2001-12-03', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-015', 'Aditya', 'Chopra', 'aditya.chopra@gmail.com', '+91 9876543224', 'MALE', '1999-05-21', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-016', 'Nisha', 'Kapoor', 'nisha.kapoor@gmail.com', '+91 9876543225', 'FEMALE', '2002-09-07', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-017', 'Rohan', 'Malhotra', 'rohan.malhotra@gmail.com', '+91 9876543226', 'MALE', '2000-03-14', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-018', 'Shreya', 'Bansal', 'shreya.bansal@gmail.com', '+91 9876543227', 'FEMALE', '2001-11-19', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-019', 'Varun', 'Agarwal', 'varun.agarwal@gmail.com', '+91 9876543228', 'MALE', '1999-07-26', 'ACTIVE', NOW()),
(:COMPANY_ID, :BRANCH_ID, 'STU-2026-020', 'Tanvi', 'Shah', 'tanvi.shah@gmail.com', '+91 9876543229', 'FEMALE', '2002-04-09', 'ACTIVE', NOW());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. ENROLLMENTS (Assign Students to Courses & Batches)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Full Stack Morning Batch (8 students)
INSERT INTO ems.student_enrollments (
    company_id, branch_id, student_id, course_id, batch_id,
    enrollment_date, enrollment_status, payment_status, created_at
)
SELECT 
    :COMPANY_ID, :BRANCH_ID, s.id,
    (SELECT id FROM ems.courses WHERE course_code = 'FS-2026-01' AND company_id = :COMPANY_ID),
    (SELECT id FROM ems.batches WHERE batch_code = 'FS-MORN-FEB26' AND company_id = :COMPANY_ID),
    '2026-02-01', 'ACTIVE', 'PAID', NOW()
FROM ems.students s
WHERE s.student_code IN ('STU-2026-001', 'STU-2026-002', 'STU-2026-003', 'STU-2026-004', 'STU-2026-005', 'STU-2026-006', 'STU-2026-007', 'STU-2026-008')
AND s.company_id = :COMPANY_ID;

-- Full Stack Evening Batch (6 students)
INSERT INTO ems.student_enrollments (
    company_id, branch_id, student_id, course_id, batch_id,
    enrollment_date, enrollment_status, payment_status, created_at
)
SELECT 
    :COMPANY_ID, :BRANCH_ID, s.id,
    (SELECT id FROM ems.courses WHERE course_code = 'FS-2026-01' AND company_id = :COMPANY_ID),
    (SELECT id FROM ems.batches WHERE batch_code = 'FS-EVE-FEB26' AND company_id = :COMPANY_ID),
    '2026-02-05', 'ACTIVE', 'PAID', NOW()
FROM ems.students s
WHERE s.student_code IN ('STU-2026-009', 'STU-2026-010', 'STU-2026-011', 'STU-2026-012', 'STU-2026-013', 'STU-2026-014')
AND s.company_id = :COMPANY_ID;

-- Data Science Weekend Batch (4 students)
INSERT INTO ems.student_enrollments (
    company_id, branch_id, student_id, course_id, batch_id,
    enrollment_date, enrollment_status, payment_status, created_at
)
SELECT 
    :COMPANY_ID, :BRANCH_ID, s.id,
    (SELECT id FROM ems.courses WHERE course_code = 'DS-2026-01' AND company_id = :COMPANY_ID),
    (SELECT id FROM ems.batches WHERE batch_code = 'DS-WKND-FEB26' AND company_id = :COMPANY_ID),
    '2026-02-03', 'ACTIVE', 'PARTIAL', NOW()
FROM ems.students s
WHERE s.student_code IN ('STU-2026-015', 'STU-2026-016', 'STU-2026-017', 'STU-2026-018')
AND s.company_id = :COMPANY_ID;

-- Digital Marketing Fast Track (2 students)
INSERT INTO ems.student_enrollments (
    company_id, branch_id, student_id, course_id, batch_id,
    enrollment_date, enrollment_status, payment_status, created_at
)
SELECT 
    :COMPANY_ID, :BRANCH_ID, s.id,
    (SELECT id FROM ems.courses WHERE course_code = 'DM-2026-01' AND company_id = :COMPANY_ID),
    (SELECT id FROM ems.batches WHERE batch_code = 'DM-FAST-FEB26' AND company_id = :COMPANY_ID),
    '2026-02-07', 'ACTIVE', 'PAID', NOW()
FROM ems.students s
WHERE s.student_code IN ('STU-2026-019', 'STU-2026-020')
AND s.company_id = :COMPANY_ID;

-- Update batch current_strength
UPDATE ems.batches SET current_strength = 8 WHERE batch_code = 'FS-MORN-FEB26' AND company_id = :COMPANY_ID;
UPDATE ems.batches SET current_strength = 6 WHERE batch_code = 'FS-EVE-FEB26' AND company_id = :COMPANY_ID;
UPDATE ems.batches SET current_strength = 4 WHERE batch_code = 'DS-WKND-FEB26' AND company_id = :COMPANY_ID;
UPDATE ems.batches SET current_strength = 2 WHERE batch_code = 'DM-FAST-FEB26' AND company_id = :COMPANY_ID;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION QUERY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'Courses' as entity, COUNT(*) as count FROM ems.courses WHERE company_id = :COMPANY_ID AND deleted_at IS NULL
UNION ALL
SELECT 'Batches', COUNT(*) FROM ems.batches WHERE company_id = :COMPANY_ID AND deleted_at IS NULL
UNION ALL
SELECT 'Students', COUNT(*) FROM ems.students WHERE company_id = :COMPANY_ID AND deleted_at IS NULL
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM ems.student_enrollments WHERE company_id = :COMPANY_ID AND deleted_at IS NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ✅ DONE! You should see:
-- - 5 Courses
-- - 6 Batches
-- - 20 Students
-- - 20 Enrollments
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
