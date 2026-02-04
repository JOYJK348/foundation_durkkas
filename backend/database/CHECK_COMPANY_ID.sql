-- Quick check: What company_id do we have?
SELECT id, company_name FROM core.companies ORDER BY id LIMIT 5;

-- Also check if Dare Academy exists
SELECT id, company_name FROM core.companies WHERE company_name LIKE '%Dare%';
