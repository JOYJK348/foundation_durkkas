-- ============================================================================
-- ASSIGN ACADEMIC_MANAGER ROLE TO RAJESH (WITH COMPANY ID SCOPE)
-- ============================================================================

DO $$
DECLARE
    v_user_id INT;
    v_role_id INT;
BEGIN
    -- 1. Get Rajesh's User ID
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'rajesh.kumar@durkkas.com';
    
    -- 2. Get ACADEMIC_MANAGER Role ID
    SELECT id INTO v_role_id FROM app_auth.roles WHERE name = 'ACADEMIC_MANAGER' LIMIT 1;
    
    IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        -- 3. Delete existing roles for this user
        DELETE FROM app_auth.user_roles WHERE user_id = v_user_id;
        
        -- 4. Assign the role WITH scope (Company ID 13)
        INSERT INTO app_auth.user_roles (user_id, role_id, company_id, created_at)
        VALUES (v_user_id, v_role_id, 13, NOW());
        
        RAISE NOTICE '✅ Successfully assigned Academic Manager to Rajesh for Company 13';
    END IF;
END $$;

-- Verify the result
SELECT 
    u.email,
    ur.company_id,
    r.name as role_name,
    '✅ FIXED' as status
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
WHERE u.email = 'rajesh.kumar@durkkas.com';
