
-- Fix Attendance Sessions Schema
ALTER TABLE ems.attendance_sessions 
ADD COLUMN IF NOT EXISTS class_mode VARCHAR(20) DEFAULT 'OFFLINE',
ADD COLUMN IF NOT EXISTS require_face_verification BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS live_class_id BIGINT,
ADD COLUMN IF NOT EXISTS require_location_verification BOOLEAN DEFAULT TRUE;

-- Update existing sessions
UPDATE ems.attendance_sessions SET class_mode = 'OFFLINE' WHERE class_mode IS NULL;
UPDATE ems.attendance_sessions SET require_face_verification = FALSE WHERE require_face_verification IS NULL;
