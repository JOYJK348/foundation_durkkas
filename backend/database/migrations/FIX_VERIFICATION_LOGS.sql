
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FINAL SCHEMA FIX FOR FACE VERIFICATION LOGS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ensure the table name is consistent with AttendanceService.ts
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'ems' AND tablename = 'face_verification_logs') 
    AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'ems' AND tablename = 'attendance_face_verifications') THEN
        ALTER TABLE ems.face_verification_logs RENAME TO attendance_face_verifications;
    END IF;
END $$;

-- 1. Ensure attendance_face_verifications exists with ALL required columns
CREATE TABLE IF NOT EXISTS ems.attendance_face_verifications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    session_id BIGINT,
    verification_type VARCHAR(20),
    face_match_status VARCHAR(20),
    confidence_score NUMERIC(5,2),
    distance NUMERIC,
    face_image_url TEXT,
    
    -- Location Context
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    location_accuracy_meters NUMERIC,
    location_verified BOOLEAN DEFAULT FALSE,
    distance_from_venue_meters NUMERIC,
    
    -- Device Context
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. If it already exists, add missing columns
ALTER TABLE ems.attendance_face_verifications 
ADD COLUMN IF NOT EXISTS distance NUMERIC,
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11,8),
ADD COLUMN IF NOT EXISTS location_accuracy_meters NUMERIC,
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS distance_from_venue_meters NUMERIC,
ADD COLUMN IF NOT EXISTS device_info JSONB,
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 3. Fix foreign keys in attendance_records
ALTER TABLE ems.attendance_records
DROP CONSTRAINT IF EXISTS attendance_records_check_in_id_fkey,
DROP CONSTRAINT IF EXISTS attendance_records_check_out_id_fkey;

ALTER TABLE ems.attendance_records
ADD CONSTRAINT attendance_records_check_in_id_fkey 
    FOREIGN KEY (check_in_id) REFERENCES ems.attendance_face_verifications(id) ON DELETE SET NULL,
ADD CONSTRAINT attendance_records_check_out_id_fkey 
    FOREIGN KEY (check_out_id) REFERENCES ems.attendance_face_verifications(id) ON DELETE SET NULL;

-- 4. Permissions
GRANT ALL ON ems.attendance_face_verifications TO authenticated;
GRANT ALL ON ems.attendance_face_verifications TO service_role;
