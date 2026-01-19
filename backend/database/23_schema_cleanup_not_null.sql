-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SCHEMA CLEANUP - SET PROPER DEFAULTS AND NOT NULL CONSTRAINTS
-- Make fields required with sensible defaults, keep only truly optional as NULL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. FIX app_auth.users TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Set defaults for existing NULL values first
UPDATE app_auth.users SET is_active = true WHERE is_active IS NULL;
UPDATE app_auth.users SET is_verified = false WHERE is_verified IS NULL;
UPDATE app_auth.users SET is_locked = false WHERE is_locked IS NULL;
UPDATE app_auth.users SET failed_login_attempts = 0 WHERE failed_login_attempts IS NULL;
UPDATE app_auth.users SET mfa_enabled = false WHERE mfa_enabled IS NULL;

-- Now add NOT NULL constraints with defaults
ALTER TABLE app_auth.users 
    ALTER COLUMN is_active SET DEFAULT true,
    ALTER COLUMN is_active SET NOT NULL,
    
    ALTER COLUMN is_verified SET DEFAULT false,
    ALTER COLUMN is_verified SET NOT NULL,
    
    ALTER COLUMN is_locked SET DEFAULT false,
    ALTER COLUMN is_locked SET NOT NULL,
    
    ALTER COLUMN failed_login_attempts SET DEFAULT 0,
    ALTER COLUMN failed_login_attempts SET NOT NULL,
    
    ALTER COLUMN mfa_enabled SET DEFAULT false,
    ALTER COLUMN mfa_enabled SET NOT NULL,
    
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN created_at SET NOT NULL,
    
    ALTER COLUMN updated_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET NOT NULL;

-- Optional fields (these SHOULD be NULL until set):
-- ✅ avatar_url - optional, user may not have uploaded
-- ✅ phone_number - optional, not all users provide phone
-- ✅ last_login_at - NULL until first login
-- ✅ last_login_ip - NULL until first login
-- ✅ password_changed_at - NULL until password is changed
-- ✅ mfa_secret - NULL unless MFA is enabled
-- ✅ created_by - NULL for system-created users
-- ✅ updated_by - NULL until first update
-- ✅ deleted_at - NULL unless deleted
-- ✅ deleted_by - NULL unless deleted
-- ✅ delete_reason - NULL unless deleted

COMMENT ON COLUMN app_auth.users.is_active IS 'User account active status (required, default: true)';
COMMENT ON COLUMN app_auth.users.is_verified IS 'Email verification status (required, default: false)';
COMMENT ON COLUMN app_auth.users.is_locked IS 'Account lock status (required, default: false)';
COMMENT ON COLUMN app_auth.users.failed_login_attempts IS 'Failed login counter (required, default: 0)';
COMMENT ON COLUMN app_auth.users.mfa_enabled IS 'MFA enabled flag (required, default: false)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. FIX core.companies TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Set defaults for existing NULL values
UPDATE core.companies SET is_active = true WHERE is_active IS NULL;

-- Add NOT NULL constraints
ALTER TABLE core.companies 
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN code SET NOT NULL,
    
    ALTER COLUMN is_active SET DEFAULT true,
    ALTER COLUMN is_active SET NOT NULL,
    
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN created_at SET NOT NULL,
    
    ALTER COLUMN updated_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET NOT NULL;

-- Optional fields for companies:
-- ✅ address, city, state, country, postal_code - optional
-- ✅ phone, email, website - optional
-- ✅ logo_url - optional
-- ✅ subscription_plan - can be NULL for trial
-- ✅ subscription_start_date, subscription_end_date - NULL for trial
-- ✅ enabled_modules, branding_config, settings - optional JSON configs
-- ✅ created_by, updated_by - NULL for system-created
-- ✅ deleted_at, deleted_by, delete_reason - NULL unless deleted

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. FIX core.employees TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Set defaults for existing NULL values
UPDATE core.employees SET is_active = true WHERE is_active IS NULL;
UPDATE core.employees SET employment_type = 'FULL_TIME' WHERE employment_type IS NULL;

-- Add NOT NULL constraints for core fields only
ALTER TABLE core.employees 
    ALTER COLUMN first_name SET NOT NULL,
    ALTER COLUMN last_name SET NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN employee_code SET NOT NULL,
    ALTER COLUMN company_id SET NOT NULL,
    
    ALTER COLUMN employment_type SET DEFAULT 'FULL_TIME',
    ALTER COLUMN employment_type SET NOT NULL,
    
    ALTER COLUMN is_active SET DEFAULT true,
    ALTER COLUMN is_active SET NOT NULL,
    
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN created_at SET NOT NULL,
    
    ALTER COLUMN updated_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET NOT NULL;

