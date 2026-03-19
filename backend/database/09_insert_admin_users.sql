-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INSERT ADMIN USERS WITH CORRECT PASSWORD HASH
-- Password: durkkas@2026
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
DECLARE
    v_platform_admin_id BIGINT;
    v_system_admin_id BIGINT;
    v_platform_role_id BIGINT;
    v_company_role_id BIGINT;
    -- Bcrypt hash for "durkkas@2026" (generated with bcrypt rounds=10)
    v_hashed_password TEXT := '$2a$10$VS71ar24fxQvfiEd9ps8FO2zaLytxqNdtbGX6PWxCjikllq3eHbM6';
BEGIN
    -- Get Role IDs
    SELECT id INTO v_platform_role_id FROM app_auth.roles WHERE name = 'PLATFORM_ADMIN';
    SELECT id INTO v_company_role_id FROM app_auth.roles WHERE name = 'COMPANY_ADMIN';

    -- Check if roles exist
    IF v_platform_role_id IS NULL OR v_company_role_id IS NULL THEN
        RAISE EXCEPTION 'Roles not found! Please run 02_auth_schema.sql first.';
    END IF;

    -- 1. Create Platform Admin
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, is_active, is_verified)
    VALUES ('platform.admin@durkkas.com', v_hashed_password, 'Platform', 'Admin', TRUE, TRUE)
    ON CONFLICT (email) DO UPDATE
    SET password_hash = v_hashed_password,
        is_active = TRUE,
        is_verified = TRUE
    RETURNING id INTO v_platform_admin_id;

    -- Assign Platform Admin role (company_id = NULL for global access)
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, is_active)
    VALUES (v_platform_admin_id, v_platform_role_id, NULL, TRUE)
    ON CONFLICT (user_id, role_id, company_id, branch_id) DO NOTHING;

    -- 2. Create System Admin (Company Admin for ABC School)
    INSERT INTO app_auth.users (email, password_hash, first_name, last_name, is_active, is_verified)
    VALUES ('system.admin@durkkas.com', v_hashed_password, 'System', 'Admin', TRUE, TRUE)
    ON CONFLICT (email) DO UPDATE
    SET password_hash = v_hashed_password,
        is_active = TRUE,
        is_verified = TRUE
    RETURNING id INTO v_system_admin_id;

    -- Assign Company Admin role for company_id = 1 (ABC School)
    INSERT INTO app_auth.user_roles (user_id, role_id, company_id, is_active)
    VALUES (v_system_admin_id, v_company_role_id, 1, TRUE)
    ON CONFLICT (user_id, role_id, company_id, branch_id) DO NOTHING;

    RAISE NOTICE '✅ Admin users created successfully!';
    RAISE NOTICE '📧 Platform Admin: platform.admin@durkkas.com';
    RAISE NOTICE '📧 System Admin: system.admin@durkkas.com';
    RAISE NOTICE '🔑 Password: durkkas@2026';
END $$;
