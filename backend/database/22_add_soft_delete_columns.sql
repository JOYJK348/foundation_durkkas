-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SOFT DELETE COLUMNS MIGRATION
-- Add soft delete tracking to all major tables
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Add soft delete columns to app_auth.users
ALTER TABLE app_auth.users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES app_auth.users(id),
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

COMMENT ON COLUMN app_auth.users.deleted_at IS 'Timestamp when user was soft deleted';
COMMENT ON COLUMN app_auth.users.deleted_by IS 'User ID who performed the deletion';
COMMENT ON COLUMN app_auth.users.delete_reason IS 'Reason for user deletion (required for audit)';

-- 2. Add soft delete columns to core.companies
ALTER TABLE core.companies 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES app_auth.users(id),
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

COMMENT ON COLUMN core.companies.deleted_at IS 'Timestamp when company was soft deleted';
COMMENT ON COLUMN core.companies.deleted_by IS 'User ID who performed the deletion';
COMMENT ON COLUMN core.companies.delete_reason IS 'Reason for company deletion (required for audit)';

-- 3. Add soft delete columns to core.employees
ALTER TABLE core.employees
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES app_auth.users(id),
ADD COLUMN IF NOT EXISTS delete_reason TEXT;

COMMENT ON COLUMN core.employees.deleted_at IS 'Timestamp when employee was soft deleted';
COMMENT ON COLUMN core.employees.deleted_by IS 'User ID who performed the deletion';
COMMENT ON COLUMN core.employees.delete_reason IS 'Reason for employee deletion (required for audit)';

-- 4. Add soft delete columns to core.branches (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'branches') THEN
        ALTER TABLE core.branches 
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES app_auth.users(id),
        ADD COLUMN IF NOT EXISTS delete_reason TEXT;
    END IF;
END $$;

-- 5. Add soft delete columns to core.departments (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'departments') THEN
        ALTER TABLE core.departments 
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES app_auth.users(id),
        ADD COLUMN IF NOT EXISTS delete_reason TEXT;
    END IF;
END $$;

-- 6. Create index for faster queries on deleted records
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON app_auth.users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_deleted_at ON core.companies(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_deleted_at ON core.employees(deleted_at) WHERE deleted_at IS NOT NULL;

-- 7. Verification query
DO $$
DECLARE
    users_cols INTEGER;
    companies_cols INTEGER;
    employees_cols INTEGER;
BEGIN
    -- Check users table
    SELECT COUNT(*) INTO users_cols
    FROM information_schema.columns 
    WHERE table_schema = 'app_auth' 
    AND table_name = 'users' 
    AND column_name IN ('deleted_at', 'deleted_by', 'delete_reason');
    
    -- Check companies table
    SELECT COUNT(*) INTO companies_cols
    FROM information_schema.columns 
    WHERE table_schema = 'core' 
    AND table_name = 'companies' 
    AND column_name IN ('deleted_at', 'deleted_by', 'delete_reason');
    
    -- Check employees table
    SELECT COUNT(*) INTO employees_cols
    FROM information_schema.columns 
    WHERE table_schema = 'core' 
    AND table_name = 'employees' 
    AND column_name IN ('deleted_at', 'deleted_by', 'delete_reason');
    
    RAISE NOTICE '✅ Soft Delete Migration Complete!';
    RAISE NOTICE '📊 Verification Results:';
    RAISE NOTICE '   - app_auth.users: % soft delete columns', users_cols;
    RAISE NOTICE '   - core.companies: % soft delete columns', companies_cols;
    RAISE NOTICE '   - core.employees: % soft delete columns', employees_cols;
    
    IF users_cols = 3 AND companies_cols = 3 AND employees_cols = 3 THEN
        RAISE NOTICE '🎉 All tables have complete soft delete support!';
    ELSE
        RAISE WARNING '⚠️ Some tables are missing soft delete columns. Please check manually.';
    END IF;
END $$;
