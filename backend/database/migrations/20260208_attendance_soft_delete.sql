-- Add soft delete and reason tracking to attendance_sessions
DO $$
BEGIN
    -- Add cancellation_reason
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'cancellation_reason') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN cancellation_reason TEXT;
    END IF;

    -- Add cancelled_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'cancelled_at') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;

    -- Add cancelled_by (Using BIGINT to match app_auth.users id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'cancelled_by') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN cancelled_by BIGINT;
        -- Adding FK if possible, but keeping it flexible for now as schema might vary across deployments
        -- ALTER TABLE ems.attendance_sessions ADD CONSTRAINT fk_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES app_auth.users(id);
    END IF;

END $$;
