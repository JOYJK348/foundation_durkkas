-- Add visibility and professional structure support to EMS
ALTER TABLE ems.course_modules ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'ENROLLED';
ALTER TABLE ems.lessons ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'ENROLLED';
ALTER TABLE ems.lessons ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'VIDEO'; -- VIDEO, TEXT, QUIZ, FILE
ALTER TABLE ems.lessons ADD COLUMN IF NOT EXISTS content_body TEXT; -- For text-based lessons

-- Add numbering support if needed (or we can use module_order/lesson_order)
-- For professional look, we will use module_order and lesson_order to generate 1.1, 1.2 dynamically on the frontend.

COMMENT ON COLUMN ems.course_modules.visibility IS 'PUBLIC (preview), ENROLLED (paid only), PRIVATE (draft)';
COMMENT ON COLUMN ems.lessons.visibility IS 'PUBLIC (preview), ENROLLED (paid only), PRIVATE (draft)';
