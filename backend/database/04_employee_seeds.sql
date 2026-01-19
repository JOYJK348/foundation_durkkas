-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- EMPLOYEE DATA - 3 EMPLOYEES PER BRANCH
-- Run this AFTER running 03_production_seeds.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
DECLARE
    v_user_id BIGINT;
    v_admin_user_id BIGINT;
    v_role_emp BIGINT;
    v_comp_dipl_id BIGINT;
    v_comp_tech_id BIGINT;
    v_comp_dare_id BIGINT;
    v_br_chen_id BIGINT;
    v_br_blr_id BIGINT;
    v_br_apk_id BIGINT;
    v_br_aus_id BIGINT;
    v_br_edu_mdu_id BIGINT;
    v_dept_chen_eng BIGINT;
    v_dept_chen_ops BIGINT;
    v_dept_blr_eng BIGINT;
    v_dept_blr_ops BIGINT;
    v_dept_apk_eng BIGINT;
    v_dept_aus_eng BIGINT;
    v_dept_aus_ops BIGINT;
    v_dept_edu_mdu_acad BIGINT;
    v_dept_edu_mdu_res BIGINT;
    v_dept_edu_mdu_admin BIGINT;
    v_desig_mgr BIGINT;
    v_desig_lead BIGINT;
    v_desig_exec BIGINT;
    v_desig_arch BIGINT;
    v_desig_dev BIGINT;
    v_desig_qa BIGINT;
    v_desig_prof BIGINT;
    v_desig_lec BIGINT;
    v_desig_ao BIGINT;
