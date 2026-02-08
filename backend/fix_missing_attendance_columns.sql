-- Add missing columns to ems.attendance_records
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'remarks') THEN
        ALTER TABLE ems.attendance_records ADD COLUMN remarks TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'updated_at') THEN
        ALTER TABLE ems.attendance_records ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at to ems.attendance_sessions
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'updated_at') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add missing columns to ems.face_verifications
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'face_verifications' AND column_name = 'location_verified') THEN
        ALTER TABLE ems.face_verifications ADD COLUMN location_verified BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'face_verifications' AND column_name = 'distance_from_venue_meters') THEN
        ALTER TABLE ems.face_verifications ADD COLUMN distance_from_venue_meters DECIMAL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'face_verifications' AND column_name = 'face_image_url') THEN
        ALTER TABLE ems.face_verifications ADD COLUMN face_image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'face_verifications' AND column_name = 'updated_at') THEN
        ALTER TABLE ems.face_verifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;
