-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MIGRATION: ADD APPROVAL WORKFLOW TO EMS
-- Durkkas Innovations Private Limited
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Create Approval Status Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END $$;

-- 2. Enhance Courses Table
ALTER TABLE ems.courses 
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES app_auth.users(id);

-- 3. Enhance Lessons Table
ALTER TABLE ems.lessons
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES app_auth.users(id);

-- 4. Enhance Course Materials Table
ALTER TABLE ems.course_materials
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES app_auth.users(id);

-- 5. Enhance Assignments Table
ALTER TABLE ems.assignments
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES app_auth.users(id);

-- 6. Enhance Quizzes Table
ALTER TABLE ems.quizzes
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES app_auth.users(id);

-- 7. Update existing data to APPROVED (so current content doesn't disappear)
UPDATE ems.courses SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING';
UPDATE ems.lessons SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING';
UPDATE ems.course_materials SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING';
UPDATE ems.assignments SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING';
UPDATE ems.quizzes SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING';
