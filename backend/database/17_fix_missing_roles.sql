-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 17 - CRITICAL ROLE RECOVERY
-- Restores standard hierarchical roles for the onboarding system
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ensure Schema exists (just in case)
CREATE SCHEMA IF NOT EXISTS app_auth;

-- Upsert Standard Roles
INSERT INTO app_auth.roles (name, display_name, description, role_type, level, is_system_role, is_active) 
VALUES
('PLATFORM_ADMIN', 'Platform Administrator', 'Master system access across all tenants', 'PLATFORM', 5, TRUE, TRUE),
('COMPANY_ADMIN', 'Company Administrator', 'Full access to a single organization', 'COMPANY', 4, TRUE, TRUE),
('PRODUCT_ADMIN', 'Product Manager', 'Management access to specific products (HR, LMS)', 'PRODUCT', 2, TRUE, TRUE),
('BRANCH_ADMIN', 'Branch Administrator', 'Operational management of a single branch node', 'BRANCH', 1, TRUE, TRUE),
('EMPLOYEE', 'Standard Employee', 'Basic organizational staff access', 'CUSTOM', 0, TRUE, TRUE),
('TEACHER', 'Academic Faculty', 'Academic staff with specialized LMS protocols', 'PRODUCT', 0, TRUE, TRUE)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    level = EXCLUDED.level,
    is_active = TRUE;

-- Verify Role-Permission mapping for standard roles
-- (Assuming permissions like hrms.view and lms.view exist)
DO $$
DECLARE
    role_rec RECORD;
    perm_rec RECORD;
BEGIN
    FOR role_rec IN SELECT id, name FROM app_auth.roles WHERE name IN ('EMPLOYEE', 'TEACHER', 'BRANCH_ADMIN')
    LOOP
        -- Simple check to see if we have permissions to link
        IF EXISTS (SELECT 1 FROM app_auth.permissions WHERE name = 'hrms.view') THEN
            INSERT INTO app_auth.role_permissions (role_id, permission_id)
            SELECT role_rec.id, p.id FROM app_auth.permissions p WHERE p.name = 'hrms.view'
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;
