-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DURKKAS ERP - MASTER DDL FILE 05
-- SUBSCRIPTION SYSTEM & ACCESS CONTROL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO core, app_auth, public;

-- ============================================================================
-- SUBSCRIPTION TEMPLATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS core.subscription_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    template_type VARCHAR(20) DEFAULT 'CUSTOM',
    base_plan VARCHAR(50),
    monthly_price DECIMAL(12, 2) DEFAULT 0.00,
    yearly_price DECIMAL(12, 2) DEFAULT 0.00,
    setup_fee DECIMAL(12, 2) DEFAULT 0.00,
    max_users INTEGER DEFAULT 10,
    max_employees INTEGER DEFAULT 10,
    max_branches INTEGER DEFAULT 1,
    max_departments INTEGER DEFAULT 5,
    max_designations INTEGER DEFAULT 5,
    enabled_modules JSONB DEFAULT '[]'::jsonb,
    allowed_menu_ids JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    support_level VARCHAR(50) DEFAULT 'EMAIL',
    trial_days INTEGER DEFAULT 0,
    validity_days INTEGER DEFAULT 365,
    is_active BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core.company_subscription_menus (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    menu_id BIGINT NOT NULL REFERENCES app_auth.menu_registry(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT TRUE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, menu_id)
);

-- Add subscription template reference to companies
ALTER TABLE core.companies
ADD COLUMN IF NOT EXISTS subscription_template_id BIGINT REFERENCES core.subscription_templates(id);

-- ============================================================================
-- SEED SUBSCRIPTION PLANS
-- ============================================================================
INSERT INTO core.subscription_plans (name, display_name, description, plan_type, monthly_price, yearly_price, 
    max_employees, max_branches, max_users, max_departments, max_designations, enabled_modules, features, support_level, trial_days) VALUES
('TRIAL', 'Trial Plan', 'Experience all features free for 30 days', 'TRIAL', 0.00, 0.00, 
    10, 1, 10, 5, 5, '["HR", "ATTENDANCE", "PAYROLL", "CRM", "LMS", "FINANCE"]'::jsonb,
    '["All Modules", "Limited Users (10)", "30 Days Trial", "Email Support"]'::jsonb, 'EMAIL', 30),
('BASIC', 'Basic Plan', 'Essential features for small teams', 'STANDARD', 2999.00, 29990.00,
    25, 3, 25, 10, 10, '["HR", "ATTENDANCE"]'::jsonb,
    '["Core HR", "Attendance Tracking", "25 Users", "3 Branches", "Email Support"]'::jsonb, 'EMAIL', 0),
('STANDARD', 'Standard Plan', 'Full-featured solution for growing companies', 'STANDARD', 5999.00, 59990.00,
    100, 5, 100, 25, 25, '["HR", "ATTENDANCE", "PAYROLL", "CRM"]'::jsonb,
    '["Everything in Basic", "Payroll", "CRM", "100 Users", "5 Branches", "Priority Support"]'::jsonb, 'PRIORITY', 0),
('ENTERPRISE', 'Enterprise Plan', 'Unlimited power for large organizations', 'STANDARD', 14999.00, 149990.00,
    0, 0, 0, 0, 0, '["HR", "ATTENDANCE", "PAYROLL", "CRM", "LMS", "FINANCE"]'::jsonb,
    '["Everything Unlimited", "All Modules", "24/7 Support", "Custom Integrations", "API Access"]'::jsonb, '24X7', 0)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    enabled_modules = EXCLUDED.enabled_modules,
    features = EXCLUDED.features;

-- ============================================================================
-- SEED SUBSCRIPTION TEMPLATES
-- ============================================================================
INSERT INTO core.subscription_templates (code, name, display_name, description, template_type, base_plan,
    monthly_price, yearly_price, max_users, max_employees, max_branches, max_departments, max_designations,
    enabled_modules, features, support_level, trial_days, is_active, is_published) VALUES
('TPL-TRIAL', 'Trial Template', 'Trial Plan', 'Experience all features free for 30 days', 'PREDEFINED', 'TRIAL',
    0.00, 0.00, 10, 10, 1, 5, 5,
    '["HR", "ATTENDANCE", "PAYROLL", "CRM", "LMS", "FINANCE"]'::jsonb,
    '["All Modules Unlocked", "Limited Users (10)", "30 Days Trial"]'::jsonb, 'EMAIL', 30, TRUE, TRUE),
('TPL-BASIC', 'Basic Template', 'Basic Plan', 'Essential features for small teams', 'PREDEFINED', 'BASIC',
    2999.00, 29990.00, 25, 25, 3, 10, 10,
    '["HR", "ATTENDANCE"]'::jsonb,
    '["Core HR", "Attendance Tracking", "25 Users", "3 Branches"]'::jsonb, 'EMAIL', 0, TRUE, TRUE),
