-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SMART ATTENDANCE (PUNCH IN/OUT) ENHANCEMENTS
-- Adds check-in/out timestamps and linking to verifications
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Add columns to ems.attendance_records
DO $$ 
BEGIN 
    -- Timestamps
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'check_in_at') THEN
        ALTER TABLE ems.attendance_records ADD COLUMN check_in_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'check_out_at') THEN
        ALTER TABLE ems.attendance_records ADD COLUMN check_out_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Verification Links
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'check_in_id') THEN
        ALTER TABLE ems.attendance_records ADD COLUMN check_in_id BIGINT REFERENCES ems.attendance_face_verifications(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'check_out_id') THEN
        ALTER TABLE ems.attendance_records ADD COLUMN check_out_id BIGINT REFERENCES ems.attendance_face_verifications(id);
    END IF;

    -- Status column refinement (if needed)
    -- Possible statuses: ABSENT, PRESENT, PARTIAL (In but no Out)
END $$;

-- 2. Add verification details to face_verification_logs (Enhanced for Biometrics)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'face_verification_logs' AND column_name = 'latitude') THEN
        ALTER TABLE ems.face_verification_logs ADD COLUMN latitude NUMERIC(10,8);
        ALTER TABLE ems.face_verification_logs ADD COLUMN longitude NUMERIC(11,8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'face_verification_logs' AND column_name = 'face_embedding') THEN
        ALTER TABLE ems.face_verification_logs ADD COLUMN face_embedding JSONB;
    END IF;
END $$;
