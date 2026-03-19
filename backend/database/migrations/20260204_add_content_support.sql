-- Migration: Add structured content support to course_materials
-- This allows admins to paste text-based curriculum (1.1, 1.2, etc) instead of uploading files.

ALTER TABLE ems.course_materials 
ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20) DEFAULT 'FILE', -- 'FILE' or 'CONTENT'
ADD COLUMN IF NOT EXISTS content_json JSONB, -- Stores structured content [{title: "1.1", body: "..."}]
ALTER COLUMN file_url DROP NOT NULL;

COMMENT ON COLUMN ems.course_materials.delivery_method IS 'How the material is delivered: FILE (upload) or CONTENT (manual text)';
COMMENT ON COLUMN ems.course_materials.content_json IS 'Structured text content for manual delivery method';
