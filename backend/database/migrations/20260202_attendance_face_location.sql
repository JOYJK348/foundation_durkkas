-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FACE & LOCATION-BASED ATTENDANCE SCHEMA
-- Opening 5-min & Closing 5-min Face Capture + GPS Location
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Add columns to existing attendance_sessions table
ALTER TABLE ems.attendance_sessions 
ADD COLUMN IF NOT EXISTS course_id BIGINT REFERENCES ems.courses(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS session_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS session_type VARCHAR(50) DEFAULT 'LECTURE',
ADD COLUMN IF NOT EXISTS opening_window_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS opening_window_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS closing_window_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS closing_window_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS require_face_verification BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS require_location_verification BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allowed_radius_meters INTEGER DEFAULT 100;

-- Create face verification records table
CREATE TABLE IF NOT EXISTS ems.attendance_face_verifications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    session_id BIGINT NOT NULL REFERENCES ems.attendance_sessions(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES ems.students(id) ON DELETE CASCADE,
    
    -- Face capture details
    verification_type VARCHAR(20) NOT NULL CHECK (verification_type IN ('OPENING', 'CLOSING')),
    face_image_url TEXT NOT NULL,
    face_confidence_score NUMERIC(5,2),
    face_match_status VARCHAR(20) DEFAULT 'PENDING' CHECK (face_match_status IN ('PENDING', 'MATCHED', 'FAILED', 'MANUAL_REVIEW')),
    
    -- Location details
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    location_accuracy_meters NUMERIC(10,2),
    location_verified BOOLEAN DEFAULT FALSE,
    distance_from_venue_meters NUMERIC(10,2),
    
    -- Device & Network info
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(session_id, student_id, verification_type)
);

-- Create location whitelist for institutions
CREATE TABLE IF NOT EXISTS ems.institution_locations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    location_name VARCHAR(255) NOT NULL,
    latitude NUMERIC(10,8) NOT NULL,
    longitude NUMERIC(11,8) NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, location_name)
);

-- Create student face profiles table
CREATE TABLE IF NOT EXISTS ems.student_face_profiles (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES ems.students(id) ON DELETE CASCADE,
    
    -- Face encoding/embedding (stored as JSON array)
    face_encoding JSONB NOT NULL,
    reference_image_url TEXT NOT NULL,
    
    -- Metadata
    quality_score NUMERIC(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, student_id)
);

-- Update attendance_records to link with face verifications and standardize names
DO $$ 
BEGIN
    -- Rename attendance_session_id to session_id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'attendance_session_id') THEN
        EXECUTE 'ALTER TABLE ems.attendance_records RENAME COLUMN attendance_session_id TO session_id';
    END IF;

    -- Rename attendance_status to status if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'attendance_status') THEN
        EXECUTE 'ALTER TABLE ems.attendance_records RENAME COLUMN attendance_status TO status';
    END IF;
END $$;

ALTER TABLE ems.attendance_records
ADD COLUMN IF NOT EXISTS student_id BIGINT REFERENCES ems.students(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS opening_verification_id BIGINT REFERENCES ems.attendance_face_verifications(id),
ADD COLUMN IF NOT EXISTS closing_verification_id BIGINT REFERENCES ems.attendance_face_verifications(id),
ADD COLUMN IF NOT EXISTS attendance_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'PENDING';

-- Robustly handle user_id: add if missing, make nullable if exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_records' AND column_name = 'user_id') THEN
        EXECUTE 'ALTER TABLE ems.attendance_records ALTER COLUMN user_id DROP NOT NULL';
    ELSE
        EXECUTE 'ALTER TABLE ems.attendance_records ADD COLUMN user_id BIGINT REFERENCES app_auth.users(id)';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_face_verifications_session ON ems.attendance_face_verifications(session_id);
CREATE INDEX IF NOT EXISTS idx_face_verifications_student ON ems.attendance_face_verifications(student_id);
CREATE INDEX IF NOT EXISTS idx_face_verifications_type ON ems.attendance_face_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_institution_locations_company ON ems.institution_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_student_face_profiles_student ON ems.student_face_profiles(student_id);

-- Create function to calculate distance between two GPS coordinates
CREATE OR REPLACE FUNCTION ems.calculate_distance_meters(
    lat1 NUMERIC, lon1 NUMERIC,
    lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    earth_radius CONSTANT NUMERIC := 6371000; -- Earth's radius in meters
    dlat NUMERIC;
    dlon NUMERIC;
    a NUMERIC;
    c NUMERIC;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlon/2) * sin(dlon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to verify location
CREATE OR REPLACE FUNCTION ems.verify_location(
    p_company_id BIGINT,
    p_latitude NUMERIC,
    p_longitude NUMERIC
) RETURNS TABLE(
    is_valid BOOLEAN,
    location_name VARCHAR,
    distance_meters NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (distance <= radius_meters) as is_valid,
        il.location_name,
        distance as distance_meters
    FROM (
        SELECT 
            il.location_name,
            il.radius_meters,
            ems.calculate_distance_meters(
                p_latitude, p_longitude,
                il.latitude, il.longitude
            ) as distance
        FROM ems.institution_locations il
        WHERE il.company_id = p_company_id
          AND il.is_active = TRUE
        ORDER BY distance ASC
        LIMIT 1
    ) il;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE ems.attendance_face_verifications IS 'Stores face captures and location data for opening and closing attendance windows';
COMMENT ON TABLE ems.institution_locations IS 'Whitelisted GPS locations for attendance verification';
COMMENT ON TABLE ems.student_face_profiles IS 'Student face encodings for biometric verification';
