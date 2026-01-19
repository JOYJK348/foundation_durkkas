-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- UPDATE SUBSCRIPTION PLAN CONSTRAINT
-- Fixes "violates check constraint check_subscription_plan" error
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Drop the old constraint that only allowed (TRIAL, PRO, ENTERPRISE)
ALTER TABLE core.companies DROP CONSTRAINT IF EXISTS check_subscription_plan;

-- 2. Add the new constraint that supports the new tiers (BASIC, PREMIUM)
ALTER TABLE core.companies 
ADD CONSTRAINT check_subscription_plan 
CHECK (subscription_plan IN ('TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE'));

-- 3. Verify the change (Optional)
-- INSERT INTO core.companies (name, code, subscription_plan) VALUES ('Test', 'TEST', 'BASIC'); -- Should work now
