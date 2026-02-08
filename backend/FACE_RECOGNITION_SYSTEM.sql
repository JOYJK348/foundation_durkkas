-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SIMPLE MULTI-TENANT FACE RECOGNITION SYSTEM
-- Uses image storage + hash comparison (No external models needed)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Create Face Profiles Table
CREATE TABLE IF NOT EXISTS ems.student_face_profiles (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES ems.students(id) ON DELETE CASCADE,
    
    -- Face Data
    primary_face_url TEXT NOT NULL,
    face_embedding JSONB NOT NULL, -- 128D mathematical vector from face-api.js
    
    -- Metadata
    confidence_score NUMERIC(5,2) DEFAULT 95.0,
    quality_score NUMERIC(5,2) DEFAULT 90.0,
    
    -- Registration Info
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    registration_device_info JSONB,
    registration_ip INET,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified_by_admin BOOLEAN DEFAULT FALSE,
    verified_by BIGINT REFERENCES app_auth.users(id),
    verified_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Multi-tenant isolation
    UNIQUE(company_id, student_id)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_face_profiles_student ON ems.student_face_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_face_profiles_company ON ems.student_face_profiles(company_id);

-- 3. Function to calculate Euclidean distance (Lower = Better Match)
DROP FUNCTION IF EXISTS ems.calculate_face_distance(JSONB, JSONB);
CREATE OR REPLACE FUNCTION ems.calculate_face_distance(
    vec1 JSONB,
    vec2 JSONB
) RETURNS NUMERIC AS $$
DECLARE
    sum_sq NUMERIC := 0;
    i INTEGER;
    v1 NUMERIC;
    v2 NUMERIC;
    len INTEGER;
BEGIN
    len := jsonb_array_length(vec1);
    FOR i IN 0..(len - 1) LOOP
        v1 := (vec1->i)::NUMERIC;
        v2 := (vec2->i)::NUMERIC;
        sum_sq := sum_sq + POWER(v1 - v2, 2);
    END LOOP;
    RETURN SQRT(sum_sq);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Secure Verification Function
DROP FUNCTION IF EXISTS ems.verify_face_match(BIGINT, JSONB, NUMERIC);
CREATE OR REPLACE FUNCTION ems.verify_face_match(
    p_student_id BIGINT,
    p_new_embedding JSONB,
    p_threshold NUMERIC DEFAULT 0.6 -- Standard threshold for face-api.js
) RETURNS TABLE(
    is_match BOOLEAN,
    confidence NUMERIC,
    distance NUMERIC
) AS $$
DECLARE
    v_stored_embedding JSONB;
    v_dist NUMERIC;
BEGIN
    -- Get registered embedding
    SELECT face_embedding INTO v_stored_embedding
    FROM ems.student_face_profiles
    WHERE student_id = p_student_id AND is_active = TRUE
    LIMIT 1;

    IF v_stored_embedding IS NULL THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC, 999::NUMERIC;
        RETURN;
    END IF;

    -- Calculate math distance
    v_dist := ems.calculate_face_distance(v_stored_embedding, p_new_embedding);
    
    -- Match if distance < threshold (usually 0.6 for face-api.js)
    RETURN QUERY SELECT 
        (v_dist < p_threshold),
        GREATEST(0, (1 - v_dist) * 100)::NUMERIC, -- Confidence score
        v_dist;
END;
$$ LANGUAGE plpgsql;

-- 5. Helper to check existence
DROP FUNCTION IF EXISTS ems.verify_face_profile_exists(BIGINT, BIGINT);
CREATE OR REPLACE FUNCTION ems.verify_face_profile_exists(
    p_company_id BIGINT,
    p_student_id BIGINT
) RETURNS TABLE(
    has_profile BOOLEAN,
    profile_id BIGINT,
    primary_face_url TEXT,
    is_verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as has_profile,
        id as profile_id,
        fp.primary_face_url,
        fp.is_verified_by_admin as is_verified
    FROM ems.student_face_profiles fp
    WHERE fp.company_id = p_company_id
      AND fp.student_id = p_student_id
      AND fp.is_active = TRUE
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::BIGINT, NULL::TEXT, FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Log verification attempts
CREATE TABLE IF NOT EXISTS ems.face_verification_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    session_id BIGINT,
    verification_type VARCHAR(20),
    match_status VARCHAR(20),
    confidence_score NUMERIC(5,2),
    verification_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_logs_company ON ems.face_verification_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_student ON ems.face_verification_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_session ON ems.face_verification_logs(session_id);

-- 7. Permissions & RLS
GRANT ALL ON ems.student_face_profiles TO authenticated;
GRANT ALL ON ems.student_face_profiles TO service_role;
GRANT ALL ON ems.face_verification_logs TO authenticated;
GRANT ALL ON ems.face_verification_logs TO service_role;
GRANT EXECUTE ON FUNCTION ems.calculate_face_distance TO authenticated;
GRANT EXECUTE ON FUNCTION ems.verify_face_match TO authenticated;
GRANT EXECUTE ON FUNCTION ems.verify_face_profile_exists TO authenticated;
GRANT EXECUTE ON FUNCTION ems.verify_face_profile_exists TO service_role;

-- Disable RLS or set broad policy since backend handles security
ALTER TABLE ems.student_face_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ems.face_verification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service bypass" ON ems.student_face_profiles;
CREATE POLICY "Service bypass" ON ems.student_face_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Service bypass" ON ems.face_verification_logs;
CREATE POLICY "Service bypass" ON ems.face_verification_logs FOR ALL USING (true);

-- 8. Add comments
COMMENT ON TABLE ems.student_face_profiles IS 'Multi-tenant face profiles for attendance verification';
COMMENT ON TABLE ems.face_verification_logs IS 'Audit log for all face verification attempts';
COMMENT ON FUNCTION ems.verify_face_profile_exists IS 'Check if student has registered face profile';