BEGIN
    -- Get Platform Admin ID
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'admin@durkkas.com';
    
    -- Get Role ID
    SELECT id INTO v_role_emp FROM app_auth.roles WHERE name = 'EMPLOYEE';
    
    -- Get Company IDs
    SELECT id INTO v_comp_dipl_id FROM core.companies WHERE code = 'DIPL';
    SELECT id INTO v_comp_tech_id FROM core.companies WHERE code = 'DTUS';
    SELECT id INTO v_comp_dare_id FROM core.companies WHERE code = 'DARE';
    
    -- Get Branch IDs
    SELECT id INTO v_br_chen_id FROM core.branches WHERE code = 'CHN';
    SELECT id INTO v_br_blr_id FROM core.branches WHERE code = 'BLR';
    SELECT id INTO v_br_apk_id FROM core.branches WHERE code = 'APK';
    SELECT id INTO v_br_aus_id FROM core.branches WHERE code = 'AUS';
    SELECT id INTO v_br_edu_mdu_id FROM core.branches WHERE code = 'MDU';
    
    -- Get Department IDs
    SELECT id INTO v_dept_chen_eng FROM core.departments WHERE code = 'CHN-ENG';
    SELECT id INTO v_dept_chen_ops FROM core.departments WHERE code = 'CHN-OPS';
    SELECT id INTO v_dept_blr_eng FROM core.departments WHERE code = 'BLR-ENG';
    SELECT id INTO v_dept_blr_ops FROM core.departments WHERE code = 'BLR-OPS';
    SELECT id INTO v_dept_apk_eng FROM core.departments WHERE code = 'APK-ENG';
    SELECT id INTO v_dept_aus_eng FROM core.departments WHERE code = 'AUS-ENG';
    SELECT id INTO v_dept_aus_ops FROM core.departments WHERE code = 'AUS-OPS';
    SELECT id INTO v_dept_edu_mdu_acad FROM core.departments WHERE code = 'MDU-ACAD';
    SELECT id INTO v_dept_edu_mdu_res FROM core.departments WHERE code = 'MDU-RES';
    SELECT id INTO v_dept_edu_mdu_admin FROM core.departments WHERE code = 'MDU-ADMIN';
    
    -- Get Designation IDs
    SELECT id INTO v_desig_mgr FROM core.designations WHERE code = 'MGR' AND company_id = v_comp_dipl_id LIMIT 1;
    SELECT id INTO v_desig_lead FROM core.designations WHERE code = 'LEAD' AND company_id = v_comp_dipl_id LIMIT 1;
    SELECT id INTO v_desig_exec FROM core.designations WHERE code = 'EXEC' AND company_id = v_comp_dipl_id LIMIT 1;
    SELECT id INTO v_desig_arch FROM core.designations WHERE code = 'ARC' AND company_id = v_comp_tech_id LIMIT 1;
    SELECT id INTO v_desig_dev FROM core.designations WHERE code = 'SDEV' AND company_id = v_comp_tech_id LIMIT 1;
    SELECT id INTO v_desig_qa FROM core.designations WHERE code = 'QA' AND company_id = v_comp_tech_id LIMIT 1;
    SELECT id INTO v_desig_prof FROM core.designations WHERE code = 'PROF' AND company_id = v_comp_dare_id LIMIT 1;
    SELECT id INTO v_desig_lec FROM core.designations WHERE code = 'LEC' AND company_id = v_comp_dare_id LIMIT 1;
    SELECT id INTO v_desig_ao FROM core.designations WHERE code = 'AO' AND company_id = v_comp_dare_id LIMIT 1;

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DIPL - Chennai Branch (3 Employees)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('rajesh.chen@durkkas.in', crypt('Emp@123', gen_salt('bf')), 'Rajesh', 'Kumar', 'Rajesh Kumar', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dipl_id, v_br_chen_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dipl_id, v_br_chen_id, v_dept_chen_eng, v_desig_mgr, 'DIPL-CHN-001', 'Rajesh', 'Kumar', 'rajesh.chen@durkkas.in', '+91-9876543210', v_user_id);

    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('priya.chen@durkkas.in', crypt('Emp@123', gen_salt('bf')), 'Priya', 'Sharma', 'Priya Sharma', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dipl_id, v_br_chen_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dipl_id, v_br_chen_id, v_dept_chen_eng, v_desig_lead, 'DIPL-CHN-002', 'Priya', 'Sharma', 'priya.chen@durkkas.in', '+91-9876543211', v_user_id);

    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('arun.chen@durkkas.in', crypt('Emp@123', gen_salt('bf')), 'Arun', 'Raj', 'Arun Raj', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dipl_id, v_br_chen_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dipl_id, v_br_chen_id, v_dept_chen_ops, v_desig_exec, 'DIPL-CHN-003', 'Arun', 'Raj', 'arun.chen@durkkas.in', '+91-9876543212', v_user_id);

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DIPL - Bangalore Branch (3 Employees)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('suresh.blr@durkkas.in', crypt('Emp@123', gen_salt('bf')), 'Suresh', 'Babu', 'Suresh Babu', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dipl_id, v_br_blr_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dipl_id, v_br_blr_id, v_dept_blr_eng, v_desig_mgr, 'DIPL-BLR-001', 'Suresh', 'Babu', 'suresh.blr@durkkas.in', '+91-9876543220', v_user_id);

    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('lakshmi.blr@durkkas.in', crypt('Emp@123', gen_salt('bf')), 'Lakshmi', 'Devi', 'Lakshmi Devi', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dipl_id, v_br_blr_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dipl_id, v_br_blr_id, v_dept_blr_eng, v_desig_lead, 'DIPL-BLR-002', 'Lakshmi', 'Devi', 'lakshmi.blr@durkkas.in', '+91-9876543221', v_user_id);

    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('vijay.blr@durkkas.in', crypt('Emp@123', gen_salt('bf')), 'Vijay', 'Kumar', 'Vijay Kumar', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dipl_id, v_br_blr_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dipl_id, v_br_blr_id, v_dept_blr_ops, v_desig_exec, 'DIPL-BLR-003', 'Vijay', 'Kumar', 'vijay.blr@durkkas.in', '+91-9876543222', v_user_id);

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DIPL - APK Branch (2 more + existing Karthik = 3 total)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('divya.apk@durkkas.in', crypt('Emp@123', gen_salt('bf')), 'Divya', 'S', 'Divya S', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dipl_id, v_br_apk_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dipl_id, v_br_apk_id, v_dept_apk_eng, v_desig_lead, 'DIPL-APK-002', 'Divya', 'S', 'divya.apk@durkkas.in', '+91-9876543230', v_user_id);

    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('ganesh.apk@durkkas.in', crypt('Emp@123', gen_salt('bf')), 'Ganesh', 'M', 'Ganesh M', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dipl_id, v_br_apk_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dipl_id, v_br_apk_id, v_dept_apk_eng, v_desig_exec, 'DIPL-APK-003', 'Ganesh', 'M', 'ganesh.apk@durkkas.in', '+91-9876543231', v_user_id);

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DTUS - Austin Branch (3 Employees)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('john.austin@durkkas.us', crypt('Emp@123', gen_salt('bf')), 'John', 'Smith', 'John Smith', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_tech_id, v_br_aus_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_tech_id, v_br_aus_id, v_dept_aus_eng, v_desig_arch, 'DTUS-AUS-001', 'John', 'Smith', 'john.austin@durkkas.us', '+1-512-555-0001', v_user_id);

    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('sarah.austin@durkkas.us', crypt('Emp@123', gen_salt('bf')), 'Sarah', 'Johnson', 'Sarah Johnson', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_tech_id, v_br_aus_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_tech_id, v_br_aus_id, v_dept_aus_eng, v_desig_dev, 'DTUS-AUS-002', 'Sarah', 'Johnson', 'sarah.austin@durkkas.us', '+1-512-555-0002', v_user_id);

    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('mike.austin@durkkas.us', crypt('Emp@123', gen_salt('bf')), 'Mike', 'Davis', 'Mike Davis', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_tech_id, v_br_aus_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_tech_id, v_br_aus_id, v_dept_aus_ops, v_desig_qa, 'DTUS-AUS-003', 'Mike', 'Davis', 'mike.austin@durkkas.us', '+1-512-555-0003', v_user_id);

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- DARE - Madurai Branch (3 Employees)
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('dr.ramesh@durkkasedu.in', crypt('Emp@123', gen_salt('bf')), 'Ramesh', 'Iyer', 'Dr. Ramesh Iyer', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dare_id, v_br_edu_mdu_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dare_id, v_br_edu_mdu_id, v_dept_edu_mdu_acad, v_desig_prof, 'DARE-MDU-001', 'Ramesh', 'Iyer', 'dr.ramesh@durkkasedu.in', '+91-9876543240', v_user_id);

    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('meena.mdu@durkkasedu.in', crypt('Emp@123', gen_salt('bf')), 'Meena', 'Krishnan', 'Meena Krishnan', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dare_id, v_br_edu_mdu_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dare_id, v_br_edu_mdu_id, v_dept_edu_mdu_res, v_desig_lec, 'DARE-MDU-002', 'Meena', 'Krishnan', 'meena.mdu@durkkasedu.in', '+91-9876543241', v_user_id);

    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) 
    VALUES ('kumar.admin@durkkasedu.in', crypt('Emp@123', gen_salt('bf')), 'Kumar', 'Swamy', 'Kumar Swamy', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dare_id, v_br_edu_mdu_id);
    INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, phone, created_by) 
    VALUES (v_comp_dare_id, v_br_edu_mdu_id, v_dept_edu_mdu_admin, v_desig_ao, 'DARE-MDU-003', 'Kumar', 'Swamy', 'kumar.admin@durkkasedu.in', '+91-9876543242', v_user_id);

END $$;
