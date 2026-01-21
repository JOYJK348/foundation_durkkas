-- Migration to add Study Abroad Guidance fields to Career Guidance table
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS current_qualification VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS highest_qualification_completed VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS academic_score_gpa VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS medium_of_instruction VARCHAR(100);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS intended_level_of_study VARCHAR(100);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS english_test_status VARCHAR(100);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS target_intake_year VARCHAR(50);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS budget_range VARCHAR(255);

-- Ensure previous Suitability Test fields are here too just in case
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS candidate_name VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS education_level VARCHAR(255);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);
ALTER TABLE crm.career_guidance_applications ADD COLUMN IF NOT EXISTS city VARCHAR(255);
