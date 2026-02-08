-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- URGENT PRODUCTION FIX: Attendance Status Column (Text Constraint Version)
-- Version 1.2 (Optimized for Text Columns)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Remove ANY existing status constraints to clear the way
-- We attempt to drop standard names used by Supabase/Postgres
DO $$
BEGIN
    -- Drop common constraint names
    ALTER TABLE ems.attendance_sessions DROP CONSTRAINT IF EXISTS attendance_sessions_status_check;
    ALTER TABLE ems.attendance_sessions DROP CONSTRAINT IF EXISTS status_check;
    ALTER TABLE ems.attendance_sessions DROP CONSTRAINT IF EXISTS attendance_sessions_status_check1;
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'No constraint found to drop, proceeding...';
END $$;

-- 2. Add the comprehensive constraint allowing new statuses
ALTER TABLE ems.attendance_sessions 
ADD CONSTRAINT attendance_sessions_status_check 
CHECK (status IN (
    'SCHEDULED', 
    'OPEN', 
    'IDENTIFYING_ENTRY', 
    'IDENTIFYING_EXIT', 
    'IN_PROGRESS', 
    'COMPLETED', 
    'CANCELLED', 
    'DELETED'
));

-- 3. Verification: Check current configuration
SELECT 
    conname as constraint_name, 
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'ems.attendance_sessions'::regclass 
AND contype = 'c';
