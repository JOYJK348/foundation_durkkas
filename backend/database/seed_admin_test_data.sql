-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COMPANY ADMIN SETUP (DIPL ADMIN)
-- Purpose: Create Admin user for "DIPL" company to test the dashboard
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Create ADMIN user account
-- Password: admin@123 (hashed with bcrypt: $2a$10$DqHyGlWJwtyuiuO9/NkqoOY58bEAxzLD1UEETKNoYXY72p75fk0H.)
INSERT INTO app_auth.users (email, password_hash, first_name, last_name, display_name, is_active, is_verified)
SELECT 'admin@dipl.edu', '$2a$10$DqHyGlWJwtyuiuO9/NkqoOY58bEAxzLD1UEETKNoYXY72p75fk0H.', 'DIPL', 'Admin', 'DIPL Academy Admin', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM app_auth.users WHERE email = 'admin@dipl.edu');

-- Ensure password is correct
UPDATE app_auth.users 
SET password_hash = '$2a$10$DqHyGlWJwtyuiuO9/NkqoOY58bEAxzLD1UEETKNoYXY72p75fk0H.',
    is_active = TRUE,
    is_verified = TRUE
WHERE email = 'admin@dipl.edu';

-- 2. Ensure ADMIN Role exists with Level 4
UPDATE app_auth.roles 
SET level = 4 
WHERE name = 'ADMIN';

-- 3. Assign ADMIN role to the user (scoped to DIPL company)
INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id, is_active)
SELECT u.id, r.id, c.id, b.id, TRUE
FROM app_auth.users u
CROSS JOIN app_auth.roles r
CROSS JOIN core.companies c
LEFT JOIN core.branches b ON b.company_id = c.id AND b.code = 'DIPL-MAIN'
WHERE u.email = 'admin@dipl.edu'
  AND r.name = 'ADMIN'
  AND c.code = 'DIPL'
  AND NOT EXISTS (
      SELECT 1 FROM app_auth.user_roles ur 
      WHERE ur.user_id = u.id AND ur.role_id = r.id AND ur.company_id = c.id
  );

-- 4. Verify in Logs
DO $$
BEGIN
    RAISE NOTICE '✅ DIPL Admin Setup Complete!';
    RAISE NOTICE '📧 Email: admin@dipl.edu';
    RAISE NOTICE '🔑 Password: admin@123';
    RAISE NOTICE '🏢 Company: DIPL';
END $$;
