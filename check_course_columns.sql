-- Check ems.courses table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'ems' 
AND table_name = 'courses';
