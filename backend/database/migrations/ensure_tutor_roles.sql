-- Ensure TUTOR role exists
INSERT INTO app_auth.roles (name, display_name, description, role_type, product, level, is_system_role)
VALUES ('TUTOR', 'EMS Tutor', 'Instructor/Tutor for EMS module', 'PRODUCT', 'EMS', 2, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Ensure ACADEMIC_MANAGER role exists (if not already)
INSERT INTO app_auth.roles (name, display_name, description, role_type, product, level, is_system_role)
VALUES ('ACADEMIC_MANAGER', 'Academic Manager', 'Manages academic activities, tutors, and students', 'PRODUCT', 'EMS', 3, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Add user_id to core.employees if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'core' AND table_name = 'employees' AND column_name = 'user_id') THEN
        ALTER TABLE core.employees ADD COLUMN user_id BIGINT REFERENCES app_auth.users(id);
    END IF;
END $$;
