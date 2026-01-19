
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 03 - PRODUCTION SEEDS (TENANT & USER DATA)
-- Authenticated Users, Roles, Companies, Branches, Departments, Designations, Employees
-- Master Data: Countries, States, Cities, Global Settings, Academic Years
-- REPLACES ALL EXISTING BUSINESS DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEGIN;

    -- 1. CLEANUP (Remove old data safely)
    TRUNCATE TABLE core.companies CASCADE; 
    TRUNCATE TABLE core.branches CASCADE;
    TRUNCATE TABLE core.departments CASCADE;
    TRUNCATE TABLE core.designations CASCADE;
    TRUNCATE TABLE core.employees CASCADE;
    TRUNCATE TABLE core.countries CASCADE;
    TRUNCATE TABLE core.states CASCADE;
    TRUNCATE TABLE core.cities CASCADE;
    TRUNCATE TABLE core.academic_years CASCADE;
    TRUNCATE TABLE core.global_settings CASCADE;
    
    -- Cleanup Non-Platform Users
    DELETE FROM app_auth.users WHERE id NOT IN (SELECT user_id FROM app_auth.user_roles WHERE role_id = (SELECT id FROM app_auth.roles WHERE name = 'PLATFORM_ADMIN'));
    
    -- Ensure pgcrypto for hashing
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- 2. ENSURE ROLES EXIST
    INSERT INTO app_auth.roles (name, display_name, description, role_type, level, is_system_role) VALUES
    ('BRANCH_ADMIN', 'Branch Administrator', 'Manages specific branch', 'BRANCH', 3, TRUE),
    ('EMPLOYEE', 'Employee', 'Standard employee user', 'CUSTOM', 1, TRUE)
    ON CONFLICT (name) DO NOTHING;

    -- 3. GLOBAL SETTINGS
    INSERT INTO core.global_settings ("group", "key", "value", "description", is_system_setting) VALUES
    ('GENERAL', 'system_name', 'Durkkas ERP', 'The name of the ERP system', TRUE),
    ('GENERAL', 'support_email', 'support@durkkas.com', 'System support email', TRUE),
    ('BRANDING', 'platform_logo_url', '/logo.svg', 'Platform logo URL (SVG preferred)', TRUE),
    ('BRANDING', 'platform_favicon_url', '/favicon.ico', 'Platform favicon URL (32x32 ICO or PNG)', TRUE),
    ('BRANDING', 'platform_tagline', 'Advanced Enterprise Architecture', 'Platform tagline/slogan', TRUE),
    ('SECURITY', 'session_timeout', '3600', 'Auth session timeout in seconds', TRUE),
    ('FINANCE', 'default_currency', 'INR', 'Default system currency', TRUE);

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- HELPER BLOCKS FOR INSERTION
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    DO $$
    DECLARE
        -- Countries
        v_country_in_id BIGINT;
        v_country_us_id BIGINT;
        
        -- States
        v_state_tn_id BIGINT;
        v_state_tx_id BIGINT;
        v_state_ca_id BIGINT;
        
        -- Cities
        v_city_apk_id BIGINT; v_city_cbe_id BIGINT; v_city_mdu_id BIGINT; v_city_che_id BIGINT;
        v_city_try_id BIGINT; v_city_slm_id BIGINT; v_city_aus_id BIGINT; v_city_dal_id BIGINT; v_city_sj_id BIGINT;

        -- Companies
        v_comp_dipl_id BIGINT;
        v_comp_tech_id BIGINT;
        v_comp_dare_id BIGINT;
        
        -- Branches
        v_br_apk_id BIGINT; v_br_cbe_id BIGINT; v_br_mdu_id BIGINT; v_br_che_id BIGINT;
        v_br_aus_id BIGINT; v_br_dal_id BIGINT; v_br_sj_id BIGINT;
        v_br_edu_mdu_id BIGINT; v_br_try_id BIGINT; v_br_slm_id BIGINT;

        -- Departments
        v_dept_apk_eng BIGINT; v_dept_apk_admin BIGINT; v_dept_apk_hr BIGINT;
        v_dept_cbe_eng BIGINT; v_dept_cbe_hr BIGINT;
        v_dept_mdu_eng BIGINT; v_dept_mdu_admin BIGINT;
        v_dept_che_eng BIGINT; v_dept_che_hr BIGINT;
        v_dept_aus_eng BIGINT; v_dept_aus_ops BIGINT;
        v_dept_dal_sales BIGINT; v_dept_dal_ops BIGINT;
        v_dept_sj_eng BIGINT; v_dept_sj_sales BIGINT;
        v_dept_edu_mdu_acad BIGINT; v_dept_edu_mdu_res BIGINT; v_dept_edu_mdu_admin BIGINT;
        v_dept_try_acad BIGINT; v_dept_try_res BIGINT; v_dept_try_admin BIGINT;
        v_dept_slm_acad BIGINT; v_dept_slm_res BIGINT; v_dept_slm_admin BIGINT;

        -- Designations
        v_desig_mgr BIGINT; v_desig_lead BIGINT; v_desig_eng BIGINT;
        v_desig_arch BIGINT; v_desig_dev BIGINT; v_desig_qa BIGINT;
        v_desig_prof BIGINT; v_desig_lec BIGINT; v_desig_ao BIGINT;
        
        -- Role IDs
        v_role_co_admin BIGINT;
        v_role_br_admin BIGINT;
        v_role_emp BIGINT;

        -- Helper to create user
        v_user_id BIGINT;
        v_admin_user_id BIGINT;

    BEGIN
        -- GET SYSTEM ADMIN ID (Assuming first user is creator)
        SELECT id INTO v_admin_user_id FROM app_auth.users LIMIT 1;
        IF v_admin_user_id IS NULL THEN v_admin_user_id := 1; END IF;

        -- GET ROLE IDs
        SELECT id INTO v_role_co_admin FROM app_auth.roles WHERE name = 'COMPANY_ADMIN';
        SELECT id INTO v_role_br_admin FROM app_auth.roles WHERE name = 'BRANCH_ADMIN';
        SELECT id INTO v_role_emp FROM app_auth.roles WHERE name = 'EMPLOYEE';

        -- ━━━━━ GEOGRAPHIC MASTER DATA ━━━━━
        
        -- Countries
        INSERT INTO core.countries (name, code, phone_code, currency_code) VALUES ('India', 'IN', '+91', 'INR') RETURNING id INTO v_country_in_id;
        INSERT INTO core.countries (name, code, phone_code, currency_code) VALUES ('United States', 'US', '+1', 'USD') RETURNING id INTO v_country_us_id;

        -- States
        INSERT INTO core.states (country_id, name, code) VALUES (v_country_in_id, 'Tamil Nadu', 'TN') RETURNING id INTO v_state_tn_id;
        INSERT INTO core.states (country_id, name, code) VALUES (v_country_us_id, 'Texas', 'TX') RETURNING id INTO v_state_tx_id;
        INSERT INTO core.states (country_id, name, code) VALUES (v_country_us_id, 'California', 'CA') RETURNING id INTO v_state_ca_id;

        -- Cities
        INSERT INTO core.cities (state_id, name) VALUES (v_state_tn_id, 'Aruppukottai') RETURNING id INTO v_city_apk_id;
        INSERT INTO core.cities (state_id, name) VALUES (v_state_tn_id, 'Coimbatore') RETURNING id INTO v_city_cbe_id;
        INSERT INTO core.cities (state_id, name) VALUES (v_state_tn_id, 'Madurai') RETURNING id INTO v_city_mdu_id;
        INSERT INTO core.cities (state_id, name) VALUES (v_state_tn_id, 'Chennai') RETURNING id INTO v_city_che_id;
        INSERT INTO core.cities (state_id, name) VALUES (v_state_tn_id, 'Trichy') RETURNING id INTO v_city_try_id;
        INSERT INTO core.cities (state_id, name) VALUES (v_state_tn_id, 'Salem') RETURNING id INTO v_city_slm_id;
        INSERT INTO core.cities (state_id, name) VALUES (v_state_tx_id, 'Austin') RETURNING id INTO v_city_aus_id;
        INSERT INTO core.cities (state_id, name) VALUES (v_state_tx_id, 'Dallas') RETURNING id INTO v_city_dal_id;
        INSERT INTO core.cities (state_id, name) VALUES (v_state_ca_id, 'San Jose') RETURNING id INTO v_city_sj_id;

        -- =====================================================================================
        -- COMPANY 1: DURKKAS INNOVATIONS (INDIA)
        -- =====================================================================================
        INSERT INTO core.companies (name, code, email, country, subscription_plan, created_by)
        VALUES ('Durkkas Innovations Private Limited', 'DIPL', 'info@durkkas.in', 'India', 'ENTERPRISE', v_admin_user_id)
        RETURNING id INTO v_comp_dipl_id;

        -- Academic Year
        INSERT INTO core.academic_years (company_id, name, start_date, end_date, created_by)
        VALUES (v_comp_dipl_id, '2025-2026', '2025-04-01', '2026-03-31', v_admin_user_id);

        -- Company Admin User
        INSERT INTO app_auth.users (email, password_hash, first_name, display_name, is_active, created_by)
        VALUES ('sathish@durkkas.in', crypt('Durk@123', gen_salt('bf')), 'Sathish', 'Sathish Admin', TRUE, v_admin_user_id)
        RETURNING id INTO v_user_id;
        INSERT INTO app_auth.user_roles (user_id, role_id, company_id) VALUES (v_user_id, v_role_co_admin, v_comp_dipl_id);

        -- Global Designations for DIPL
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES (v_comp_dipl_id, 'Manager', 'MGR', 5, v_user_id) RETURNING id INTO v_desig_mgr;
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES (v_comp_dipl_id, 'Team Lead', 'TL', 4, v_user_id) RETURNING id INTO v_desig_lead;
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES (v_comp_dipl_id, 'Senior Engineer', 'SE', 3, v_user_id) RETURNING id INTO v_desig_eng;

        -- BRANCHES (DIPL)
        -- APK (HQ)
        INSERT INTO core.branches (company_id, name, code, is_head_office, city, state, created_by) 
        VALUES (v_comp_dipl_id, 'Aruppukottai', 'APK', TRUE, 'Aruppukottai', 'Tamil Nadu', v_user_id) RETURNING id INTO v_br_apk_id;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dipl_id, v_br_apk_id, 'Engineering', 'APK-ENG', v_user_id) RETURNING id INTO v_dept_apk_eng;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dipl_id, v_br_apk_id, 'Administration', 'APK-ADMIN', v_user_id) RETURNING id INTO v_dept_apk_admin;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dipl_id, v_br_apk_id, 'Human Resources', 'APK-HR', v_user_id) RETURNING id INTO v_dept_apk_hr;
        INSERT INTO core.locations (company_id, branch_id, name, city_id, created_by) VALUES (v_comp_dipl_id, v_br_apk_id, 'Main Floor', v_city_apk_id, v_user_id);
        
        -- Branch Admin
        INSERT INTO app_auth.users (email, password_hash, first_name, display_name, is_active, created_by) VALUES ('admin.apk@durkkas.in', crypt('Branch@123', gen_salt('bf')), 'Admin', 'Admin APK', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
        INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_br_admin, v_comp_dipl_id, v_br_apk_id);

        -- CBE
        INSERT INTO core.branches (company_id, name, code, city, state, created_by) VALUES (v_comp_dipl_id, 'Coimbatore', 'CBE', 'Coimbatore', 'Tamil Nadu', v_user_id) RETURNING id INTO v_br_cbe_id;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dipl_id, v_br_cbe_id, 'Engineering', 'CBE-ENG', v_user_id) RETURNING id INTO v_dept_cbe_eng;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dipl_id, v_br_cbe_id, 'Human Resources', 'CBE-HR', v_user_id) RETURNING id INTO v_dept_cbe_hr;
        INSERT INTO core.locations (company_id, branch_id, name, city_id, created_by) VALUES (v_comp_dipl_id, v_br_cbe_id, 'Server Room', v_city_cbe_id, v_user_id);

        -- MDU
        INSERT INTO core.branches (company_id, name, code, city, state, created_by) VALUES (v_comp_dipl_id, 'Madurai', 'MDU', 'Madurai', 'Tamil Nadu', v_user_id) RETURNING id INTO v_br_mdu_id;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dipl_id, v_br_mdu_id, 'Engineering', 'MDU-ENG', v_user_id) RETURNING id INTO v_dept_mdu_eng;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dipl_id, v_br_mdu_id, 'Administration', 'MDU-ADMIN', v_user_id) RETURNING id INTO v_dept_mdu_admin;
        INSERT INTO core.locations (company_id, branch_id, name, city_id, created_by) VALUES (v_comp_dipl_id, v_br_mdu_id, 'Conference Hall', v_city_mdu_id, v_user_id);

        -- CHE
        INSERT INTO core.branches (company_id, name, code, city, state, created_by) VALUES (v_comp_dipl_id, 'Chennai', 'CHE', 'Chennai', 'Tamil Nadu', v_user_id) RETURNING id INTO v_br_che_id;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dipl_id, v_br_che_id, 'Engineering', 'CHE-ENG', v_user_id) RETURNING id INTO v_dept_che_eng;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dipl_id, v_br_che_id, 'Human Resources', 'CHE-HR', v_user_id) RETURNING id INTO v_dept_che_hr;
        INSERT INTO core.locations (company_id, branch_id, name, city_id, created_by) VALUES (v_comp_dipl_id, v_br_che_id, 'Reception', v_city_che_id, v_user_id);

        -- APK Employees Mapping
        INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, created_by) VALUES ('karthik.apk@durkkas.in', crypt('Emp@123', gen_salt('bf')), 'Karthik', 'R', 'R. Karthik', TRUE, v_user_id) RETURNING id INTO v_admin_user_id;
        INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id) VALUES (v_admin_user_id, v_role_emp, v_comp_dipl_id, v_br_apk_id);
        INSERT INTO core.employees (company_id, branch_id, department_id, designation_id, employee_code, first_name, last_name, email, created_by) 
        VALUES (v_comp_dipl_id, v_br_apk_id, v_dept_apk_eng, v_desig_mgr, 'DIPL001', 'Karthik', 'R', 'karthik.apk@durkkas.in', v_user_id);

        -- =====================================================================================
        -- COMPANY 2: DURKKAS TECHNOLOGIES (USA)
        -- =====================================================================================
        INSERT INTO core.companies (name, code, email, country, subscription_plan, created_by)
        VALUES ('Durkkas Technologies LLC', 'DTUS', 'info@durkkas.us', 'USA', 'PREMIUM', v_user_id)
        RETURNING id INTO v_comp_tech_id;

        -- Designations Tech
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES (v_comp_tech_id, 'Solution Architect', 'ARC', 5, v_user_id) RETURNING id INTO v_desig_arch;
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES (v_comp_tech_id, 'Senior Developer', 'SDEV', 3, v_user_id) RETURNING id INTO v_desig_dev;
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES (v_comp_tech_id, 'QA Engineer', 'QA', 2, v_user_id) RETURNING id INTO v_desig_qa;

        -- BRANCHES (Tech)
        -- AUS
        INSERT INTO core.branches (company_id, name, code, is_head_office, city, state, country, created_by) VALUES (v_comp_tech_id, 'Austin', 'AUS', TRUE, 'Austin', 'Texas', 'USA', v_user_id) RETURNING id INTO v_br_aus_id;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_tech_id, v_br_aus_id, 'Engineering', 'AUS-ENG', v_user_id) RETURNING id INTO v_dept_aus_eng;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_tech_id, v_br_aus_id, 'Operations', 'AUS-OPS', v_user_id) RETURNING id INTO v_dept_aus_ops;
        INSERT INTO core.locations (company_id, branch_id, name, city_id, created_by) VALUES (v_comp_tech_id, v_br_aus_id, 'Austin Tech Hub', v_city_aus_id, v_user_id);

        -- =====================================================================================
        -- COMPANY 3: DURKKAS ACADEMY (INDIA)
        -- =====================================================================================
        INSERT INTO core.companies (name, code, email, country, subscription_plan, created_by)
        VALUES ('Durkkas Academy of Research and Education', 'DARE', 'info@durkkasedu.in', 'India', 'BASIC', v_user_id)
        RETURNING id INTO v_comp_dare_id;

        -- Designations DARE
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES (v_comp_dare_id, 'Professor', 'PROF', 5, v_user_id) RETURNING id INTO v_desig_prof;
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES (v_comp_dare_id, 'Lecturer', 'LEC', 3, v_user_id) RETURNING id INTO v_desig_lec;
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES (v_comp_dare_id, 'Admin Officer', 'AO', 3, v_user_id) RETURNING id INTO v_desig_ao;

        -- BRANCHES (DARE)
        -- MDU
        INSERT INTO core.branches (company_id, name, code, is_head_office, city, state, created_by) VALUES (v_comp_dare_id, 'Madurai', 'MDU', TRUE, 'Madurai', 'Tamil Nadu', v_user_id) RETURNING id INTO v_br_edu_mdu_id;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dare_id, v_br_edu_mdu_id, 'Academics', 'MDU-ACAD', v_user_id) RETURNING id INTO v_dept_edu_mdu_acad;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dare_id, v_br_edu_mdu_id, 'Research', 'MDU-RES', v_user_id) RETURNING id INTO v_dept_edu_mdu_res;
        INSERT INTO core.departments (company_id, branch_id, name, code, created_by) VALUES (v_comp_dare_id, v_br_edu_mdu_id, 'Administration', 'MDU-ADMIN', v_user_id) RETURNING id INTO v_dept_edu_mdu_admin;
        INSERT INTO core.locations (company_id, branch_id, name, city_id, created_by) VALUES (v_comp_dare_id, v_br_edu_mdu_id, 'Auditorium', v_city_mdu_id, v_user_id);

    END $$;

COMMIT;
