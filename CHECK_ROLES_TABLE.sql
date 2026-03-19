-- ============================================================================
-- CHECK ROLES TABLE STRUCTURE
-- ============================================================================

-- Show roles table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'app_auth'
AND table_name = 'roles'
ORDER BY ordinal_position;

-- Show existing roles
SELECT * FROM app_auth.roles ORDER BY id;
