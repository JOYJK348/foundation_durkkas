-- ============================================================================
-- EMS APPROVAL WORKFLOW MIGRATION
-- Description: Add approval workflow columns to EMS tables
-- Date: 2026-02-02
-- ============================================================================

-- ============================================================================
-- 1. ADD APPROVAL COLUMNS TO ASSIGNMENTS
-- ============================================================================
ALTER TABLE ems.assignments 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES core.employees(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS submitted_for_approval_at TIMESTAMPTZ;

COMMENT ON COLUMN ems.assignments.approval_status IS 'Approval status: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED';
COMMENT ON COLUMN ems.assignments.approved_by IS 'Manager who approved/rejected';
COMMENT ON COLUMN ems.assignments.approved_at IS 'Timestamp of approval';
COMMENT ON COLUMN ems.assignments.rejection_reason IS 'Reason for rejection (if rejected)';

-- ============================================================================
-- 2. ADD APPROVAL COLUMNS TO QUIZZES
-- ============================================================================
ALTER TABLE ems.quizzes 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES core.employees(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS submitted_for_approval_at TIMESTAMPTZ;

COMMENT ON COLUMN ems.quizzes.approval_status IS 'Approval status: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED';
COMMENT ON COLUMN ems.quizzes.approved_by IS 'Manager who approved/rejected';
COMMENT ON COLUMN ems.quizzes.approved_at IS 'Timestamp of approval';
COMMENT ON COLUMN ems.quizzes.rejection_reason IS 'Reason for rejection (if rejected)';

-- ============================================================================
-- 3. ADD APPROVAL COLUMNS TO COURSE MATERIALS
-- ============================================================================
ALTER TABLE ems.course_materials 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES core.employees(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS submitted_for_approval_at TIMESTAMPTZ;

COMMENT ON COLUMN ems.course_materials.approval_status IS 'Approval status: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED';
COMMENT ON COLUMN ems.course_materials.approved_by IS 'Manager who approved/rejected';
COMMENT ON COLUMN ems.course_materials.approved_at IS 'Timestamp of approval';
COMMENT ON COLUMN ems.course_materials.rejection_reason IS 'Reason for rejection (if rejected)';

-- ============================================================================
-- 4. ADD APPROVAL COLUMNS TO LIVE CLASSES
-- ============================================================================
ALTER TABLE ems.live_classes 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES core.employees(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS submitted_for_approval_at TIMESTAMPTZ;

COMMENT ON COLUMN ems.live_classes.approval_status IS 'Approval status: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED';
COMMENT ON COLUMN ems.live_classes.approved_by IS 'Manager who approved/rejected';
COMMENT ON COLUMN ems.live_classes.approved_at IS 'Timestamp of approval';
COMMENT ON COLUMN ems.live_classes.rejection_reason IS 'Reason for rejection (if rejected)';

-- ============================================================================
-- 5. CREATE APPROVAL HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ems.approval_history (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    
    -- What is being approved
    entity_type VARCHAR(50) NOT NULL, -- 'ASSIGNMENT', 'QUIZ', 'MATERIAL', 'LIVE_CLASS'
    entity_id BIGINT NOT NULL,
    
    -- Who and when
    action VARCHAR(50) NOT NULL, -- 'SUBMITTED', 'APPROVED', 'REJECTED'
    action_by BIGINT NOT NULL REFERENCES core.employees(id),
    action_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Details
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    comments TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_history_entity ON ems.approval_history(entity_type, entity_id);
CREATE INDEX idx_approval_history_company ON ems.approval_history(company_id);
CREATE INDEX idx_approval_history_action_by ON ems.approval_history(action_by);

COMMENT ON TABLE ems.approval_history IS 'Tracks all approval workflow actions';

-- ============================================================================
-- 6. UPDATE EXISTING DATA (Set to APPROVED for backward compatibility)
-- ============================================================================
UPDATE ems.assignments SET approval_status = 'APPROVED' WHERE approval_status IS NULL;
UPDATE ems.quizzes SET approval_status = 'APPROVED' WHERE approval_status IS NULL;
UPDATE ems.course_materials SET approval_status = 'APPROVED' WHERE approval_status IS NULL;
UPDATE ems.live_classes SET approval_status = 'APPROVED' WHERE approval_status IS NULL;

-- ============================================================================
-- 7. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to submit for approval
CREATE OR REPLACE FUNCTION ems.submit_for_approval(
    p_entity_type VARCHAR,
    p_entity_id BIGINT,
    p_submitted_by BIGINT,
    p_company_id BIGINT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Update entity status
    CASE p_entity_type
        WHEN 'ASSIGNMENT' THEN
            UPDATE ems.assignments 
            SET approval_status = 'PENDING_APPROVAL',
                submitted_for_approval_at = NOW()
            WHERE id = p_entity_id;
        WHEN 'QUIZ' THEN
            UPDATE ems.quizzes 
            SET approval_status = 'PENDING_APPROVAL',
                submitted_for_approval_at = NOW()
            WHERE id = p_entity_id;
        WHEN 'MATERIAL' THEN
            UPDATE ems.course_materials 
            SET approval_status = 'PENDING_APPROVAL',
                submitted_for_approval_at = NOW()
            WHERE id = p_entity_id;
        WHEN 'LIVE_CLASS' THEN
            UPDATE ems.live_classes 
            SET approval_status = 'PENDING_APPROVAL',
                submitted_for_approval_at = NOW()
            WHERE id = p_entity_id;
    END CASE;
    
    -- Log in history
    INSERT INTO ems.approval_history (
        company_id, entity_type, entity_id, action, action_by, 
        previous_status, new_status
    ) VALUES (
        p_company_id, p_entity_type, p_entity_id, 'SUBMITTED', p_submitted_by,
        'DRAFT', 'PENDING_APPROVAL'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to approve
CREATE OR REPLACE FUNCTION ems.approve_content(
    p_entity_type VARCHAR,
    p_entity_id BIGINT,
    p_approved_by BIGINT,
    p_company_id BIGINT,
    p_comments TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Update entity status
    CASE p_entity_type
        WHEN 'ASSIGNMENT' THEN
            UPDATE ems.assignments 
            SET approval_status = 'APPROVED',
                approved_by = p_approved_by,
                approved_at = NOW()
            WHERE id = p_entity_id;
        WHEN 'QUIZ' THEN
            UPDATE ems.quizzes 
            SET approval_status = 'APPROVED',
                approved_by = p_approved_by,
                approved_at = NOW()
            WHERE id = p_entity_id;
        WHEN 'MATERIAL' THEN
            UPDATE ems.course_materials 
            SET approval_status = 'APPROVED',
                approved_by = p_approved_by,
                approved_at = NOW()
            WHERE id = p_entity_id;
        WHEN 'LIVE_CLASS' THEN
            UPDATE ems.live_classes 
            SET approval_status = 'APPROVED',
                approved_by = p_approved_by,
                approved_at = NOW()
            WHERE id = p_entity_id;
    END CASE;
    
    -- Log in history
    INSERT INTO ems.approval_history (
        company_id, entity_type, entity_id, action, action_by, 
        previous_status, new_status, comments
    ) VALUES (
        p_company_id, p_entity_type, p_entity_id, 'APPROVED', p_approved_by,
        'PENDING_APPROVAL', 'APPROVED', p_comments
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reject
CREATE OR REPLACE FUNCTION ems.reject_content(
    p_entity_type VARCHAR,
    p_entity_id BIGINT,
    p_rejected_by BIGINT,
    p_company_id BIGINT,
    p_rejection_reason TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Update entity status
    CASE p_entity_type
        WHEN 'ASSIGNMENT' THEN
            UPDATE ems.assignments 
            SET approval_status = 'REJECTED',
                approved_by = p_rejected_by,
                approved_at = NOW(),
                rejection_reason = p_rejection_reason
            WHERE id = p_entity_id;
        WHEN 'QUIZ' THEN
            UPDATE ems.quizzes 
            SET approval_status = 'REJECTED',
                approved_by = p_rejected_by,
                approved_at = NOW(),
                rejection_reason = p_rejection_reason
            WHERE id = p_entity_id;
        WHEN 'MATERIAL' THEN
            UPDATE ems.course_materials 
            SET approval_status = 'REJECTED',
                approved_by = p_rejected_by,
                approved_at = NOW(),
                rejection_reason = p_rejection_reason
            WHERE id = p_entity_id;
        WHEN 'LIVE_CLASS' THEN
            UPDATE ems.live_classes 
            SET approval_status = 'REJECTED',
                approved_by = p_rejected_by,
                approved_at = NOW(),
                rejection_reason = p_rejection_reason
            WHERE id = p_entity_id;
    END CASE;
    
    -- Log in history
    INSERT INTO ems.approval_history (
        company_id, entity_type, entity_id, action, action_by, 
        previous_status, new_status, comments
    ) VALUES (
        p_company_id, p_entity_type, p_entity_id, 'REJECTED', p_rejected_by,
        'PENDING_APPROVAL', 'REJECTED', p_rejection_reason
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. CREATE VIEWS FOR EASY QUERYING
-- ============================================================================

-- View for pending approvals
CREATE OR REPLACE VIEW ems.v_pending_approvals AS
SELECT 
    'ASSIGNMENT' as entity_type,
    a.id as entity_id,
    a.assignment_title as title,
    a.course_id,
    c.course_name,
    a.created_by as tutor_id,
    e.first_name || ' ' || e.last_name as tutor_name,
    a.submitted_for_approval_at,
    a.company_id
FROM ems.assignments a
JOIN ems.courses c ON a.course_id = c.id
LEFT JOIN core.employees e ON a.created_by = e.id
WHERE a.approval_status = 'PENDING_APPROVAL'

UNION ALL

SELECT 
    'QUIZ' as entity_type,
    q.id as entity_id,
    q.quiz_title as title,
    q.course_id,
    c.course_name,
    q.created_by as tutor_id,
    e.first_name || ' ' || e.last_name as tutor_name,
    q.submitted_for_approval_at,
    q.company_id
FROM ems.quizzes q
JOIN ems.courses c ON q.course_id = c.id
LEFT JOIN core.employees e ON q.created_by = e.id
WHERE q.approval_status = 'PENDING_APPROVAL'

UNION ALL

SELECT 
    'MATERIAL' as entity_type,
    m.id as entity_id,
    m.material_name as title,
    m.course_id,
    c.course_name,
    m.uploaded_by as tutor_id,
    e.first_name || ' ' || e.last_name as tutor_name,
    m.submitted_for_approval_at,
    m.company_id
FROM ems.course_materials m
JOIN ems.courses c ON m.course_id = c.id
LEFT JOIN core.employees e ON m.uploaded_by = e.id
WHERE m.approval_status = 'PENDING_APPROVAL'

UNION ALL

SELECT 
    'LIVE_CLASS' as entity_type,
    l.id as entity_id,
    l.class_title as title,
    l.course_id,
    c.course_name,
    l.tutor_id,
    e.first_name || ' ' || e.last_name as tutor_name,
    l.submitted_for_approval_at,
    l.company_id
FROM ems.live_classes l
JOIN ems.courses c ON l.course_id = c.id
LEFT JOIN core.employees e ON l.tutor_id = e.id
WHERE l.approval_status = 'PENDING_APPROVAL';

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

-- Verify
SELECT 'Approval columns added successfully!' as status;
