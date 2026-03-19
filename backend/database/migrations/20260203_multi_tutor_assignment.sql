-- Multi-Tutor Assignment for Courses
-- This allows multiple tutors to be assigned to a single course

-- Create junction table for course-tutor mapping
CREATE TABLE IF NOT EXISTS ems.course_tutors (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES ems.courses(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES core.employees(id) ON DELETE CASCADE,
    
    -- Role of tutor in this course
    tutor_role VARCHAR(50) DEFAULT 'INSTRUCTOR', -- INSTRUCTOR, ASSISTANT, COORDINATOR
    is_primary BOOLEAN DEFAULT FALSE, -- One primary tutor per course
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    
    -- Ensure unique course-tutor combination
    UNIQUE(course_id, tutor_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_tutors_course ON ems.course_tutors(course_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_course_tutors_tutor ON ems.course_tutors(tutor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_course_tutors_company ON ems.course_tutors(company_id) WHERE deleted_at IS NULL;

-- Ensure only one primary tutor per course (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_tutors_primary_unique 
    ON ems.course_tutors(course_id) 
    WHERE deleted_at IS NULL AND is_primary = TRUE;

-- Add comment
COMMENT ON TABLE ems.course_tutors IS 'Junction table for assigning multiple tutors to courses';
COMMENT ON COLUMN ems.course_tutors.is_primary IS 'Indicates the primary/lead tutor for the course';
COMMENT ON COLUMN ems.course_tutors.tutor_role IS 'Role: INSTRUCTOR (main teacher), ASSISTANT (helper), COORDINATOR (admin)';

-- Sample data migration (optional - migrate existing single tutor to junction table)
-- INSERT INTO ems.course_tutors (company_id, course_id, tutor_id, is_primary, created_at)
-- SELECT company_id, id, tutor_id, TRUE, NOW()
-- FROM ems.courses
-- WHERE tutor_id IS NOT NULL
-- ON CONFLICT (course_id, tutor_id) DO NOTHING;

-- Note: We'll keep the tutor_id column in courses table for backward compatibility
-- but the course_tutors table will be the source of truth for multi-tutor assignments
