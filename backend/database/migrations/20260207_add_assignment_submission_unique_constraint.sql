-- Add unique constraint to assignment_submissions to allow upsert by assignment_id and student_id
ALTER TABLE ems.assignment_submissions
ADD CONSTRAINT assignment_submissions_unique_student_assignment UNIQUE (assignment_id, student_id);
