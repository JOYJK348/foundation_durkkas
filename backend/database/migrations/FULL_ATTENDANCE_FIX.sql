-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FULL ATTENDANCE SYSTEM FIX
-- Run this in Supabase SQL Editor to fix:
-- 1. Missing columns in attendance_sessions (class_mode, etc.)
-- 2. Missing verify_location function
-- 3. Missing attendance_face_verifications table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. FIX ATTENDANCE SESSIONS SCHEMA
DO $$
BEGIN
    -- Fix Status Column (Ensure it accepts new values)
    -- Create type if not exists or add values
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
            -- Might be text check constraint, so we just add check constraint if needed
            NULL;
        ELSE
            ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'IDENTIFYING_ENTRY';
            ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'IDENTIFYING_EXIT';
            ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
            ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'COMPLETED';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    -- Update Check Constraint if it exists (for text columns)
    -- This handles cases where status is VARCHAR with a CHECK constraint
    DECLARE
        chk_name text;
    BEGIN
        SELECT conname INTO chk_name FROM pg_constraint WHERE conrelid = 'ems.attendance_sessions'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%status%';
        IF chk_name IS NOT NULL THEN
            EXECUTE 'ALTER TABLE ems.attendance_sessions DROP CONSTRAINT ' || chk_name;
            ALTER TABLE ems.attendance_sessions ADD CONSTRAINT attendance_sessions_status_check 
            CHECK (status IN ('SCHEDULED', 'OPEN', 'CLOSED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED', 'IDENTIFYING_ENTRY', 'IDENTIFYING_EXIT'));
        END IF;
    END;

    -- Add class_mode
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'class_mode') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN class_mode VARCHAR(20) DEFAULT 'OFFLINE';
    END IF;

    -- Add require_face_verification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'require_face_verification') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN require_face_verification BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add live_class_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'live_class_id') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN live_class_id BIGINT;
    END IF;

    -- Add require_location_verification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'require_location_verification') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN require_location_verification BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Update existing sessions with defaults
UPDATE ems.attendance_sessions SET class_mode = 'OFFLINE' WHERE class_mode IS NULL;
UPDATE ems.attendance_sessions SET require_face_verification = FALSE WHERE require_face_verification IS NULL;
UPDATE ems.attendance_sessions SET require_location_verification = TRUE WHERE require_location_verification IS NULL;


-- 2. ADD LOCATION VERIFICATION FUNCTIONS
CREATE OR REPLACE FUNCTION ems.calculate_distance_meters(
    lat1 NUMERIC, lon1 NUMERIC,
    lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    earth_radius CONSTANT NUMERIC := 6371000;
    dlat NUMERIC;
    dlon NUMERIC;
    a NUMERIC;
    c NUMERIC;
BEGIN
    -- Handle nulls gracefully
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN 999999;
    END IF;

    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN earth_radius * c;
EXCEPTION WHEN OTHERS THEN
    RETURN 999999;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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
    ) as il
    ORDER BY distance ASC
    LIMIT 1;
    
    -- If no location found, this returns empty set which is handled by code
    -- But we can return a default
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, 'No institution location registered'::VARCHAR, 99999::NUMERIC;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- 3. ENSURE VERIFICATION LOGS TABLE EXISTS
CREATE TABLE IF NOT EXISTS ems.attendance_face_verifications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    session_id BIGINT,
    verification_type VARCHAR(20),
    face_match_status VARCHAR(20),
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    location_accuracy_meters NUMERIC,
    location_verified BOOLEAN DEFAULT FALSE,
    distance_from_venue_meters NUMERIC,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    face_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON ems.attendance_face_verifications TO authenticated;
GRANT ALL ON ems.attendance_face_verifications TO service_role;
GRANT ALL ON SEQUENCE ems.attendance_face_verifications_id_seq TO authenticated;
GRANT ALL ON SEQUENCE ems.attendance_face_verifications_id_seq TO service_role;
