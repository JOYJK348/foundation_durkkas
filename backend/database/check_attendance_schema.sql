SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'ems' AND table_name = 'attendance_records';

SELECT
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM
    pg_constraint c
JOIN
    pg_namespace n ON n.oid = c.connamespace
WHERE
    n.nspname = 'ems' AND conrelid = 'ems.attendance_records'::regclass;
