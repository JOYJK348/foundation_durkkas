-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 14 - GRANULAR PERMISSIONS FOR SUB-MENUS
-- Defines detailed permissions for nested menu access
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO app_auth.permissions (name, display_name, description, permission_scope, schema_name, resource, action) VALUES
-- HRMS Granular Sub-Menus
('hrms.employees', 'Access Employees', 'View employee directory and profiles', 'COMPANY', 'hrms', 'employees', 'view'),
('hrms.attendance', 'Access Attendance', 'View attendance logs and stats', 'COMPANY', 'hrms', 'attendance', 'view'),
('hrms.leaves', 'Access Leaves', 'Manage leave requests', 'COMPANY', 'hrms', 'leaves', 'view'),
('hrms.payroll', 'Access Payroll', 'View salary and payroll info', 'COMPANY', 'hrms', 'payroll', 'view'),

-- LMS Granular Sub-Menus
('lms.courses', 'Access Courses', 'View and manage courses', 'COMPANY', 'ems', 'courses', 'view'),
('lms.live_classes', 'Live Classes', 'Access online classroom tools', 'COMPANY', 'ems', 'classes', 'view'),
('lms.assessments', 'Assessments', 'View quizzes and exams', 'COMPANY', 'ems', 'exams', 'view'),

-- FINANCE Granular Sub-Menus
('finance.invoices', 'Access Invoices', 'View and create invoices', 'COMPANY', 'finance', 'invoices', 'view'),
('finance.payments', 'Access Payments', 'Track incoming/outgoing payments', 'COMPANY', 'finance', 'payments', 'view'),

-- CRM Granular Sub-Menus
('crm.leads', 'Access Leads', 'View potential client leads', 'COMPANY', 'crm', 'leads', 'view'),
('crm.clients', 'Access Clients', 'View active client database', 'COMPANY', 'crm', 'clients', 'view')

ON CONFLICT (name) DO UPDATE 
SET display_name = EXCLUDED.display_name;
