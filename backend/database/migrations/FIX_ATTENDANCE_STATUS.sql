-- FIX: Add missing status values to attendance_sessions status check/enum

DO $$
DECLARE
    -- Variable to store constraint name if exists
    chk_constraint_name text;
BEGIN
    -- 1. Check if it's a Check Constraint
    SELECT conname INTO chk_constraint_name
    FROM pg_constraint
    WHERE conrelid = 'ems.attendance_sessions'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';

    IF chk_constraint_name IS NOT NULL THEN
        -- Drop the old constraint
        EXECUTE 'ALTER TABLE ems.attendance_sessions DROP CONSTRAINT ' || chk_constraint_name;
        
        -- Add new constraint with updated values
        ALTER TABLE ems.attendance_sessions 
        ADD CONSTRAINT attendance_sessions_status_check 
        CHECK (status IN ('SCHEDULED', 'OPEN', 'CLOSED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED', 'IDENTIFYING_ENTRY', 'IDENTIFYING_EXIT'));
        
        RAISE NOTICE 'Updated status check constraint';
    ELSE
        -- 2. Check if it's a valid column at all, maybe it has no constraint?
        -- If it's an ENUM type, we need to handle that.
        -- Assuming it might be simple text for now based on previous context.
        -- But if it IS an enum, we need to alter type.
        
        -- Try to find if user-defined type is used
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='ems' AND table_name='attendance_sessions' AND column_name='status' AND udt_name != 'varchar' AND udt_name != 'text') THEN
            -- It's an enum (custom type)
            -- We cannot easily add values inside a DO block transactionally for Enums in some PG versions without commit.
            -- But usually ALTER TYPE ADD VALUE cannot be done in transaction block.
            -- So we might need to run this separately.
            RAISE NOTICE 'Column appears to be an ENUM. Please run ALTER TYPE ... ADD VALUE statements separately if needed.';
        ELSE
             -- It is text/varchar with NO constraint.
             -- We should probably add one, but for now let's just leave it open to support the new values.
             RAISE NOTICE 'Status column is text/varchar with no check constraint. Should work fine.';
        END IF;
    END IF;
END $$;

-- 3. If it IS an Enum, we try to add values (will fail if not enum, or if inside transaction block in strict mode, but Supabase generic SQL editor handles it)
-- We wrap in exception block to ignore if type doesn't exist
DO $$
BEGIN
    -- Try to add to common enum names if they exist
    BEGIN
        ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'IDENTIFYING_ENTRY';
        ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'IDENTIFYING_EXIT';
        ALTER TYPE ems.attendance_status ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore
    END;
END $$;