-- Optional fields for employees:
-- ✅ phone - optional
-- ✅ branch_id - optional (some employees are at company HQ)
-- ✅ department_id - optional (can be NULL for unassigned employees)
-- ✅ designation_id - optional (can be NULL for unassigned employees)
-- ✅ date_of_joining - can be NULL for pending
-- ✅ date_of_leaving - NULL unless resigned/terminated
-- ✅ avatar_url - optional
-- ✅ created_by, updated_by - NULL for system-created
-- ✅ deleted_at, deleted_by, delete_reason - NULL unless deleted

COMMENT ON COLUMN core.employees.department_id IS 'Department assignment (optional - NULL for unassigned)';
COMMENT ON COLUMN core.employees.designation_id IS 'Designation/role (optional - NULL for unassigned)';
COMMENT ON COLUMN core.employees.branch_id IS 'Branch assignment (optional - NULL for HQ employees)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. FIX core.branches TABLE (if exists)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'branches') THEN
        -- Set defaults
        UPDATE core.branches SET is_active = true WHERE is_active IS NULL;
        
        -- Add constraints
        ALTER TABLE core.branches 
            ALTER COLUMN name SET NOT NULL,
            ALTER COLUMN code SET NOT NULL,
            ALTER COLUMN company_id SET NOT NULL,
            
            ALTER COLUMN is_active SET DEFAULT true,
            ALTER COLUMN is_active SET NOT NULL,
            
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN created_at SET NOT NULL,
            
            ALTER COLUMN updated_at SET DEFAULT NOW(),
            ALTER COLUMN updated_at SET NOT NULL;
    END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. FIX core.departments TABLE (if exists)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'departments') THEN
        -- Set defaults
        UPDATE core.departments SET is_active = true WHERE is_active IS NULL;
        
        -- Add constraints
        ALTER TABLE core.departments 
            ALTER COLUMN name SET NOT NULL,
            ALTER COLUMN company_id SET NOT NULL,
            
            ALTER COLUMN is_active SET DEFAULT true,
            ALTER COLUMN is_active SET NOT NULL,
            
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN created_at SET NOT NULL,
            
            ALTER COLUMN updated_at SET DEFAULT NOW(),
            ALTER COLUMN updated_at SET NOT NULL;
    END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. FIX core.designations TABLE (if exists)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'designations') THEN
        -- Set defaults
        UPDATE core.designations SET is_active = true WHERE is_active IS NULL;
        
        -- Add constraints
        ALTER TABLE core.designations 
            ALTER COLUMN title SET NOT NULL,
            ALTER COLUMN company_id SET NOT NULL,
            
            ALTER COLUMN is_active SET DEFAULT true,
            ALTER COLUMN is_active SET NOT NULL,
            
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN created_at SET NOT NULL,
            
            ALTER COLUMN updated_at SET DEFAULT NOW(),
            ALTER COLUMN updated_at SET NOT NULL;
    END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. VERIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
DECLARE
    users_not_null INTEGER;
    companies_not_null INTEGER;
    employees_not_null INTEGER;
BEGIN
    -- Count NOT NULL columns in users
    SELECT COUNT(*) INTO users_not_null
    FROM information_schema.columns 
    WHERE table_schema = 'app_auth' 
    AND table_name = 'users' 
    AND is_nullable = 'NO';
    
    -- Count NOT NULL columns in companies
    SELECT COUNT(*) INTO companies_not_null
    FROM information_schema.columns 
    WHERE table_schema = 'core' 
    AND table_name = 'companies' 
    AND is_nullable = 'NO';
    
    -- Count NOT NULL columns in employees
    SELECT COUNT(*) INTO employees_not_null
    FROM information_schema.columns 
    WHERE table_schema = 'core' 
    AND table_name = 'employees' 
    AND is_nullable = 'NO';
    
    RAISE NOTICE '✅ Schema Cleanup Complete!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📊 NOT NULL Constraints Added:';
    RAISE NOTICE '   - app_auth.users: % required fields', users_not_null;
    RAISE NOTICE '   - core.companies: % required fields', companies_not_null;
    RAISE NOTICE '   - core.employees: % required fields', employees_not_null;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✨ Required Fields (NOT NULL):';
    RAISE NOTICE '   Users: email, password_hash, is_active, is_verified, is_locked';
    RAISE NOTICE '   Companies: name, code, is_active';
    RAISE NOTICE '   Employees: first_name, last_name, email, employee_code, company_id';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📝 Optional Fields (Nullable):';
    RAISE NOTICE '   - Profile: avatar_url, phone_number';
    RAISE NOTICE '   - Tracking: last_login_at, last_login_ip, password_changed_at';
    RAISE NOTICE '   - Security: mfa_secret (only when MFA enabled)';
    RAISE NOTICE '   - Audit: created_by, updated_by (NULL for system)';
    RAISE NOTICE '   - Soft Delete: deleted_at, deleted_by, delete_reason';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🎯 All core business fields are now REQUIRED!';
END $$;
