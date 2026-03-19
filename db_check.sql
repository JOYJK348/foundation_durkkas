-- CHECK ATTENDANCE SYSTEM STATUS
SELECT 'Companies' as check, count(*) FROM core.companies;
SELECT 'Locations' as check, count(*) FROM core.locations WHERE company_id = 13;
SELECT 'Inst Locations' as check, count(*) FROM ems.institution_locations WHERE company_id = 13;
SELECT 'Sessions' as check, id, status, require_location_verification FROM ems.attendance_sessions WHERE company_id = 13 AND session_date = CURRENT_DATE;

-- Check functions
SELECT proname, nspname 
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE proname = 'verify_location';
