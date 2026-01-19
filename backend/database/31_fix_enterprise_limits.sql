-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 31 - FIX ENTERPRISE PLAN LIMITS
-- Update all companies on ENTERPRISE plan to have unlimited (0) limits
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Update ENTERPRISE plan companies to have unlimited limits
UPDATE core.companies 
SET 
    max_users = 0,
    max_employees = 0,
    max_branches = 0,
    max_departments = 0,
    max_designations = 0,
    updated_at = NOW()
WHERE subscription_plan = 'ENTERPRISE';

-- Verify the update
SELECT 
    id,
    name,
    subscription_plan,
    max_users,
    max_employees,
    max_branches,
    max_departments,
    max_designations
FROM core.companies
WHERE subscription_plan = 'ENTERPRISE';
