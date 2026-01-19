UPDATE core.branches 
SET deleted_at = NULL, 
    is_active = TRUE, 
    enabled_modules = '["HR", "ATTENDANCE"]'::jsonb
WHERE id = 29;

-- Also ensure the user has the correct role and branch mapping
UPDATE app_auth.user_roles
SET branch_id = 29, 
    company_id = 11
WHERE user_id = (SELECT id FROM app_auth.users WHERE email = 'jk66@gmail.com');
