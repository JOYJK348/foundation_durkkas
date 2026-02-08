-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- URGENT PRODUCTION FIX: Attendance Status Column
-- Version 1.1 (Non-transactional)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- NOTE: Run these statements individually if you see "cannot be executed from a function"
-- These are designed to be run in the Supabase SQL Editor.

-- 1. Add values to the ENUM type (if it exists)
-- Postgres 13+ supports IF NOT EXISTS for ADD VALUE.
-- These MUST be run outside of a DO block/transaction.

ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'IDENTIFYING_ENTRY';
ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'IDENTIFYING_EXIT';
ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'COMPLETED';

-- 2. Update CHECK constraint on attendance_sessions table
-- This part CAN stay in a DO block to be safer with existence checks
DO $$
BEGIN
    -- Drop existing status constraint if it exists (try common names)
    ALTER TABLE ems.attendance_sessions DROP CONSTRAINT IF EXISTS attendance_sessions_status_check;
    ALTER TABLE ems.attendance_sessions DROP CONSTRAINT IF EXISTS status_check;
    
    -- Add the new comprehensive constraint
    -- This handles cases where the column is TEXT rather than ENUM
    BEGIN
        ALTER TABLE ems.attendance_sessions ADD CONSTRAINT attendance_sessions_status_check 
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
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not add check constraint - column might be non-text or already restricted by type';
    END;
END $$;

-- 3. Verify status column type and constraints
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'ems' 
  AND table_name = 'attendance_sessions' 
  AND column_name = 'status';
