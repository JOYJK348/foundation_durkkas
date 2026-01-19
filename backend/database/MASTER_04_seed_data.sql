-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DURKKAS ERP - MASTER DDL FILE 04
-- SEED DATA (Roles, Permissions, Demo Companies)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO app_auth, core, public;

-- ============================================================================
-- BOOTSTRAP ROLES
-- ============================================================================
INSERT INTO app_auth.roles (name, display_name, description, role_type, level, is_system_role) VALUES
('PLATFORM_ADMIN', 'Platform Administrator', 'Durkkas Team - Full platform access', 'PLATFORM', 5, TRUE),
('COMPANY_ADMIN', 'Company Administrator', 'Customer Admin - Company owner', 'COMPANY', 4, TRUE),
('BRANCH_ADMIN', 'Branch Administrator', 'Branch manager', 'BRANCH', 3, TRUE),
('HRMS_ADMIN', 'HRMS Administrator', 'HR module admin', 'PRODUCT', 2, TRUE),
('EMS_ADMIN', 'EMS Administrator', 'Education module admin', 'PRODUCT', 2, TRUE),
('FINANCE_ADMIN', 'Finance Administrator', 'Finance module admin', 'PRODUCT', 2, TRUE),
('CRM_ADMIN', 'CRM Administrator', 'CRM module admin', 'PRODUCT', 2, TRUE),
('EMPLOYEE', 'Employee', 'Regular employee', 'CUSTOM', 0, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- BOOTSTRAP PERMISSIONS
-- ============================================================================
INSERT INTO app_auth.permissions (name, display_name, description, permission_scope, schema_name, resource, action) VALUES
-- Platform permissions
('platform.companies.create', 'Create Companies', 'Create new companies', 'PLATFORM', 'core', 'companies', 'create'),
('platform.companies.delete', 'Delete Companies', 'Delete companies', 'PLATFORM', 'core', 'companies', 'delete'),
('platform.companies.view_all', 'View All Companies', 'View all companies', 'PLATFORM', 'core', 'companies', 'view_all'),
('platform.users.view_all', 'View All Users', 'View all users', 'PLATFORM', 'auth', 'users', 'view_all'),
('platform.settings.manage', 'Manage Platform Settings', 'Manage global settings', 'PLATFORM', 'core', 'settings', 'manage'),

-- Company permissions
('company.users.manage', 'Manage Company Users', 'Manage users within company', 'COMPANY', 'auth', 'users', 'manage'),
('company.branches.manage', 'Manage Branches', 'Manage branches', 'COMPANY', 'core', 'branches', 'manage'),
('company.departments.manage', 'Manage Departments', 'Manage departments', 'COMPANY', 'core', 'departments', 'manage'),
('company.employees.manage', 'Manage Employees', 'Manage employees', 'COMPANY', 'core', 'employees', 'manage'),
('company.settings.manage', 'Manage Company Settings', 'Manage company settings', 'COMPANY', 'core', 'settings', 'manage'),

-- HRMS permissions
('hrms.view', 'View HR Data', 'View employee records', 'COMPANY', 'hrms', 'dashboard', 'view'),
('hrms.create', 'Create HR Records', 'Add employees/salaries', 'COMPANY', 'hrms', 'employees', 'create'),
('hrms.update', 'Edit HR Data', 'Modify employee info', 'COMPANY', 'hrms', 'employees', 'edit'),
('hrms.delete', 'Remove HR Data', 'Delete employee records', 'COMPANY', 'hrms', 'employees', 'delete'),
('hrms.attendance', 'Access Attendance', 'View attendance', 'COMPANY', 'hrms', 'attendance', 'view'),
('hrms.leaves', 'Access Leaves', 'Manage leaves', 'COMPANY', 'hrms', 'leaves', 'view'),
('hrms.payroll', 'Access Payroll', 'View payroll', 'COMPANY', 'hrms', 'payroll', 'view'),

-- EMS permissions
('lms.view', 'View Courses', 'Access courses', 'COMPANY', 'ems', 'courses', 'view'),
('lms.create', 'Create Training', 'Create courses', 'COMPANY', 'ems', 'courses', 'create'),
('lms.update', 'Edit Content', 'Modify courses', 'COMPANY', 'ems', 'courses', 'edit'),
('lms.delete', 'Delete Content', 'Remove courses', 'COMPANY', 'ems', 'courses', 'delete'),

-- Finance permissions
('finance.view', 'View Ledger', 'Access financials', 'COMPANY', 'finance', 'ledger', 'view'),
('finance.create', 'Create Invoice', 'Generate invoices', 'COMPANY', 'finance', 'invoices', 'create'),
('finance.update', 'Edit Ledger', 'Update transactions', 'COMPANY', 'finance', 'ledger', 'edit'),
('finance.delete', 'Void Transaction', 'Remove records', 'COMPANY', 'finance', 'ledger', 'delete'),

-- CRM permissions
('crm.view', 'View Leads', 'Access CRM', 'COMPANY', 'crm', 'leads', 'view'),
('crm.create', 'Add Client', 'Register prospects', 'COMPANY', 'crm', 'leads', 'create'),
('crm.update', 'Edit Client', 'Update leads', 'COMPANY', 'crm', 'leads', 'edit'),
('crm.delete', 'Delete Lead', 'Remove leads', 'COMPANY', 'crm', 'leads', 'delete')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================================================

-- Platform Admin gets all platform permissions
INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_auth.roles r CROSS JOIN app_auth.permissions p
WHERE r.name = 'PLATFORM_ADMIN' AND p.permission_scope = 'PLATFORM'
ON CONFLICT DO NOTHING;

-- Company Admin gets all company permissions
INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_auth.roles r CROSS JOIN app_auth.permissions p
WHERE r.name = 'COMPANY_ADMIN' AND p.permission_scope = 'COMPANY'
ON CONFLICT DO NOTHING;

-- HRMS Admin gets HRMS permissions
INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_auth.roles r CROSS JOIN app_auth.permissions p
WHERE r.name = 'HRMS_ADMIN' AND p.name LIKE 'hrms.%'
ON CONFLICT DO NOTHING;

-- Employee gets basic view permissions
INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_auth.roles r CROSS JOIN app_auth.permissions p
WHERE r.name = 'EMPLOYEE' AND p.name IN ('hrms.view', 'lms.view')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATE PLATFORM ADMIN USER
-- ============================================================================
-- Password: durkkas@2026 (bcrypt hashed)
INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, is_verified) 
VALUES (
    'admin@durkkas.com',
    '$2a$10$ay7xaR5Qb5tFDC0V/f5bf.zpwu/RT5bNZPb.i9k890wolYXEyMeaq',
    'Platform',
    'Administrator',
    'Durkkas Platform Admin',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Assign Platform Admin Role
INSERT INTO app_auth.user_roles (user_id, role_id, company_id)
SELECT u.id, r.id, NULL
FROM app_auth.users u CROSS JOIN app_auth.roles r
WHERE u.email = 'admin@durkkas.com' AND r.name = 'PLATFORM_ADMIN'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED LOCATION DATA
-- ============================================================================
INSERT INTO core.countries (name, code, is_active) VALUES
('India', 'IN', TRUE),
('United States', 'US', TRUE),
('United Kingdom', 'GB', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO core.states (country_id, name, code) VALUES
((SELECT id FROM core.countries WHERE code = 'IN'), 'Tamil Nadu', 'TN'),
((SELECT id FROM core.countries WHERE code = 'IN'), 'Karnataka', 'KA'),
((SELECT id FROM core.countries WHERE code = 'IN'), 'Maharashtra', 'MH'),
((SELECT id FROM core.countries WHERE code = 'IN'), 'Kerala', 'KL')
ON CONFLICT (country_id, code) DO NOTHING;

INSERT INTO core.cities (state_id, name) VALUES
((SELECT id FROM core.states WHERE code = 'TN'), 'Chennai'),
((SELECT id FROM core.states WHERE code = 'TN'), 'Coimbatore'),
((SELECT id FROM core.states WHERE code = 'TN'), 'Madurai'),
((SELECT id FROM core.states WHERE code = 'KA'), 'Bangalore'),
((SELECT id FROM core.states WHERE code = 'MH'), 'Mumbai')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DEMO COMPANIES (OPTIONAL)
-- ============================================================================
INSERT INTO core.companies (name, code, email, phone, city, state, country, subscription_plan, is_active) VALUES
('Durkkas Innovations Pvt Ltd', 'DURKKAS-INNOV', 'info@durkkas.com', '+91-9876543210', 'Chennai', 'Tamil Nadu', 'India', 'ENTERPRISE', TRUE),
('Durkkas Technologies', 'DURKKAS-TECH', 'tech@durkkas.com', '+91-9876543211', 'Bangalore', 'Karnataka', 'India', 'STANDARD', TRUE),
('Durkkas Academy', 'DURKKAS-ACAD', 'academy@durkkas.com', '+91-9876543212', 'Coimbatore', 'Tamil Nadu', 'India', 'BASIC', TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED DEMO BRANCHES
-- ============================================================================
INSERT INTO core.branches (company_id, name, code, city, state, country, is_head_office) VALUES
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Head Office - Chennai', 'HO-CHN', 'Chennai', 'Tamil Nadu', 'India', TRUE),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Branch - Madurai', 'BR-MDU', 'Madurai', 'Tamil Nadu', 'India', FALSE),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-TECH'), 'Head Office - Bangalore', 'HO-BLR', 'Bangalore', 'Karnataka', 'India', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DEMO DEPARTMENTS
-- ============================================================================
INSERT INTO core.departments (company_id, name, code) VALUES
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Engineering', 'ENG'),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Human Resources', 'HR'),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Finance', 'FIN'),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Sales & Marketing', 'SALES')
ON CONFLICT (company_id, code) DO NOTHING;

