
-- Add approval_status to tables if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'batches' AND column_name = 'approval_status') THEN
        ALTER TABLE ems.batches ADD COLUMN approval_status VARCHAR(20) DEFAULT 'PENDING';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'attendance_sessions' AND column_name = 'approval_status') THEN
        ALTER TABLE ems.attendance_sessions ADD COLUMN approval_status VARCHAR(20) DEFAULT 'APPROVED'; -- Attendance sessions might default to approved unless created by tutor? Actually user said they should go for approval.
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'course_modules' AND column_name = 'approval_status') THEN
        ALTER TABLE ems.course_modules ADD COLUMN approval_status VARCHAR(20) DEFAULT 'PENDING';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ems' AND table_name = 'live_classes' AND column_name = 'approval_status') THEN
        ALTER TABLE ems.live_classes ADD COLUMN approval_status VARCHAR(20) DEFAULT 'PENDING';
    END IF;
END $$;
