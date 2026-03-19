-- Add handbook_type and batch_id to course_materials table
-- This allows proper categorization of materials for tutors vs students

ALTER TABLE ems.course_materials 
ADD COLUMN IF NOT EXISTS handbook_type VARCHAR(50) DEFAULT 'STUDENT_HANDBOOK',
ADD COLUMN IF NOT EXISTS batch_id BIGINT REFERENCES ems.batches(id),
ADD COLUMN IF NOT EXISTS material_description TEXT,
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(50) DEFAULT 'STUDENTS';

-- Add check constraint for handbook_type
ALTER TABLE ems.course_materials 
DROP CONSTRAINT IF EXISTS course_materials_handbook_type_check;

ALTER TABLE ems.course_materials 
ADD CONSTRAINT course_materials_handbook_type_check 
CHECK (handbook_type IN ('TUTOR_HANDBOOK', 'STUDENT_HANDBOOK', 'GENERAL_RESOURCE'));

-- Add check constraint for target_audience
ALTER TABLE ems.course_materials 
DROP CONSTRAINT IF EXISTS course_materials_target_audience_check;

ALTER TABLE ems.course_materials 
ADD CONSTRAINT course_materials_target_audience_check 
CHECK (target_audience IN ('TUTORS', 'STUDENTS', 'BOTH'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_course_materials_handbook_type ON ems.course_materials(handbook_type);
CREATE INDEX IF NOT EXISTS idx_course_materials_batch_id ON ems.course_materials(batch_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_target_audience ON ems.course_materials(target_audience);

COMMENT ON COLUMN ems.course_materials.handbook_type IS 'Type of handbook: TUTOR_HANDBOOK, STUDENT_HANDBOOK, or GENERAL_RESOURCE';
COMMENT ON COLUMN ems.course_materials.batch_id IS 'Optional batch assignment for batch-specific materials';
COMMENT ON COLUMN ems.course_materials.target_audience IS 'Who can access: TUTORS, STUDENTS, or BOTH';
