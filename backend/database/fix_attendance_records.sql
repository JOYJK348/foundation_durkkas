ALTER TABLE ems.attendance_records ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE ems.attendance_records DROP CONSTRAINT IF EXISTS attendance_records_session_student_unique;
ALTER TABLE ems.attendance_records ADD CONSTRAINT attendance_records_session_student_unique UNIQUE (session_id, student_id);
