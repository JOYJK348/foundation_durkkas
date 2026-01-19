-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DURKKAS ERP - MASTER DDL FILE 01
-- INITIALIZATION & CORE SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- STEP 1: EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- STEP 2: SCHEMAS
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS app_auth;
CREATE SCHEMA IF NOT EXISTS hrms;
CREATE SCHEMA IF NOT EXISTS ems;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS backoffice;

SET search_path TO core, app_auth, public;

-- ============================================================================
-- STEP 3: CORE TABLES
-- ============================================================================

-- SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS core.subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    plan_type VARCHAR(20) DEFAULT 'STANDARD',
    monthly_price DECIMAL(12, 2) DEFAULT 0.00,
    yearly_price DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    max_employees INTEGER DEFAULT 0,
    max_branches INTEGER DEFAULT 0,
    max_users INTEGER DEFAULT 10,
    max_departments INTEGER DEFAULT 5,
    max_designations INTEGER DEFAULT 5,
    enabled_modules JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    trial_days INTEGER DEFAULT 0,
    support_level VARCHAR(50) DEFAULT 'EMAIL',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- COMPANIES (Multi-tenant root)
CREATE TABLE IF NOT EXISTS core.companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address_line1 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(50),
    tax_id VARCHAR(50),
    pan_number VARCHAR(50),
    subscription_plan VARCHAR(50) DEFAULT 'TRIAL' NOT NULL,
    plan_id BIGINT REFERENCES core.subscription_plans(id),
    subscription_status VARCHAR(50) DEFAULT 'ACTIVE',
    subscription_start_date TIMESTAMPTZ DEFAULT NOW(),
    subscription_end_date TIMESTAMPTZ,
    max_users INTEGER DEFAULT 10,
    max_branches INTEGER DEFAULT 1,
    max_employees INTEGER DEFAULT 10,
    max_departments INTEGER DEFAULT 5,
    max_designations INTEGER DEFAULT 5,
    enabled_modules JSONB DEFAULT '["HR"]'::jsonb,
    allowed_menu_ids JSONB DEFAULT '[]'::jsonb,
    branding_config JSONB,
    settings JSONB DEFAULT '{}'::jsonb,
    trial_started_at TIMESTAMPTZ,
    trial_expired BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT
);

-- BRANCHES
CREATE TABLE IF NOT EXISTS core.branches (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address_line1 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_head_office BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT
);

-- Partial unique index for active branches only
CREATE UNIQUE INDEX IF NOT EXISTS idx_branches_company_code_active 
ON core.branches (company_id, code) WHERE deleted_at IS NULL;

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS core.departments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    parent_department_id BIGINT REFERENCES core.departments(id),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT,
    UNIQUE(company_id, code)
);

-- DESIGNATIONS
CREATE TABLE IF NOT EXISTS core.designations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT,
    UNIQUE(company_id, code)
);

-- EMPLOYEES
CREATE TABLE IF NOT EXISTS core.employees (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    department_id BIGINT REFERENCES core.departments(id),
    designation_id BIGINT REFERENCES core.designations(id),
    employee_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_joining DATE,
    employment_type VARCHAR(50) DEFAULT 'FULL_TIME' NOT NULL,
    reporting_manager_id BIGINT REFERENCES core.employees(id),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT,
    UNIQUE(company_id, employee_code)
);

-- LOCATION DATA
CREATE TABLE IF NOT EXISTS core.countries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS core.states (
    id BIGSERIAL PRIMARY KEY,
    country_id BIGINT NOT NULL REFERENCES core.countries(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    UNIQUE(country_id, code)
);

CREATE TABLE IF NOT EXISTS core.cities (
    id BIGSERIAL PRIMARY KEY,
    state_id BIGINT NOT NULL REFERENCES core.states(id),
    name VARCHAR(100) NOT NULL
);

-- BRANDING
CREATE TABLE IF NOT EXISTS core.platform_branding (
    id BIGSERIAL PRIMARY KEY,
    platform_name VARCHAR(255) NOT NULL DEFAULT 'Durkkas ERP',
    tagline VARCHAR(500),
    logo_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#0066FF',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS core.company_branding (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    logo_url TEXT,
    primary_color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(company_id)
);

-- ============================================================================
-- STEP 4: INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_companies_active ON core.companies(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_branches_company ON core.branches(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_company ON core.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_designations_company ON core.designations(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company ON core.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch ON core.employees(branch_id);

-- ============================================================================
-- STEP 5: TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION core.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON core.companies 
FOR EACH ROW EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON core.branches 
FOR EACH ROW EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON core.departments 
FOR EACH ROW EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER update_designations_updated_at BEFORE UPDATE ON core.designations 
FOR EACH ROW EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON core.employees 
FOR EACH ROW EXECUTE FUNCTION core.update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ MASTER 01: Core Schema Created Successfully!';
    RAISE NOTICE '📊 Schemas: core, app_auth, hrms, ems, finance, crm';
    RAISE NOTICE '🏢 Tables: companies, branches, departments, designations, employees';
END $$;
