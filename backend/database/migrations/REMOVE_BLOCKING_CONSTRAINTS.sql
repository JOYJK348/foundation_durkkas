-- ==========================================================
-- FINAL DATABASE PATCH FOR CAREER GUIDANCE (CRM)
-- Run this in your SQL Editor to remove strict check constraints
-- ==========================================================

-- 1. Drop old constraints that might be blocking new form submissions
-- (Standardizing the table for flexible categorical data)

ALTER TABLE crm.career_guidance_applications DROP CONSTRAINT IF EXISTS career_guidance_applications_standard_year_check;
ALTER TABLE crm.career_guidance_applications DROP CONSTRAINT IF EXISTS career_guidance_applications_gender_check;
ALTER TABLE crm.career_guidance_applications DROP CONSTRAINT IF EXISTS career_guidance_applications_studies_preference_check;
ALTER TABLE crm.career_guidance_applications DROP CONSTRAINT IF EXISTS career_guidance_applications_abroad_local_check;
ALTER TABLE crm.career_guidance_applications DROP CONSTRAINT IF EXISTS career_guidance_applications_preferred_mode_of_study_check;
ALTER TABLE crm.career_guidance_applications DROP CONSTRAINT IF EXISTS career_guidance_applications_career_support_duration_check;
ALTER TABLE crm.career_guidance_applications DROP CONSTRAINT IF EXISTS career_guidance_applications_mentorship_required_check;

-- 2. Ensure all text columns are large enough for flexible data
ALTER TABLE crm.career_guidance_applications ALTER COLUMN standard_year TYPE VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ALTER COLUMN studies_preference TYPE VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ALTER COLUMN gender TYPE VARCHAR(50);
ALTER TABLE crm.career_guidance_applications ALTER COLUMN abroad_local TYPE VARCHAR(50);
ALTER TABLE crm.career_guidance_applications ALTER COLUMN preferred_mode_of_study TYPE VARCHAR(50);
ALTER TABLE crm.career_guidance_applications ALTER COLUMN career_support_duration TYPE VARCHAR(100);
ALTER TABLE crm.career_guidance_applications ALTER COLUMN mentorship_required TYPE VARCHAR(50);

-- 3. Double check and ensure new columns are available (safety)
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

-- 4. Mark old fields as optional
ALTER TABLE crm.career_guidance_applications ALTER COLUMN student_name DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN age DROP NOT NULL;
ALTER TABLE crm.career_guidance_applications ALTER COLUMN location DROP NOT NULL;

-- ==========================================================
-- END OF SCRIPT
-- ==========================================================
