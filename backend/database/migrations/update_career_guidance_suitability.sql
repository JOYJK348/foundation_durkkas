-- Migration to update career_guidance_applications table
-- Add new columns if they don't exist
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

-- Make old columns optional for Suitability Test flexibility
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