('TPL-STANDARD', 'Standard Template', 'Standard Plan', 'Full-featured solution', 'PREDEFINED', 'STANDARD',
    5999.00, 59990.00, 100, 100, 5, 25, 25,
    '["HR", "ATTENDANCE", "PAYROLL", "CRM"]'::jsonb,
    '["Everything in Basic", "Payroll", "CRM", "100 Users", "5 Branches"]'::jsonb, 'PRIORITY', 0, TRUE, TRUE),
('TPL-ENTERPRISE', 'Enterprise Template', 'Enterprise Plan', 'Unlimited power', 'PREDEFINED', 'ENTERPRISE',
    14999.00, 149990.00, 0, 0, 0, 0, 0,
    '["HR", "ATTENDANCE", "PAYROLL", "CRM", "LMS", "FINANCE"]'::jsonb,
    '["Everything Unlimited", "All Modules", "24/7 Support"]'::jsonb, '24X7', 0, TRUE, TRUE)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    enabled_modules = EXCLUDED.enabled_modules;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get company usage stats
CREATE OR REPLACE FUNCTION core.get_company_usage(p_company_id BIGINT)
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_build_object(
        'users', (SELECT COUNT(*) FROM app_auth.user_roles WHERE company_id = p_company_id AND is_active = TRUE),
        'employees', (SELECT COUNT(*) FROM core.employees WHERE company_id = p_company_id AND is_active = TRUE AND deleted_at IS NULL),
        'branches', (SELECT COUNT(*) FROM core.branches WHERE company_id = p_company_id AND is_active = TRUE AND deleted_at IS NULL),
        'departments', (SELECT COUNT(*) FROM core.departments WHERE company_id = p_company_id AND is_active = TRUE AND deleted_at IS NULL),
        'designations', (SELECT COUNT(*) FROM core.designations WHERE company_id = p_company_id AND is_active = TRUE AND deleted_at IS NULL)
    );
END;
$$ LANGUAGE plpgsql;

-- Get company plan limits
CREATE OR REPLACE FUNCTION core.get_company_plan_limits(p_company_id BIGINT)
RETURNS JSONB AS $$
DECLARE
    v_plan_name VARCHAR(50);
    v_result JSONB;
BEGIN
    SELECT subscription_plan INTO v_plan_name FROM core.companies WHERE id = p_company_id;
    
    SELECT jsonb_build_object(
        'plan_name', sp.name,
        'display_name', sp.display_name,
        'max_users', sp.max_users,
        'max_employees', sp.max_employees,
        'max_branches', sp.max_branches,
        'max_departments', sp.max_departments,
        'max_designations', sp.max_designations,
        'enabled_modules', sp.enabled_modules,
        'trial_days', sp.trial_days,
        'support_level', sp.support_level
    ) INTO v_result
    FROM core.subscription_plans sp
    WHERE sp.name = v_plan_name;
    
    IF v_result IS NULL THEN
        v_result := jsonb_build_object(
            'plan_name', 'TRIAL',
            'display_name', 'Trial Plan',
            'max_users', 10,
            'max_employees', 10,
            'max_branches', 1,
            'max_departments', 5,
            'max_designations', 5,
            'enabled_modules', '["HR", "ATTENDANCE"]'::jsonb,
            'trial_days', 30,
            'support_level', 'EMAIL'
        );
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Check if company can add resource
CREATE OR REPLACE FUNCTION core.can_add_resource(p_company_id BIGINT, p_resource_type VARCHAR)
RETURNS JSONB AS $$
DECLARE
    v_usage JSONB;
    v_limits JSONB;
    v_current INTEGER;
    v_max INTEGER;
    v_can_add BOOLEAN;
    v_message TEXT;
BEGIN
    v_usage := core.get_company_usage(p_company_id);
    v_limits := core.get_company_plan_limits(p_company_id);
    
    CASE p_resource_type
        WHEN 'user' THEN
            v_current := (v_usage->>'users')::INTEGER;
            v_max := (v_limits->>'max_users')::INTEGER;
        WHEN 'employee' THEN
            v_current := (v_usage->>'employees')::INTEGER;
            v_max := (v_limits->>'max_employees')::INTEGER;
        WHEN 'branch' THEN
            v_current := (v_usage->>'branches')::INTEGER;
            v_max := (v_limits->>'max_branches')::INTEGER;
        WHEN 'department' THEN
            v_current := (v_usage->>'departments')::INTEGER;
            v_max := (v_limits->>'max_departments')::INTEGER;
        WHEN 'designation' THEN
            v_current := (v_usage->>'designations')::INTEGER;
            v_max := (v_limits->>'max_designations')::INTEGER;
        ELSE
            RETURN jsonb_build_object('allowed', FALSE, 'message', 'Unknown resource type');
    END CASE;
    
    IF v_max = 0 THEN
        v_can_add := TRUE;
        v_message := 'Unlimited ' || p_resource_type || 's allowed';
    ELSIF v_current < v_max THEN
        v_can_add := TRUE;
        v_message := format('You can add %s more %s(s)', v_max - v_current, p_resource_type);
    ELSE
        v_can_add := FALSE;
        v_message := format('Limit reached: %s %s(s). Upgrade to add more.', v_max, p_resource_type);
    END IF;
    
    RETURN jsonb_build_object(
        'allowed', v_can_add,
        'current', v_current,
        'max', v_max,
        'remaining', GREATEST(0, v_max - v_current),
        'message', v_message
    );
