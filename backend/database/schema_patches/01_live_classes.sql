-- LIVE CLASSES
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
    
    meeting_platform VARCHAR(50) DEFAULT 'JITSI', -- JITSI, ZOOM, GOOGLE_MEET, EXTERNAL
    meeting_id VARCHAR(255), -- Unique slug for Jitsi
    external_link TEXT, -- For Zoom/Google Meet
    
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, COMPLETED, CANCELLED
    recording_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT
);
