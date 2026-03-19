-- Quiz Assignment System
-- Allows assigning quizzes to specific batches or students
-- Durkkas Innovations Private Limited

CREATE TABLE IF NOT EXISTS ems.quiz_assignments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES ems.quizzes(id) ON DELETE CASCADE,
    
    -- Target: Batch or Student
    batch_id BIGINT REFERENCES ems.batches(id) ON DELETE SET NULL,
    student_id BIGINT REFERENCES ems.students(id) ON DELETE SET NULL,
    
    -- Schedule
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    
    -- Audit
    assigned_by BIGINT REFERENCES app_auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate assignments
    CONSTRAINT unique_batch_assignment UNIQUE (quiz_id, batch_id),
    CONSTRAINT unique_student_assignment UNIQUE (quiz_id, student_id),
    
    -- Ensure at least one target is specified
    CONSTRAINT target_required CHECK (batch_id IS NOT NULL OR student_id IS NOT NULL)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_quiz ON ems.quiz_assignments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_batch ON ems.quiz_assignments(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_student ON ems.quiz_assignments(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_company ON ems.quiz_assignments(company_id);

COMMENT ON TABLE ems.quiz_assignments IS 'Granular assignment of quizzes to batches or individual students';
