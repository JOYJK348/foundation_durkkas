-- Migration: Enhance course_materials with Module support and improved metadata
-- This supports the Courses -> Modules -> Lessons -> Materials hierarchy.

ALTER TABLE ems.course_materials 
ADD COLUMN IF NOT EXISTS module_id BIGINT REFERENCES ems.course_modules(id);

-- Ensure we have indexes for performance in the hierarchy
CREATE INDEX IF NOT EXISTS idx_course_materials_module_id ON ems.course_materials(module_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_lesson_id ON ems.course_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_handbook_type ON ems.course_materials(handbook_type);

COMMENT ON COLUMN ems.course_materials.module_id IS 'Link to ems.course_modules for module-level assets';
