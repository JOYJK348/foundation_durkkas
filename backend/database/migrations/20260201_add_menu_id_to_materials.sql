-- Migration: Add menu_id to course_materials
-- This allows attaching materials to specific sidebar menus/categories instead of just courses.

ALTER TABLE ems.course_materials 
ADD COLUMN IF NOT EXISTS menu_id BIGINT REFERENCES app_auth.menu_registry(id),
ALTER COLUMN course_id DROP NOT NULL;

COMMENT ON COLUMN ems.course_materials.menu_id IS 'Link to app_auth.menu_registry for menu-specific documentation/materials';
