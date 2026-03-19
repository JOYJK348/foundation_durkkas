-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MIGRATION: ADD IS_PUBLISHED TO CONTENT TABLES
-- Purpose: Enable granular visibility control for Academic Managers/Tutors
-- Tables: course_modules, lessons, course_materials
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Add is_published to COURSE MODULES (Default FALSE for security)
ALTER TABLE ems.course_modules 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- 2. Add is_published to LESSONS (Default FALSE)
ALTER TABLE ems.lessons 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- 3. Add is_published to COURSE MATERIALS (Default FALSE)
ALTER TABLE ems.course_materials 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- 4. Retroactively set existing content to published (Optional, but good for UX on migration)
-- Un-comment if you want existing data to be visible immediately
-- UPDATE ems.course_modules SET is_published = TRUE;
-- UPDATE ems.lessons SET is_published = TRUE;
-- UPDATE ems.course_materials SET is_published = TRUE;

COMMENT ON COLUMN ems.course_modules.is_published IS 'Visibility toggle for students at module level';
COMMENT ON COLUMN ems.lessons.is_published IS 'Visibility toggle for students at lesson level';
COMMENT ON COLUMN ems.course_materials.is_published IS 'Visibility toggle for students at individual material level';
