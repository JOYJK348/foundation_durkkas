-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 06 - CRM LEAD CENTRE SCHEMA (FINAL INTEGRATED VERSION)
-- Durkkas Innovations Private Limited
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP SCHEMA IF EXISTS crm CASCADE;
CREATE SCHEMA crm;
SET search_path TO crm, core, app_auth, public;

-- =====================================================
-- 1. VENDOR APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS crm.vendor_applications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    date DATE NOT NULL,
    category VARCHAR(255),
    categoryname VARCHAR(255),
    vendor_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    appointment_status VARCHAR(10) NOT NULL CHECK (appointment_status IN ('yes', 'no')),
    business_type VARCHAR(50) NOT NULL CHECK (business_type IN ('supplier', 'distributor', 'service-provider', 'manufacturer', 'others')),
    upload_file_url TEXT,
    remarks TEXT,
    
    -- Audit & Soft Delete
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT
);

-- =====================================================
-- 2. B2B APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS crm.b2b_applications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    date DATE NOT NULL,
    contact_person_name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    organization_address TEXT NOT NULL,
    business_type VARCHAR(50) NOT NULL CHECK (business_type IN ('technology', 'manufacturing', 'retail', 'services', 'consulting', 'others')),
    mode_of_business VARCHAR(50) NOT NULL CHECK (mode_of_business IN ('freelancer', 'partnership', 'co-worker', 'consultant', 'others')),
    company_website_email VARCHAR(255) NOT NULL,
    upload_file_url TEXT,
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- =====================================================
-- 3. PARTNER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS crm.partner (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    date DATE NOT NULL,
    category VARCHAR(255) NOT NULL,
    categoryname VARCHAR(255),
    contact_person_name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    organization_address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    upload_file_url TEXT,
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- =====================================================
-- 4. JOB SEEKER APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS crm.job_seeker_applications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    date DATE NOT NULL,
    category VARCHAR(255),
    categoryname VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
    dob DATE NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
    address TEXT NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    qualification VARCHAR(20) NOT NULL CHECK (qualification IN ('10th', '12th', 'diploma', 'ug', 'pg', 'phd')),
    department VARCHAR(50) NOT NULL CHECK (department IN ('hr', 'it', 'marketing', 'finance', 'sales', 'production', 'others')),
    years_of_experience VARCHAR(20) NOT NULL CHECK (years_of_experience IN ('fresher', '1-2', '3-5', '5+')),
    preferred_job_type VARCHAR(20) NOT NULL CHECK (preferred_job_type IN ('full-time', 'part-time', 'hybrid', 'remote')),
    upload_resume_url TEXT,
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- =====================================================
-- 5. STUDENT INTERNSHIP APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS crm.student_internship_applications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    date DATE NOT NULL,
    category VARCHAR(255),
    categoryname VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    dob DATE NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
    college_institution_name VARCHAR(255) NOT NULL,
    course_type VARCHAR(20) NOT NULL CHECK (course_type IN ('ug', 'pg', 'certification')),
    department VARCHAR(50) NOT NULL CHECK (department IN ('computer-science', 'electrical', 'mechanical', 'civil', 'electronics', 'business', 'others')),
    internship_domain VARCHAR(20) NOT NULL CHECK (internship_domain IN ('it', 'non-it', 'others')),
    duration VARCHAR(20) NOT NULL CHECK (duration IN ('3-months', '6-months')),
    upload_file_url TEXT,
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- =====================================================
-- 6. CAREER GUIDANCE APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS crm.career_guidance_applications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    date DATE NOT NULL,
    category VARCHAR(255),
    categoryname VARCHAR(255),
    student_name VARCHAR(255), -- Old field
    candidate_name VARCHAR(255), -- New field
    standard_year VARCHAR(50), -- Old field (made optional)
    education_level VARCHAR(255), -- New field
    date_of_birth DATE, -- Old field (made optional)
    age INTEGER NOT NULL CHECK (age > 0 AND age <= 100),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')), -- Old field (made optional)
    location VARCHAR(255), -- Old field (made optional, matches City basically)
    city VARCHAR(255), -- New field
    pincode VARCHAR(10), -- New field
    contact_number VARCHAR(20), -- Old field (made optional)
    email VARCHAR(255), -- Old field (made optional)
    parent_guardian_name VARCHAR(255), -- Old field (made optional)
    studies_preference VARCHAR(100), -- Old field (made optional)
    
    -- Suitability Test Specific Fields
    well_performing_subjects TEXT,
    enjoyed_activities VARCHAR(255),
    prefer_working_with VARCHAR(255),
    solve_problems_logically VARCHAR(255),
    enjoy_creative_tasks VARCHAR(255),
    test_reason VARCHAR(255),
    comfortable_with_assessments VARCHAR(255),

    abroad_local VARCHAR(10) CHECK (abroad_local IN ('local', 'abroad')),
    preferred_country VARCHAR(255),
    city_if_abroad VARCHAR(255),
    preferred_university VARCHAR(255),
    career_interest VARCHAR(255),
    skills_strengths TEXT,
    academic_performance VARCHAR(255),
    hobbies_extracurricular TEXT,
    preferred_mode_of_study VARCHAR(20),
    career_support_duration VARCHAR(20),
    mentorship_required VARCHAR(5),
    remarks_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- =====================================================
-- 7. COURSE ENQUIRY REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS crm.course_enquiry_registrations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    date DATE NOT NULL,
    category VARCHAR(255) NOT NULL,
    sub_category VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INTEGER NOT NULL,
    address TEXT NOT NULL,
    course_enquiry TEXT NOT NULL,
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES (PERFORMANCE OPTIMIZATION)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX idx_vendor_company ON crm.vendor_applications(company_id);
CREATE INDEX idx_b2b_company ON crm.b2b_applications(company_id);
CREATE INDEX idx_jobseeker_company ON crm.job_seeker_applications(company_id);
CREATE INDEX idx_internship_company ON crm.student_internship_applications(company_id);
CREATE INDEX idx_career_company ON crm.career_guidance_applications(company_id);
CREATE INDEX idx_enquiry_company ON crm.course_enquiry_registrations(company_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS (AUTO-UPDATE TIMESTAMPS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION crm.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'crm' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON crm.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON crm.%I FOR EACH ROW EXECUTE FUNCTION crm.update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF CRM LEAD CENTRE SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
