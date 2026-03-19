-- ============================================================================
-- LIVE CLASSES TABLE CREATION
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create the live_classes table
CREATE TABLE IF NOT EXISTS ems.live_classes (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES ems.courses(id) ON DELETE CASCADE,
    batch_id BIGINT REFERENCES ems.batches(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES core.employees(id),
    
    class_title VARCHAR(255) NOT NULL,
    class_description TEXT,
    
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    meeting_platform VARCHAR(50) DEFAULT 'JITSI',
    meeting_id VARCHAR(255),
    external_link TEXT,
    
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    recording_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ems_live_classes_company ON ems.live_classes(company_id);
CREATE INDEX IF NOT EXISTS idx_ems_live_classes_course ON ems.live_classes(course_id);
CREATE INDEX IF NOT EXISTS idx_ems_live_classes_tutor ON ems.live_classes(tutor_id);
CREATE INDEX IF NOT EXISTS idx_ems_live_classes_date ON ems.live_classes(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_ems_live_classes_status ON ems.live_classes(status);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_live_classes_updated_at ON ems.live_classes;
CREATE TRIGGER update_live_classes_updated_at 
    BEFORE UPDATE ON ems.live_classes 
    FOR EACH ROW 
    EXECUTE FUNCTION ems.update_updated_at_column();

-- Verify table creation
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'ems' AND table_name = 'live_classes'
    ) THEN
        RAISE NOTICE '✅ ems.live_classes table created successfully!';
    ELSE
        RAISE EXCEPTION '❌ Failed to create ems.live_classes table';
    END IF;
END $$;
