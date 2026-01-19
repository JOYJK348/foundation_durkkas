-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 01 - CORE SCHEMA (ORGANIZATIONAL FOUNDATION)
-- Durkkas Innovations Private Limited
-- Multi-Tenant SaaS | Production-Ready | Enterprise Grade
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Drop and Recreate Schema (CAUTION: This will delete ALL data in core)
-- Schema already exists (public)
-- Using public schema

-- Set Search Path
SET search_path TO public;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. COMPANIES (MULTI-TENANT ROOT)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.companies (
    id BIGSERIAL PRIMARY KEY,
    
    -- Company Details
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    
    -- Tax & Legal
    tax_id VARCHAR(50),  -- GST/VAT/TIN
    pan_number VARCHAR(20),
    registration_number VARCHAR(100),
    
    -- Subscription & Status
    subscription_plan VARCHAR(50) DEFAULT 'TRIAL',  -- TRIAL, BASIC, PREMIUM, ENTERPRISE
    subscription_start_date DATE,
    subscription_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT
);

COMMENT ON TABLE public.companies IS 'Multi-tenant root: Each company is a separate tenant';
COMMENT ON COLUMN public.companies.code IS 'Unique company code (used in URLs, APIs)';
COMMENT ON COLUMN public.companies.subscription_plan IS 'Subscription tier for billing';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. BRANCHES (ORGANIZATIONAL HIERARCHY)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.branches (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Branch Details
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    branch_type VARCHAR(50) DEFAULT 'BRANCH',  -- HEAD_OFFICE, BRANCH, WAREHOUSE
    
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_head_office BOOLEAN DEFAULT FALSE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT,
    
    UNIQUE(company_id, code)
);

COMMENT ON TABLE public.branches IS 'Company branches/locations';
COMMENT ON COLUMN public.branches.is_head_office IS 'Mark primary/head office branch';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. DEPARTMENTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.departments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES public.branches(id),
    
    -- Department Details
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Hierarchy
    parent_department_id BIGINT REFERENCES public.departments(id),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    
    UNIQUE(company_id, code)
);

COMMENT ON TABLE public.departments IS 'Organizational departments';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. DESIGNATIONS (JOB TITLES)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.designations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Designation Details
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Hierarchy
    level INTEGER DEFAULT 0,  -- 0=Entry, 1=Junior, 2=Mid, 3=Senior, 4=Lead, 5=Manager
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    
    UNIQUE(company_id, code)
);

COMMENT ON TABLE public.designations IS 'Job titles and positions';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. EMPLOYEES (MASTER RECORD)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.employees (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES public.branches(id),
    department_id BIGINT REFERENCES public.departments(id),
    designation_id BIGINT REFERENCES public.designations(id),
    
    -- Employee Code
    employee_code VARCHAR(50) NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    
    -- Employment
    date_of_joining DATE,
    date_of_leaving DATE,
    employment_type VARCHAR(50) DEFAULT 'FULL_TIME',  -- FULL_TIME, PART_TIME, CONTRACT, INTERN
    
    -- Reporting
    reporting_manager_id BIGINT REFERENCES public.employees(id),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    
    UNIQUE(company_id, employee_code)
);

COMMENT ON TABLE public.employees IS 'Master employee record - single source of truth for all staff';
COMMENT ON COLUMN public.employees.employee_code IS 'Unique employee identifier within company';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. LOCATION MASTER DATA (GLOBAL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.countries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,  -- ISO 3166-1 alpha-2
    phone_code VARCHAR(10),
    currency_code VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.states (
    id BIGSERIAL PRIMARY KEY,
    country_id BIGINT NOT NULL REFERENCES public.countries(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(country_id, code)
);

CREATE TABLE IF NOT EXISTS public.cities (
    id BIGSERIAL PRIMARY KEY,
    state_id BIGINT NOT NULL REFERENCES public.states(id),
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE public.countries IS 'Global country master (shared across all tenants)';
COMMENT ON TABLE public.states IS 'State/province master';
COMMENT ON TABLE public.cities IS 'City master';

CREATE TABLE IF NOT EXISTS public.locations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES public.branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address_line1 TEXT,
    address_line2 TEXT,
    city_id BIGINT REFERENCES public.cities(id),
    pincode VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT
);

COMMENT ON TABLE public.locations IS 'Detailed locations/facilities within branches';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES (PERFORMANCE OPTIMIZATION)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Companies
CREATE INDEX IF NOT EXISTS idx_companies_code ON public.companies(code);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON public.companies(is_active);

-- Branches
CREATE INDEX IF NOT EXISTS idx_branches_company_id ON public.branches(company_id);
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON public.branches(is_active);

-- Departments
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_branch_id ON public.departments(branch_id);

-- Designations
CREATE INDEX IF NOT EXISTS idx_designations_company_id ON public.designations(company_id);

-- Employees (CRITICAL for multi-tenant filtering)
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON public.employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON public.employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS (AUTO-UPDATE TIMESTAMPS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'core' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BOOTSTRAP DATA (DEMO COMPANIES FOR TESTING)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Insert demo companies
INSERT INTO public.companies (name, code, email, phone, subscription_plan, is_active) VALUES
('ABC School', 'ABC', 'admin@abcschool.com', '9876543210', 'PREMIUM', TRUE),
('XYZ College', 'XYZ', 'admin@xyzcollege.com', '9876543211', 'ENTERPRISE', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Insert India (for location master)
INSERT INTO public.countries (name, code, phone_code, currency_code) VALUES
('India', 'IN', '+91', 'INR')
ON CONFLICT (code) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. ACADEMIC YEARS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.academic_years (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    UNIQUE(company_id, name)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. GLOBAL SETTINGS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.global_settings (
    id BIGSERIAL PRIMARY KEY,
    "group" VARCHAR(100) DEFAULT 'GENERAL',
    "key" VARCHAR(255) NOT NULL UNIQUE,
    "value" TEXT,
    description TEXT,
    is_system_setting BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF CORE SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