-- ============================================================================
-- SEED DEMO DESIGNATIONS
-- ============================================================================
INSERT INTO core.designations (company_id, title, code, level) VALUES
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Chief Executive Officer', 'CEO', 10),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Chief Technology Officer', 'CTO', 9),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Senior Software Engineer', 'SSE', 5),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Software Engineer', 'SE', 4),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'HR Manager', 'HRM', 6),
((SELECT id FROM core.companies WHERE code = 'DURKKAS-INNOV'), 'Finance Manager', 'FM', 6)
ON CONFLICT (company_id, code) DO NOTHING;

-- ============================================================================
-- SEED PLATFORM BRANDING
-- ============================================================================
INSERT INTO core.platform_branding (platform_name, tagline, primary_color) VALUES
('Durkkas ERP', 'Advanced Enterprise Architecture', '#0066FF')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
    v_roles INTEGER;
    v_permissions INTEGER;
    v_companies INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_roles FROM app_auth.roles;
    SELECT COUNT(*) INTO v_permissions FROM app_auth.permissions;
    SELECT COUNT(*) INTO v_companies FROM core.companies;
    
    RAISE NOTICE '✅ MASTER 04: Seed Data Loaded!';
    RAISE NOTICE '👥 Roles: %', v_roles;
    RAISE NOTICE '🔑 Permissions: %', v_permissions;
    RAISE NOTICE '🏢 Demo Companies: %', v_companies;
    RAISE NOTICE '🔐 Platform Admin: admin@durkkas.com (password: durkkas@2026)';
END $$;
