-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 15 - STANDARD SYSTEM ROLES
-- Ensures hierarchical roles exist for all levels
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Insert Standard Roles if they don't exist
INSERT INTO app_auth.roles (name, display_name, description, role_type, level, is_system_role) VALUES
('BRANCH_ADMIN', 'Branch Administrator', 'Local administrator for a specific branch', 'BRANCH', 1, TRUE),
('EMPLOYEE', 'Standard Employee', 'Regular staff member with basic access', 'CUSTOM', 0, TRUE),
('TEACHER', 'Academic Faculty', 'Teaching staff with LMS and Student access', 'PRODUCT', 0, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Assign Basic Permissions to Employee/Teacher
-- Assuming hrms.view and lms.view already exist from previous migrations
INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_auth.roles r, app_auth.permissions p
WHERE r.name = 'EMPLOYEE' AND p.name IN ('hrms.view', 'lms.view')
ON CONFLICT DO NOTHING;

INSERT INTO app_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_auth.roles r, app_auth.permissions p
WHERE r.name = 'BRANCH_ADMIN' AND p.name LIKE 'hrms.%'
ON CONFLICT DO NOTHING;
