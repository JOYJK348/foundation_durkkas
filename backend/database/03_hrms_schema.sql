-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 03 - HRMS SCHEMA (HUMAN RESOURCE MANAGEMENT SYSTEM)
-- Durkkas Innovations Private Limited
-- Multi-Tenant SaaS | Production-Ready | Enterprise Grade
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP SCHEMA IF EXISTS hrms CASCADE;
CREATE SCHEMA hrms;
SET search_path TO hrms, core, app_auth, public;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. ATTENDANCE MANAGEMENT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS hrms.attendance (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES core.employees(id) ON DELETE CASCADE,
    
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    
    status VARCHAR(50) DEFAULT 'PRESENT',  -- PRESENT, ABSENT, HALF_DAY, LEAVE, HOLIDAY
    work_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, employee_id, attendance_date)
);

COMMENT ON TABLE hrms.attendance IS 'Employee attendance records (multi-tenant)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. LEAVE MANAGEMENT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS hrms.leave_types (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    days_per_year INTEGER DEFAULT 0,
    is_paid BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS hrms.leaves (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES core.employees(id) ON DELETE CASCADE,
    leave_type_id BIGINT NOT NULL REFERENCES hrms.leave_types(id),
    
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days_count DECIMAL(4,2) NOT NULL,
    
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED, CANCELLED
    
    approved_by BIGINT REFERENCES core.employees(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hrms.leaves IS 'Employee leave requests (multi-tenant)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. PAYROLL MANAGEMENT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS hrms.salary_components (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    component_type VARCHAR(50),  -- EARNING, DEDUCTION
    calculation_type VARCHAR(50) DEFAULT 'FIXED',  -- FIXED, PERCENTAGE
    is_taxable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS hrms.employee_salary (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES core.employees(id) ON DELETE CASCADE,
    
    basic_salary DECIMAL(12,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hrms.payroll (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES core.employees(id) ON DELETE CASCADE,
    
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    
    gross_salary DECIMAL(12,2),
    total_deductions DECIMAL(12,2),
    net_salary DECIMAL(12,2),
    
    status VARCHAR(50) DEFAULT 'DRAFT',  -- DRAFT, PROCESSED, PAID
    paid_on DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, employee_id, pay_period_start)
);

COMMENT ON TABLE hrms.payroll IS 'Employee payroll records (multi-tenant)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. RECRUITMENT (STRATEGIC HR)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS hrms.job_openings (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id BIGINT REFERENCES core.departments(id),
    designation_id BIGINT REFERENCES core.designations(id),
    
    vacancies INTEGER DEFAULT 1,
    employment_type VARCHAR(50) DEFAULT 'FULL_TIME',
    
    status VARCHAR(50) DEFAULT 'OPEN',  -- OPEN, CLOSED, ON_HOLD
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    closing_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hrms.candidates (
    id BIGSERIAL PRIMARY KEY,
    
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    resume_url TEXT,
    skills TEXT[],
    experience_years DECIMAL(4,1),
    
    source VARCHAR(100),  -- LINKEDIN, WEBSITE, REFERRAL
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hrms.job_applications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    job_opening_id BIGINT NOT NULL REFERENCES hrms.job_openings(id),
    candidate_id BIGINT NOT NULL REFERENCES hrms.candidates(id),
    
    status VARCHAR(50) DEFAULT 'APPLIED',  -- APPLIED, SCREENING, INTERVIEW, OFFER, REJECTED, HIRED
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hrms.interviews (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES hrms.job_applications(id),
    interviewer_id BIGINT NOT NULL REFERENCES core.employees(id),
    
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    location VARCHAR(255),
    
    feedback TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    status VARCHAR(50) DEFAULT 'SCHEDULED',  -- SCHEDULED, COMPLETED, CANCELLED
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hrms.job_openings IS 'Job postings (multi-tenant)';
COMMENT ON TABLE hrms.candidates IS 'Candidate database (shared across companies)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. PERFORMANCE MANAGEMENT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS hrms.appraisal_cycles (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    status VARCHAR(50) DEFAULT 'DRAFT',  -- DRAFT, ACTIVE, COMPLETED
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hrms.performance_reviews (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    cycle_id BIGINT NOT NULL REFERENCES hrms.appraisal_cycles(id),
    employee_id BIGINT NOT NULL REFERENCES core.employees(id),
    reviewer_id BIGINT NOT NULL REFERENCES core.employees(id),
    
    self_rating INTEGER,
    reviewer_rating INTEGER,
    final_rating DECIMAL(3,2),
    
    strengths TEXT,
    areas_of_improvement TEXT,
    goals_next_period TEXT,
    
    status VARCHAR(50) DEFAULT 'PENDING',
    submitted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES (CRITICAL FOR MULTI-TENANT PERFORMANCE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_attendance_company_id ON hrms.attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON hrms.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON hrms.attendance(attendance_date);

CREATE INDEX IF NOT EXISTS idx_leaves_company_id ON hrms.leaves(company_id);
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON hrms.leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON hrms.leaves(status);

CREATE INDEX IF NOT EXISTS idx_payroll_company_id ON hrms.payroll(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON hrms.payroll(employee_id);

CREATE INDEX IF NOT EXISTS idx_job_openings_company_id ON hrms.job_openings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_id ON hrms.job_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_company_id ON hrms.interviews(company_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION hrms.update_updated_at_column()
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
        WHERE table_schema = 'hrms' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON hrms.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON hrms.%I FOR EACH ROW EXECUTE FUNCTION hrms.update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF HRMS SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
