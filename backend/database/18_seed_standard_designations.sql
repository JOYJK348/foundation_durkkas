-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 18 - DESIGNATION PROTOCOL RECOVERY
-- Ensures every organization has a base job title hierarchy
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
DECLARE
    comp_rec RECORD;
    admin_user_id BIGINT;
BEGIN
    -- For each company that has ZERO designations
    FOR comp_rec IN 
        SELECT id FROM core.companies c 
        WHERE NOT EXISTS (SELECT 1 FROM core.designations d WHERE d.company_id = c.id)
    LOOP
        -- Find a suitable creator (Company Admin or Platform Admin)
        SELECT u.id INTO admin_user_id 
        FROM app_auth.users u
        JOIN app_auth.user_roles ur ON ur.user_id = u.id
        WHERE ur.company_id = comp_rec.id OR ur.role_id = (SELECT id FROM app_auth.roles WHERE name = 'PLATFORM_ADMIN')
        LIMIT 1;

        IF admin_user_id IS NULL THEN admin_user_id := 1; END IF;

        RAISE NOTICE 'Seeding standard designations for company %', comp_rec.id;

        -- Insert standard hierarchy
        INSERT INTO core.designations (company_id, title, code, level, created_by) VALUES
        (comp_rec.id, 'General Manager', 'GM', 5, admin_user_id),
        (comp_rec.id, 'Department Head', 'HOD', 4, admin_user_id),
        (comp_rec.id, 'Team Lead', 'TL', 3, admin_user_id),
        (comp_rec.id, 'Senior Executive', 'SR-EXE', 2, admin_user_id),
        (comp_rec.id, 'Executive', 'EXE', 1, admin_user_id),
        (comp_rec.id, 'Support Staff', 'STF', 0, admin_user_id);
    END LOOP;
END $$;
