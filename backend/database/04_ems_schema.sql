-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 04 - EMS SCHEMA (EDUCATION MANAGEMENT SYSTEM)
-- Durkkas Innovations Private Limited
-- Multi-Tenant SaaS | Production-Ready | Enterprise Grade
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP SCHEMA IF EXISTS ems CASCADE;
CREATE SCHEMA ems;
SET search_path TO ems, core, app_auth, public;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. STUDENTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS ems.students (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    student_code VARCHAR(50) NOT NULL,
    
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    
    email VARCHAR(255),
    phone VARCHAR(20),
    
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    
    enrollment_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, GRADUATED, DROPPED, SUSPENDED
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, student_code)
);

COMMENT ON TABLE ems.students IS 'Student master records (multi-tenant)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. COURSES & BATCHES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS ems.courses (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    
    duration_months INTEGER,
    fee_amount DECIMAL(12,2),
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS ems.batches (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES ems.courses(id),
    branch_id BIGINT REFERENCES core.branches(id),
    
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    
    start_date DATE,
    end_date DATE,
    
    max_students INTEGER,
    
    status VARCHAR(50) DEFAULT 'PLANNED',  -- PLANNED, ACTIVE, COMPLETED, CANCELLED
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS ems.enrollments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES ems.students(id),
    batch_id BIGINT NOT NULL REFERENCES ems.batches(id),
    
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, COMPLETED, DROPPED
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, student_id, batch_id)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. TEACHERS (References core.employees)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS ems.teacher_assignments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES core.employees(id),
    batch_id BIGINT NOT NULL REFERENCES ems.batches(id),
    
    assigned_date DATE DEFAULT CURRENT_DATE,
    is_primary BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, teacher_id, batch_id)
);

COMMENT ON TABLE ems.teacher_assignments IS 'Teacher-batch assignments (teachers are from core.employees)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_students_company_id ON ems.students(company_id);
CREATE INDEX IF NOT EXISTS idx_students_branch_id ON ems.students(branch_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON ems.students(status);

CREATE INDEX IF NOT EXISTS idx_courses_company_id ON ems.courses(company_id);
CREATE INDEX IF NOT EXISTS idx_batches_company_id ON ems.batches(company_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_company_id ON ems.enrollments(company_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION ems.update_updated_at_column()
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
        WHERE table_schema = 'ems' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON ems.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON ems.%I FOR EACH ROW EXECUTE FUNCTION ems.update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF EMS SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
