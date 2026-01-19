-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 11 - GRANULAR PERMISSIONS & USER OVERRIDES
-- Add support for exact CRUD control per module and individual user overrides
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Create User-Specific Permissions Table (Overrides)
CREATE TABLE IF NOT EXISTS app_auth.user_permissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES app_auth.permissions(id) ON DELETE CASCADE,
    company_id BIGINT, -- To track which company context the override is for
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    
    UNIQUE(user_id, permission_id, company_id)
);

COMMENT ON TABLE app_auth.user_permissions IS 'Specific permission overrides for individual users (bypassing roles)';

-- 2. Insert Granular Permissions for Modules
-- Resource Actions: view, create, edit, delete
INSERT INTO app_auth.permissions (name, display_name, description, permission_scope, schema_name, resource, action) VALUES
-- HRMS Granular
('hrms.view', 'View HR Data', 'Ability to view employee records and payroll', 'COMPANY', 'hrms', 'dashboard', 'view'),
('hrms.create', 'Create HR Records', 'Ability to add new employees or salaries', 'COMPANY', 'hrms', 'employees', 'create'),
('hrms.update', 'Edit HR Data', 'Ability to modify employee info or payroll', 'COMPANY', 'hrms', 'employees', 'edit'),
('hrms.delete', 'Remove HR Data', 'Ability to delete employee or payroll records', 'COMPANY', 'hrms', 'employees', 'delete'),

-- LMS Granular
('lms.view', 'View Courses', 'Access to online training and content', 'COMPANY', 'ems', 'courses', 'view'),
('lms.create', 'Create Training', 'Construct new courses and material', 'COMPANY', 'ems', 'courses', 'create'),
('lms.update', 'Edit Content', 'Modify existing course data', 'COMPANY', 'ems', 'courses', 'edit'),
('lms.delete', 'Delete Content', 'Remove course or training logs', 'COMPANY', 'ems', 'courses', 'delete'),

-- FINANCE Granular
('finance.view', 'View Ledger', 'Access to financial statements and books', 'COMPANY', 'finance', 'ledger', 'view'),
('finance.create', 'Create Invoice', 'Generate new billings or expenses', 'COMPANY', 'finance', 'invoices', 'create'),
('finance.update', 'Edit Ledger', 'Update existing transactions', 'COMPANY', 'finance', 'ledger', 'edit'),
('finance.delete', 'Void Transaction', 'Remove or void financial records', 'COMPANY', 'finance', 'ledger', 'delete'),

-- CRM Granular
('crm.view', 'View Leads', 'Access to customer and sales pipeline', 'COMPANY', 'crm', 'leads', 'view'),
('crm.create', 'Add Client', 'Register new prospects or customers', 'COMPANY', 'crm', 'leads', 'create'),
('crm.update', 'Edit Client', 'Update prospect details', 'COMPANY', 'crm', 'leads', 'edit'),
('crm.delete', 'Delete Lead', 'Remove lead from pipeline', 'COMPANY', 'crm', 'leads', 'delete')
ON CONFLICT (name) DO NOTHING;

-- 3. Assign Default View Permissions to Standard Roles
-- Standard Employee (Level 0/1) usually gets View for HR/LMS
INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_auth.roles r, app_auth.permissions p
WHERE r.name = 'EMPLOYEE' AND p.name IN ('hrms.view', 'lms.view')
ON CONFLICT DO NOTHING;

-- Branch Admin (Level 3) gets View/Create for HRMS 
INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_auth.roles r, app_auth.permissions p
WHERE r.name = 'BRANCH_ADMIN' AND p.name IN ('hrms.view', 'hrms.create', 'hrms.update', 'lms.view', 'lms.create')
ON CONFLICT DO NOTHING;

-- Company Admin (Level 4) gets EVERYTHING
INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_auth.roles r, app_auth.permissions p
WHERE r.name = 'COMPANY_ADMIN' AND p.permission_scope = 'COMPANY'
ON CONFLICT DO NOTHING;