END;
$$ LANGUAGE plpgsql;

-- Apply subscription to company
CREATE OR REPLACE FUNCTION core.apply_subscription_to_company(p_company_id BIGINT, p_template_id BIGINT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    v_template RECORD;
    v_menu_id BIGINT;
    v_modules JSONB;
    v_allowed_ids JSONB;
BEGIN
    IF p_template_id IS NOT NULL THEN
        SELECT * INTO v_template FROM core.subscription_templates WHERE id = p_template_id;
        v_modules := v_template.enabled_modules;
        v_allowed_ids := v_template.allowed_menu_ids;
    ELSE
        SELECT enabled_modules, allowed_menu_ids INTO v_modules, v_allowed_ids
        FROM core.companies WHERE id = p_company_id;
    END IF;
    
    DELETE FROM core.company_subscription_menus WHERE company_id = p_company_id;
    
    IF v_allowed_ids IS NOT NULL AND jsonb_array_length(v_allowed_ids) > 0 THEN
        FOR v_menu_id IN SELECT jsonb_array_elements_text(v_allowed_ids)::BIGINT
        LOOP
            INSERT INTO core.company_subscription_menus (company_id, menu_id, can_view, can_create, can_edit, can_delete)
            VALUES (p_company_id, v_menu_id, TRUE, TRUE, TRUE, TRUE)
            ON CONFLICT (company_id, menu_id) DO NOTHING;
        END LOOP;
    ELSIF v_modules IS NOT NULL AND jsonb_array_length(v_modules) > 0 THEN
        INSERT INTO core.company_subscription_menus (company_id, menu_id, can_view, can_create, can_edit, can_delete)
        SELECT p_company_id, mr.id, TRUE, TRUE, TRUE, TRUE
        FROM app_auth.menu_registry mr
        WHERE mr.is_active = TRUE
          AND (mr.is_core = TRUE OR mr.module_key IN (SELECT jsonb_array_elements_text(v_modules)))
        ON CONFLICT (company_id, menu_id) DO NOTHING;
    ELSE
        INSERT INTO core.company_subscription_menus (company_id, menu_id, can_view, can_create, can_edit, can_delete)
        SELECT p_company_id, mr.id, TRUE, TRUE, TRUE, TRUE
        FROM app_auth.menu_registry mr
        WHERE mr.is_active = TRUE AND mr.is_core = TRUE
        ON CONFLICT (company_id, menu_id) DO NOTHING;
    END IF;
    
    UPDATE core.companies 
    SET allowed_menu_ids = (
        SELECT jsonb_agg(menu_id) 
        FROM core.company_subscription_menus 
        WHERE company_id = p_company_id AND is_active = TRUE
    ),
    subscription_template_id = p_template_id
    WHERE id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- Get company allowed menus
CREATE OR REPLACE FUNCTION core.get_company_allowed_menus(p_company_id BIGINT)
RETURNS TABLE(
    menu_id BIGINT, menu_key VARCHAR, menu_name VARCHAR, display_name VARCHAR,
    parent_menu_id BIGINT, route VARCHAR, icon VARCHAR, sort_order INTEGER,
    module_key VARCHAR, can_view BOOLEAN, can_create BOOLEAN, can_edit BOOLEAN, can_delete BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT mr.id, mr.menu_key, mr.menu_name, mr.display_name, mr.parent_menu_id,
           mr.route, mr.icon, mr.sort_order, mr.module_key,
           csm.can_view, csm.can_create, csm.can_edit, csm.can_delete
    FROM app_auth.menu_registry mr
    INNER JOIN core.company_subscription_menus csm ON csm.menu_id = mr.id
    WHERE csm.company_id = p_company_id
      AND csm.is_active = TRUE
      AND mr.is_active = TRUE
      AND mr.is_visible = TRUE
    ORDER BY mr.sort_order, mr.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_subscription_templates_code ON core.subscription_templates(code);
CREATE INDEX IF NOT EXISTS idx_subscription_templates_active ON core.subscription_templates(is_active, is_published);
CREATE INDEX IF NOT EXISTS idx_company_sub_menus_company ON core.company_subscription_menus(company_id);
CREATE INDEX IF NOT EXISTS idx_company_sub_menus_menu ON core.company_subscription_menus(menu_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
    v_plans INTEGER;
    v_templates INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_plans FROM core.subscription_plans;
    SELECT COUNT(*) INTO v_templates FROM core.subscription_templates;
    
    RAISE NOTICE '✅ MASTER 05: Subscription System Created!';
    RAISE NOTICE '📋 Subscription Plans: %', v_plans;
    RAISE NOTICE '📝 Templates: %', v_templates;
    RAISE NOTICE '🔧 Functions: get_company_usage, can_add_resource, apply_subscription_to_company';
END $$;
