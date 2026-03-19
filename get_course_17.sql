-- Get Course 17 details
SELECT id, company_id, course_name, enabled_practice_modules 
FROM ems.courses 
WHERE id = 17;

-- Get company details
SELECT id, name FROM core.companies WHERE id = (SELECT company_id FROM ems.courses WHERE id = 17);
