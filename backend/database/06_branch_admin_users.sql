-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BRANCH ADMIN USERS - One admin per branch
-- Run this AFTER running 03_production_seeds.sql and 04_employee_seeds.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
DECLARE
    v_user_id BIGINT;
    v_admin_user_id BIGINT;
    v_role_branch_admin BIGINT;
    v_comp_dipl_id BIGINT;
    v_comp_tech_id BIGINT;
    v_comp_dare_id BIGINT;
    v_br_chen_id BIGINT;
    v_br_blr_id BIGINT;
    v_br_apk_id BIGINT;
    v_br_aus_id BIGINT;
    v_br_mdu_id BIGINT;
BEGIN
    -- Get Creator ID (Platform Admin)
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'admin@durkkas.com' LIMIT 1;
    
    -- Get Branch Admin Role ID
    SELECT id INTO v_role_branch_admin FROM app_auth.roles WHERE name = 'BRANCH_ADMIN' LIMIT 1;
    
    -- Get Company IDs
    SELECT id INTO v_comp_dipl_id FROM core.companies WHERE code = 'DIPL' LIMIT 1;
    SELECT id INTO v_comp_tech_id FROM core.companies WHERE code = 'DTUS' LIMIT 1;
    SELECT id INTO v_comp_dare_id FROM core.companies WHERE code = 'DARE' LIMIT 1;

    -- Get Branch IDs
    SELECT id INTO v_br_chen_id FROM core.branches WHERE code = 'CHN' LIMIT 1;
    SELECT id INTO v_br_blr_id FROM core.branches WHERE code = 'BLR' LIMIT 1;
    SELECT id INTO v_br_apk_id FROM core.branches WHERE code = 'APK' LIMIT 1;
    SELECT id INTO v_br_aus_id FROM core.branches WHERE code = 'AUS' LIMIT 1;
    SELECT id INTO v_br_mdu_id FROM core.branches WHERE code = 'MDU' LIMIT 1;

    -- Cleanup existing branch admins to prevent duplicates
    DELETE FROM app_auth.users WHERE email IN (
        'admin.chennai@durkkas.in',
        'admin.blr@durkkas.in',
        'admin.apk@durkkas.in',
        'admin.austin@durkkas.us',
        'admin.madurai@durkkasedu.in'
    );

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DIPL - Branch Admins
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    -- Chennai Branch Admin
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('admin.chennai@durkkas.in', crypt('Branch@123', gen_salt('bf')), 'Chennai', 'Admin', 'Chennai Branch Admin', TRUE, v_user_id) 
    RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) 
    VALUES (v_admin_user_id, v_role_branch_admin, v_comp_dipl_id, v_br_chen_id);

    -- Bangalore Branch Admin
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('admin.blr@durkkas.in', crypt('Branch@123', gen_salt('bf')), 'Bangalore', 'Admin', 'Bangalore Branch Admin', TRUE, v_user_id) 
    RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) 
    VALUES (v_admin_user_id, v_role_branch_admin, v_comp_dipl_id, v_br_blr_id);

    -- APK Branch Admin
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('admin.apk@durkkas.in', crypt('Branch@123', gen_salt('bf')), 'APK', 'Admin', 'APK Branch Admin', TRUE, v_user_id) 
    RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) 
    VALUES (v_admin_user_id, v_role_branch_admin, v_comp_dipl_id, v_br_apk_id);

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DTUS - Branch Admin (Austin)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('admin.austin@durkkas.us', crypt('Branch@123', gen_salt('bf')), 'Austin', 'Admin', 'Austin Branch Admin', TRUE, v_user_id) 
    RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) 
    VALUES (v_admin_user_id, v_role_branch_admin, v_comp_tech_id, v_br_aus_id);

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DARE - Branch Admin (Madurai)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('admin.madurai@durkkasedu.in', crypt('Branch@123', gen_salt('bf')), 'Madurai', 'Admin', 'Madurai Branch Admin', TRUE, v_user_id) 
    RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) 
    VALUES (v_admin_user_id, v_role_branch_admin, v_comp_dare_id, v_br_mdu_id);

END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 
    u.email,
    u.display_name,
    r.name as role,
    c.name as company,
    b.name as branch
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.companies c ON ur.company_id = c.id
LEFT JOIN core.branches b ON ur.branch_id = b.id
WHERE r.name = 'BRANCH_ADMIN'
ORDER BY c.name, b.name;
