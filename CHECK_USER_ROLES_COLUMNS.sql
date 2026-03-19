-- ============================================================================
-- CHECK USER_ROLES TABLE COLUMNS
-- ============================================================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'app_auth'
AND table_name = 'user_roles'
ORDER BY ordinal_position;
