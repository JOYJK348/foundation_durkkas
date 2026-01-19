-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DURKKAS ERP - MASTER DDL FILE 03
-- BUSINESS MODULES (HRMS, EMS, FINANCE, CRM)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- HRMS SCHEMA
-- ============================================================================
SET search_path TO hrms, core, app_auth, public;

CREATE TABLE IF NOT EXISTS hrms.attendance (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES core.employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'PRESENT',
    work_hours DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(company_id, employee_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS hrms.leave_types (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    days_per_year INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
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
    status VARCHAR(50) DEFAULT 'PENDING',
    approved_by BIGINT REFERENCES core.employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE TABLE IF NOT EXISTS hrms.salary_components (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    component_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS hrms.employee_salary (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES core.employees(id) ON DELETE CASCADE,
    component_id BIGINT NOT NULL REFERENCES hrms.salary_components(id),
    amount DECIMAL(12,2) NOT NULL,
    effective_from DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE TABLE IF NOT EXISTS hrms.payroll (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES core.employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    gross_salary DECIMAL(12,2),
    deductions DECIMAL(12,2),
    net_salary DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'DRAFT',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(company_id, employee_id, pay_period_start)
);

CREATE TABLE IF NOT EXISTS hrms.job_openings (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    department_id BIGINT REFERENCES core.departments(id),
    designation_id BIGINT REFERENCES core.designations(id),
    vacancies INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE TABLE IF NOT EXISTS hrms.candidates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE TABLE IF NOT EXISTS hrms.job_applications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    job_opening_id BIGINT NOT NULL REFERENCES hrms.job_openings(id),
    candidate_id BIGINT NOT NULL REFERENCES hrms.candidates(id),
    status VARCHAR(50) DEFAULT 'APPLIED',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- HRMS Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_company ON hrms.attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON hrms.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_company ON hrms.leaves(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_company ON hrms.payroll(company_id);

-- HRMS Triggers
CREATE OR REPLACE FUNCTION hrms.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'hrms' AND table_name IN ('attendance', 'leaves', 'payroll', 'leave_types', 'salary_components', 'employee_salary', 'job_openings', 'candidates', 'job_applications')
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON hrms.%I FOR EACH ROW EXECUTE FUNCTION hrms.update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ============================================================================
-- EMS SCHEMA
-- ============================================================================
SET search_path TO ems, core, app_auth, public;

CREATE TABLE IF NOT EXISTS ems.students (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id),
    student_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    enrollment_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(company_id, student_code)
);

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
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS ems.batches (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES ems.courses(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS ems.enrollments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES ems.students(id),
    batch_id BIGINT NOT NULL REFERENCES ems.batches(id),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(company_id, student_id, batch_id)
);

CREATE TABLE IF NOT EXISTS ems.teacher_assignments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    batch_id BIGINT NOT NULL REFERENCES ems.batches(id),
    teacher_id BIGINT NOT NULL REFERENCES core.employees(id),
    assigned_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- EMS Indexes
CREATE INDEX IF NOT EXISTS idx_students_company ON ems.students(company_id);
CREATE INDEX IF NOT EXISTS idx_courses_company ON ems.courses(company_id);
CREATE INDEX IF NOT EXISTS idx_batches_company ON ems.batches(company_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON ems.enrollments(student_id);

-- EMS Triggers
CREATE OR REPLACE FUNCTION ems.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'ems' AND table_name IN ('students', 'courses', 'batches')
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON ems.%I FOR EACH ROW EXECUTE FUNCTION ems.update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ============================================================================
-- FINANCE SCHEMA
-- ============================================================================
SET search_path TO finance, core, ems, app_auth, public;

CREATE TABLE IF NOT EXISTS finance.invoices (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES ems.students(id),
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(company_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS finance.payments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    invoice_id BIGINT NOT NULL REFERENCES finance.invoices(id),
    payment_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SUCCESS',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finance Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_company ON finance.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON finance.invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_company ON finance.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON finance.payments(invoice_id);

-- Finance Triggers
CREATE OR REPLACE FUNCTION finance.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON finance.invoices 
FOR EACH ROW EXECUTE FUNCTION finance.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON finance.payments 
FOR EACH ROW EXECUTE FUNCTION finance.update_updated_at_column();

-- ============================================================================
-- CRM SCHEMA
-- ============================================================================
SET search_path TO crm, core, app_auth, public;

CREATE TABLE IF NOT EXISTS crm.leads (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'NEW',
    assigned_to BIGINT REFERENCES core.employees(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE TABLE IF NOT EXISTS crm.followups (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    lead_id BIGINT NOT NULL REFERENCES crm.leads(id),
    followup_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_by BIGINT REFERENCES core.employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- CRM Indexes
CREATE INDEX IF NOT EXISTS idx_leads_company ON crm.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON crm.leads(status);
CREATE INDEX IF NOT EXISTS idx_followups_lead ON crm.followups(lead_id);

-- CRM Triggers
CREATE OR REPLACE FUNCTION crm.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON crm.leads 
FOR EACH ROW EXECUTE FUNCTION crm.update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ MASTER 03: Business Modules Created!';
    RAISE NOTICE '📊 HRMS: attendance, leaves, payroll, recruitment';
    RAISE NOTICE '🎓 EMS: students, courses, batches, enrollments';
    RAISE NOTICE '💰 FINANCE: invoices, payments';
    RAISE NOTICE '🤝 CRM: leads, followups';
END $$;
