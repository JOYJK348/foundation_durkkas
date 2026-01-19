-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SOFT DELETE - BUSINESS DATA ONLY (NOT AUTH TABLES)
-- Durkkas Innovations Private Limited
-- Enterprise-Grade Data Protection & Audit Trail
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- IMPORTANT: 
-- This adds soft delete ONLY to business data tables
-- Auth tables (users, roles, permissions) are NOT included
-- They use is_active flag instead
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. CORE SCHEMA - ADD SOFT DELETE COLUMNS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO core, public;

-- Companies
ALTER TABLE core.companies 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

COMMENT ON COLUMN core.companies.deleted_at IS 'Soft delete timestamp (NULL = not deleted)';
COMMENT ON COLUMN core.companies.deleted_by IS 'User who deleted this record';
COMMENT ON COLUMN core.companies.delete_reason IS 'Reason for deletion';

-- Branches
ALTER TABLE core.branches 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Departments
ALTER TABLE core.departments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Designations
ALTER TABLE core.designations 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Employees
ALTER TABLE core.employees 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. HRMS SCHEMA - ADD SOFT DELETE COLUMNS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO hrms, public;

-- Attendance
ALTER TABLE hrms.attendance 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Leave Types
ALTER TABLE hrms.leave_types 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Leaves
ALTER TABLE hrms.leaves 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Salary Components
ALTER TABLE hrms.salary_components 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Employee Salary
ALTER TABLE hrms.employee_salary 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Payroll
ALTER TABLE hrms.payroll 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Job Openings
ALTER TABLE hrms.job_openings 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Candidates
ALTER TABLE hrms.candidates 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Job Applications
ALTER TABLE hrms.job_applications 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Interviews
ALTER TABLE hrms.interviews 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Appraisal Cycles
ALTER TABLE hrms.appraisal_cycles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Performance Reviews
ALTER TABLE hrms.performance_reviews 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. EMS SCHEMA - ADD SOFT DELETE COLUMNS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO ems, public;

-- Students
ALTER TABLE ems.students 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Courses
ALTER TABLE ems.courses 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Batches
ALTER TABLE ems.batches 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Enrollments
ALTER TABLE ems.enrollments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Teacher Assignments
ALTER TABLE ems.teacher_assignments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. FINANCE SCHEMA - ADD SOFT DELETE COLUMNS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO finance, public;

-- Invoices
ALTER TABLE finance.invoices 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Payments
ALTER TABLE finance.payments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. CRM SCHEMA - ADD SOFT DELETE COLUMNS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO crm, public;

-- Leads
ALTER TABLE crm.leads 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- Followups
ALTER TABLE crm.followups 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. CREATE SOFT DELETE FUNCTION (UNIVERSAL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION soft_delete_record(
    p_schema_name TEXT,
    p_table_name TEXT,
    p_record_id BIGINT,
    p_deleted_by BIGINT,
    p_delete_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_sql TEXT;
BEGIN
    -- Build dynamic SQL
    v_sql := format(
        'UPDATE %I.%I SET deleted_at = NOW(), deleted_by = $1, delete_reason = $2 WHERE id = $3 AND deleted_at IS NULL',
        p_schema_name,
        p_table_name
    );
    
    -- Execute update
    EXECUTE v_sql USING p_deleted_by, p_delete_reason, p_record_id;
    
    -- Log to audit_logs
    INSERT INTO app_auth.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        new_values
    ) VALUES (
        p_deleted_by,
        'SOFT_DELETE',
        p_table_name,
        p_record_id,
        jsonb_build_object(
            'schema', p_schema_name,
            'table', p_table_name,
            'deleted_at', NOW(),
            'deleted_by', p_deleted_by,
            'delete_reason', p_delete_reason
        )
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Soft delete failed: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION soft_delete_record IS 
'Universal soft delete function - marks record as deleted without removing data';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. CREATE RESTORE FUNCTION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION restore_deleted_record(
    p_schema_name TEXT,
    p_table_name TEXT,
    p_record_id BIGINT,
    p_restored_by BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_sql TEXT;
BEGIN
    -- Build dynamic SQL
    v_sql := format(
        'UPDATE %I.%I SET deleted_at = NULL, deleted_by = NULL, delete_reason = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
        p_schema_name,
        p_table_name
    );
    
    -- Execute update
    EXECUTE v_sql USING p_record_id;
    
    -- Log to audit_logs
    INSERT INTO app_auth.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        new_values
    ) VALUES (
        p_restored_by,
        'RESTORE',
        p_table_name,
        p_record_id,
        jsonb_build_object(
            'schema', p_schema_name,
            'table', p_table_name,
            'restored_at', NOW(),
            'restored_by', p_restored_by
        )
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Restore failed: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION restore_deleted_record IS 
'Restore a soft-deleted record';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. CREATE INDEXES FOR SOFT DELETE (PERFORMANCE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Core schema
CREATE INDEX IF NOT EXISTS idx_companies_deleted_at ON core.companies(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_branches_deleted_at ON core.branches(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_departments_deleted_at ON core.departments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_designations_deleted_at ON core.designations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employees_deleted_at ON core.employees(deleted_at) WHERE deleted_at IS NULL;

-- HRMS schema
CREATE INDEX IF NOT EXISTS idx_attendance_deleted_at ON hrms.attendance(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leave_types_deleted_at ON hrms.leave_types(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leaves_deleted_at ON hrms.leaves(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_salary_components_deleted_at ON hrms.salary_components(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_salary_deleted_at ON hrms.employee_salary(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payroll_deleted_at ON hrms.payroll(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_job_openings_deleted_at ON hrms.job_openings(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_deleted_at ON hrms.candidates(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_job_applications_deleted_at ON hrms.job_applications(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_interviews_deleted_at ON hrms.interviews(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appraisal_cycles_deleted_at ON hrms.appraisal_cycles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_performance_reviews_deleted_at ON hrms.performance_reviews(deleted_at) WHERE deleted_at IS NULL;

-- EMS schema
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON ems.students(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON ems.courses(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_batches_deleted_at ON ems.batches(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_enrollments_deleted_at ON ems.enrollments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_deleted_at ON ems.teacher_assignments(deleted_at) WHERE deleted_at IS NULL;

-- Finance schema
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON finance.invoices(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_deleted_at ON finance.payments(deleted_at) WHERE deleted_at IS NULL;

-- CRM schema
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON crm.leads(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_followups_deleted_at ON crm.followups(deleted_at) WHERE deleted_at IS NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
    RAISE NOTICE '✅ Soft Delete Pattern Applied to Business Data Tables!';
    RAISE NOTICE '📊 Schemas Updated:';
    RAISE NOTICE '   - CORE: companies, branches, departments, designations, employees';
    RAISE NOTICE '   - HRMS: attendance, leaves, payroll, recruitment, performance';
    RAISE NOTICE '   - EMS: students, courses, batches, enrollments, teachers';
    RAISE NOTICE '   - FINANCE: invoices, payments';
    RAISE NOTICE '   - CRM: leads, followups';
    RAISE NOTICE '🔒 Auth Tables NOT Included (use is_active instead)';
    RAISE NOTICE '🔧 Functions Created:';
    RAISE NOTICE '   - soft_delete_record(): Mark as deleted';
    RAISE NOTICE '   - restore_deleted_record(): Restore deleted';
    RAISE NOTICE '🔍 Indexes: Partial indexes for performance';
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF SOFT DELETE MIGRATION (BUSINESS DATA ONLY)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
