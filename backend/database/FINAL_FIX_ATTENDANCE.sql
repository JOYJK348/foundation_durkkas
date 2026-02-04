-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FINAL FIX: ATTENDANCE SCHEMA STANDARDIZATION
-- Run this ONCE to fix all attendance-related schema issues
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- STEP 1: Drop existing tables (if they exist)
DROP TABLE IF EXISTS ems.attendance_records CASCADE;
DROP TABLE IF EXISTS ems.attendance_sessions CASCADE;

-- STEP 2: Recreate attendance_sessions with correct structure
CREATE TABLE ems.attendance_sessions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES ems.courses(id) ON DELETE CASCADE,
    live_class_id BIGINT REFERENCES ems.live_classes(id) ON DELETE CASCADE,
    batch_id BIGINT REFERENCES ems.batches(id) ON DELETE CASCADE,
    
    session_date DATE DEFAULT CURRENT_DATE,
    session_type VARCHAR(50) DEFAULT 'LECTURE',
    
    session_opened_by BIGINT,
    session_opened_at TIMESTAMPTZ DEFAULT NOW(),
    session_closed_at TIMESTAMPTZ,
    
    is_checkout_active BOOLEAN DEFAULT FALSE,
    checkout_opened_at TIMESTAMPTZ,
    
    status VARCHAR(50) DEFAULT 'OPEN',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Recreate attendance_records with correct structure
CREATE TABLE ems.attendance_records (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    session_id BIGINT NOT NULL REFERENCES ems.attendance_sessions(id) ON DELETE CASCADE,
    
    user_id BIGINT REFERENCES app_auth.users(id),
    student_id BIGINT REFERENCES ems.students(id) ON DELETE CASCADE,
    user_type VARCHAR(50),
    
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    
    location_lat DECIMAL(10, 8),
    location_long DECIMAL(11, 8),
    ip_address INET,
    
    status VARCHAR(50),
    duration_minutes INTEGER,
    
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_company ON ems.attendance_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_course ON ems.attendance_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_batch ON ems.attendance_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON ems.attendance_sessions(session_date);

CREATE INDEX IF NOT EXISTS idx_attendance_records_company ON ems.attendance_records(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON ems.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON ems.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON ems.attendance_records(status);

COMMIT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
    RAISE NOTICE '✅ Attendance Schema Fixed Successfully!';
    RAISE NOTICE '📋 Tables Created:';
    RAISE NOTICE '   - ems.attendance_sessions (with course_id, session_date, session_type)';
    RAISE NOTICE '   - ems.attendance_records (with session_id, student_id, status)';
    RAISE NOTICE '🔍 Column Names Standardized:';
    RAISE NOTICE '   - attendance_session_id → session_id';
    RAISE NOTICE '   - attendance_status → status';
    RAISE NOTICE '   - user_id is now NULLABLE';
    RAISE NOTICE '   - student_id added for direct student linking';
END $$;
