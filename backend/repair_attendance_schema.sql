-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ATTENDANCE SCHEMA REPAIR SCRIPT v2
-- This script safely creates missing tables and adds missing columns
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Create ems.attendance_sessions if missing (Safety)
CREATE TABLE IF NOT EXISTS ems.attendance_sessions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES ems.courses(id) ON DELETE CASCADE,
    batch_id BIGINT REFERENCES ems.batches(id) ON DELETE CASCADE,
    session_date DATE DEFAULT CURRENT_DATE,
    session_type VARCHAR(50) DEFAULT 'LECTURE',
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create ems.attendance_face_verifications if missing
CREATE TABLE IF NOT EXISTS ems.attendance_face_verifications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    session_id BIGINT NOT NULL REFERENCES ems.attendance_sessions(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES ems.students(id) ON DELETE CASCADE,
    verification_type VARCHAR(20) NOT NULL CHECK (verification_type IN ('OPENING', 'CLOSING')),
    face_image_url TEXT,
    face_match_status VARCHAR(20) DEFAULT 'PENDING',
    location_verified BOOLEAN DEFAULT FALSE,
    distance_from_venue_meters NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_id, verification_type)
);

-- 3. Create ems.attendance_records if missing
CREATE TABLE IF NOT EXISTS ems.attendance_records (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    session_id BIGINT NOT NULL REFERENCES ems.attendance_sessions(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES ems.students(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ABSENT',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add missing columns to ems.attendance_records (if table already existed)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'remarks') THEN
        ALTER TABLE ems.attendance_records ADD COLUMN remarks TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'student_id') THEN
        ALTER TABLE ems.attendance_records ADD COLUMN student_id BIGINT REFERENCES ems.students(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'updated_at') THEN
        ALTER TABLE ems.attendance_records ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 5. Add missing columns to ems.attendance_face_verifications (if table already existed)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_face_verifications' AND column_name = 'location_verified') THEN
        ALTER TABLE ems.attendance_face_verifications ADD COLUMN location_verified BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_face_verifications' AND column_name = 'distance_from_venue_meters') THEN
        ALTER TABLE ems.attendance_face_verifications ADD COLUMN distance_from_venue_meters NUMERIC(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_face_verifications' AND column_name = 'face_image_url') THEN
        ALTER TABLE ems.attendance_face_verifications ADD COLUMN face_image_url TEXT;
    END IF;
END $$;

-- 6. Add updated_at to ems.attendance_sessions
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'updated_at') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 7. Grant Permissions
GRANT USAGE ON SCHEMA ems TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA ems TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ems TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA ems TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ems TO service_role;
