-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 13 - UPDATE GET USER PERMISSIONS FUNCTION
-- Combine Role-based permissions with User-specific overrides
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION app_auth.get_user_permissions(p_user_id BIGINT)
RETURNS TABLE(permission_name VARCHAR) AS $$
BEGIN
    RETURN QUERY
    -- 1. Role-based permissions
    SELECT p.name::VARCHAR
    FROM app_auth.user_roles ur
    JOIN app_auth.role_permissions rp ON ur.role_id = rp.role_id
    JOIN app_auth.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND ur.is_active = TRUE
      AND p.is_active = TRUE
    
    UNION
    
    -- 2. User-specific overrides (from granular permissions)
    SELECT p.name::VARCHAR
    FROM app_auth.user_permissions up
    JOIN app_auth.permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT EXECUTE ON FUNCTION app_auth.get_user_permissions(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION app_auth.get_user_permissions(BIGINT) TO service_role;

COMMENT ON FUNCTION app_auth.get_user_permissions IS 'Returns combined permissions from Role and User-Specific overrides';
