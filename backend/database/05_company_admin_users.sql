-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COMPANY ADMIN USERS - One admin per company
-- Run this AFTER running 03_production_seeds.sql and 04_employee_seeds.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
DECLARE
    v_user_id BIGINT;
    v_admin_user_id BIGINT;
    v_role_company_admin BIGINT;
    v_comp_dipl_id BIGINT;
    v_comp_tech_id BIGINT;
    v_comp_dare_id BIGINT;
BEGIN
    -- Get Platform Admin ID
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'admin@durkkas.com';
    
    -- Get Company Admin Role ID
    SELECT id INTO v_role_company_admin FROM app_auth.roles WHERE name = 'COMPANY_ADMIN';
    
    -- Get Company IDs
    SELECT id INTO v_comp_dipl_id FROM core.companies WHERE code = 'DIPL';
    SELECT id INTO v_comp_tech_id FROM core.companies WHERE code = 'DTUS';
    SELECT id INTO v_comp_dare_id FROM core.companies WHERE code = 'DARE';

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DIPL - Company Admin
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('admin@durkkas.in', crypt('Admin@123', gen_salt('bf')), 'DIPL', 'Administrator', 'DIPL Admin', TRUE, v_user_id) 
    RETURNING id INTO v_admin_user_id;
    
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) 
    VALUES (v_admin_user_id, v_role_company_admin, v_comp_dipl_id, NULL);

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DTUS - Company Admin
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('admin@durkkas.us', crypt('Admin@123', gen_salt('bf')), 'DTUS', 'Administrator', 'DTUS Admin', TRUE, v_user_id) 
    RETURNING id INTO v_admin_user_id;
    
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) 
    VALUES (v_admin_user_id, v_role_company_admin, v_comp_tech_id, NULL);

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DARE - Company Admin
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('admin@durkkasedu.in', crypt('Admin@123', gen_salt('bf')), 'DARE', 'Administrator', 'DARE Admin', TRUE, v_user_id) 
    RETURNING id INTO v_admin_user_id;
    
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) 
    VALUES (v_admin_user_id, v_role_company_admin, v_comp_dare_id, NULL);

END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Check Company Admins
SELECT 
    u.email,
    u.display_name,
    r.name as role,
    c.name as company
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.companies c ON ur.company_id = c.id
WHERE r.name = 'COMPANY_ADMIN'
ORDER BY c.name;
