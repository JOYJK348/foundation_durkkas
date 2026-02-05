-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIX BATCH DATES FOR REAL-TIME ATTENDANCE TESTING
-- Sets batch start dates to past so they are active TODAY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UPDATE ems.batches
SET 
    start_date = CURRENT_DATE - INTERVAL '5 days',
    end_date = CURRENT_DATE + INTERVAL '90 days',
    is_active = true,
    status = 'ACTIVE'
WHERE batch_code IN ('FS-MORN-FEB26', 'FS-EVE-FEB26', 'DS-WKND-FEB26', 'DM-FAST-FEB26');

-- Optional: Ensure user's preferred date/time columns are also set if needed
-- start_time and end_time usually default to 09:00 and 10:00 in seed data.

RAISE NOTICE 'Batches updated. They should now appear in the Attendance Management dashboard for today.';
