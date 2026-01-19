UPDATE core.branches 
SET enabled_modules = '["HR"]'::jsonb, 
    allowed_menu_ids = '[]'::jsonb 
WHERE id = 29;
