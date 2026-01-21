-- ==========================================================
-- FINAL FIX FOR CAREER GUIDANCE SUITABILITY TEST (CRM)
-- Run this in your SQL Editor (Supabase or PgAdmin)
-- ==========================================================

-- 1. Ensure the crm schema exists (safety check)
CREATE SCHEMA IF NOT EXISTS crm;

-- 2. Drop constraints that might cause conflicts during update (optional, but safer)
-- (We'll skip dropping for now to avoid breaking existing data)

-- 3. Add all missing columns for Suitability Test
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS candidate_name VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS education_level VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS well_performing_subjects TEXT;
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS enjoyed_activities VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS prefer_working_with VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS solve_problems_logically VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS enjoy_creative_tasks VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS test_reason VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS comfortable_with_assessments VARCHAR(255);

-- 4. Update existing columns to be optional (ALLOW NULLS)
-- This is critical because the new form uses different fields than the old one
ALTER TABLE crm.career_guidance_applications ALTER COLUMN student_name DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN standard_year DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN date_of_birth DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN location DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN contact_number DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN email DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN parent_guardian_name DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN studies_preference DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN abroad_local DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN preferred_mode_of_study DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN career_support_duration DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN mentorship_required DROP NOT NULL;

-- 5. Standardize column types (safety check)
ALTER TABLE crm.career_guidance_applications ALTER COLUMN standard_year TYPE VARCHAR(50);
ALTER TABLE crm.career_guidance_applications ALTER COLUMN studies_preference TYPE VARCHAR(100);

-- 6. Add category identifiers if missing
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS category VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS categoryname VARCHAR(255);

-- ==========================================================
-- END OF SCRIPT
-- ==========================================================
