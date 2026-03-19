-- ========================================
-- EMS ROLE SETUP - ACADEMIC_MANAGER
-- Dynamic, Role-Driven Education System
-- ========================================

-- Step 1: Create ACADEMIC_MANAGER role
INSERT INTO app_auth.roles (name, display_name, level, description, created_at)
VALUES (
    'ACADEMIC_MANAGER',
    'Academic Manager',
    4,  -- Between COMPANY_ADMIN (5) and TUTOR (3)
    'Academic Administrator who manages courses, batches, tutors, and students',
    NOW()
)
ON CONFLICT (name) DO UPDATE
SET 
    display_name = 'Academic Manager',
    level = 4,
    description = 'Academic Administrator who manages courses, batches, tutors, and students',
    updated_at = NOW();

-- Step 2: Verify TUTOR role exists
INSERT INTO app_auth.roles (name, display_name, level, description, created_at)
VALUES (
    'TUTOR',
    'Tutor',
    3,
    'Content creator and academic facilitator',
    NOW()
)
ON CONFLICT (name) DO UPDATE
SET 
    display_name = 'Tutor',
    level = 3,
    description = 'Content creator and academic facilitator',
    updated_at = NOW();

-- Step 3: Verify STUDENT role exists
INSERT INTO app_auth.roles (name, display_name, level, description, created_at)
VALUES (
    'STUDENT',
    'Student',
    1,
    'Learner and content consumer',
    NOW()
)
ON CONFLICT (name) DO UPDATE
SET 
    display_name = 'Student',
    level = 1,
    description = 'Learner and content consumer',
    updated_at = NOW();

-- Step 4: Create tutor_permissions table (if not exists)
CREATE TABLE IF NOT EXISTS ems.tutor_permissions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    
    -- Content Creation Permissions
    can_create_courses BOOLEAN DEFAULT false,
    can_edit_course_structure BOOLEAN DEFAULT true,
    can_delete_courses BOOLEAN DEFAULT false,
    
    -- Batch Management
    can_create_batches BOOLEAN DEFAULT false,
    can_edit_batches BOOLEAN DEFAULT true,
    can_delete_batches BOOLEAN DEFAULT false,
    
    -- Academic Content
    can_create_assignments BOOLEAN DEFAULT true,
    can_create_quizzes BOOLEAN DEFAULT true,
    can_create_materials BOOLEAN DEFAULT true,
    can_schedule_live_classes BOOLEAN DEFAULT true,
    
    -- Student Management
    can_view_all_students BOOLEAN DEFAULT false,
    can_enroll_students BOOLEAN DEFAULT false,
    can_remove_students BOOLEAN DEFAULT false,
    
    -- Grading & Analytics
    can_grade_assignments BOOLEAN DEFAULT true,
    can_view_analytics BOOLEAN DEFAULT true,
    can_export_reports BOOLEAN DEFAULT false,
    
    -- System
    granted_by BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, tutor_id)
);

-- Step 5: Create academic_manager_settings table
CREATE TABLE IF NOT EXISTS ems.academic_manager_settings (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    academic_manager_id BIGINT NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    
    -- Default Tutor Permissions (template)
    default_tutor_permissions JSONB DEFAULT '{
        "can_create_courses": false,
        "can_edit_course_structure": true,
        "can_create_assignments": true,
        "can_create_quizzes": true,
        "can_schedule_live_classes": true,
        "can_grade_assignments": true,
        "can_view_analytics": true
    }'::jsonb,
    
    -- Academic Settings
    allow_student_self_enrollment BOOLEAN DEFAULT false,
    require_payment_for_enrollment BOOLEAN DEFAULT true,
    auto_generate_certificates BOOLEAN DEFAULT true,
    
    -- Notifications
    notify_on_new_enrollment BOOLEAN DEFAULT true,
    notify_on_assignment_submission BOOLEAN DEFAULT true,
    notify_on_course_completion BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, academic_manager_id)
);

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tutor_permissions_company ON ems.tutor_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_tutor_permissions_tutor ON ems.tutor_permissions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_academic_settings_company ON ems.academic_manager_settings(company_id);

-- Step 7: Verify all roles
SELECT 
    name,
    display_name,
    level,
    description,
    '✅ Role configured' as status
FROM app_auth.roles
WHERE name IN ('ACADEMIC_MANAGER', 'TUTOR', 'STUDENT', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
ORDER BY level DESC;

-- ========================================
-- SUMMARY
-- ========================================
-- ✅ ACADEMIC_MANAGER role created (Level 4)
-- ✅ TUTOR role verified (Level 3)
-- ✅ STUDENT role verified (Level 1)
-- ✅ tutor_permissions table created
-- ✅ academic_manager_settings table created
-- ✅ Indexes added for performance
-- 
-- Next: Create Academic Manager user for AIPL
-- ========================================
