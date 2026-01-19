-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 30 - FIX VARCHAR LENGTH CONSTRAINTS
-- Fixes "value too long for type character varying" errors
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO core, public;

-- 1. Drop the restrictive subscription plan constraint
ALTER TABLE core.companies DROP CONSTRAINT IF EXISTS check_subscription_plan;

-- 2. Increase phone field length to accommodate international formats
ALTER TABLE core.companies 
ALTER COLUMN phone TYPE VARCHAR(50);

-- 3. Increase postal_code length for international codes
ALTER TABLE core.companies 
ALTER COLUMN postal_code TYPE VARCHAR(50);

-- 4. Increase PAN number length if needed
ALTER TABLE core.companies 
ALTER COLUMN pan_number TYPE VARCHAR(50);

-- 5. Do the same for branches table
ALTER TABLE core.branches 
ALTER COLUMN phone TYPE VARCHAR(50);

ALTER TABLE core.branches 
ALTER COLUMN postal_code TYPE VARCHAR(50);

-- 6. Verification
DO $$
BEGIN
    RAISE NOTICE '✅ VARCHAR constraints relaxed for companies and branches tables';
END $$;
