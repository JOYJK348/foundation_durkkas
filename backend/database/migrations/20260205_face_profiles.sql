-- Migration: Create Face Profiles Table
-- Created: 2026-02-05

CREATE TABLE IF NOT EXISTS ems.student_face_profiles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL UNIQUE,
    primary_face_url TEXT,
    face_embedding JSONB, -- Storing 128D mathematical vector
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    registration_device_info JSONB,
    confidence_score FLOAT DEFAULT 95.0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES ems.students(id) ON DELETE CASCADE
);

-- Add index for student search
CREATE INDEX IF NOT EXISTS idx_face_profiles_student ON ems.student_face_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_face_profiles_company ON ems.student_face_profiles(company_id);

RAISE NOTICE '✅ Face profiles table created successfully';
