-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DURKKAS ERP - MASTER DDL FILE 02
-- AUTHENTICATION & SECURITY (RBAC)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET search_path TO app_auth, core, public;

-- ============================================================================
-- AUTHENTICATION TABLES
-- ============================================================================

-- USERS
CREATE TABLE IF NOT EXISTS app_auth.users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(255),
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE NOT NULL,
    failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    delete_reason TEXT
);

-- ROLES
CREATE TABLE IF NOT EXISTS app_auth.roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    role_type VARCHAR(50) DEFAULT 'CUSTOM',
    product VARCHAR(50),
    level INTEGER DEFAULT 0,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PERMISSIONS
CREATE TABLE IF NOT EXISTS app_auth.permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    permission_scope VARCHAR(50),
    schema_name VARCHAR(50),
    resource VARCHAR(100),
    action VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ROLE_PERMISSIONS (Many-to-Many)
CREATE TABLE IF NOT EXISTS app_auth.role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES app_auth.roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES app_auth.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    UNIQUE(role_id, permission_id)
);

-- USER_ROLES (Multi-tenant scope)
CREATE TABLE IF NOT EXISTS app_auth.user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES app_auth.roles(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES core.companies(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES core.branches(id) ON DELETE CASCADE,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, role_id, company_id, branch_id)
);

-- USER_PERMISSIONS (User-specific overrides)
CREATE TABLE IF NOT EXISTS app_auth.user_permissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES app_auth.permissions(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES core.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    UNIQUE(user_id, permission_id, company_id)
);

-- ============================================================================
-- NAVIGATION & MENUS
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_auth.menu_registry (
    id BIGSERIAL PRIMARY KEY,
    menu_key VARCHAR(100) NOT NULL UNIQUE,
    menu_name VARCHAR(255),
    display_name VARCHAR(255),
    description TEXT,
    parent_menu_id BIGINT REFERENCES app_auth.menu_registry(id),
    sort_order INTEGER DEFAULT 0,
    product VARCHAR(50),
    schema_name VARCHAR(50),
    route VARCHAR(500),
    icon VARCHAR(100),
    module_key VARCHAR(50),
    is_core BOOLEAN DEFAULT FALSE,
    requires_subscription BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS app_auth.menu_permissions (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES app_auth.menu_registry(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES app_auth.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(menu_id, permission_id)
);

-- ============================================================================
-- AUDIT & LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_auth.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_auth.users(id),
    user_email VARCHAR(255),
    company_id BIGINT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id BIGINT,
    schema_name VARCHAR(50),
    table_name VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS app_auth.login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_auth.users(id),
    email VARCHAR(255),
    login_status VARCHAR(50),
    failure_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    logged_in_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_auth.user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE,
    refresh_token TEXT,
    device_type VARCHAR(50),
    ip_address INET,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    logged_out_at TIMESTAMPTZ
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_auth.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_auth.users(id) ON DELETE CASCADE,
    company_id BIGINT,
    branch_id BIGINT REFERENCES core.branches(id),
    sender_id BIGINT REFERENCES app_auth.users(id),
    target_type VARCHAR(50),
    target_role_level INT,
    category VARCHAR(50) DEFAULT 'INFO',
    type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    read_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON app_auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON app_auth.users(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_level ON app_auth.roles(level);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON app_auth.permissions(name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON app_auth.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_company ON app_auth.user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON app_auth.audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON app_auth.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON app_auth.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company ON app_auth.notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_menu_registry_module ON app_auth.menu_registry(module_key);

-- ============================================================================
-- SECURITY FUNCTIONS & TRIGGERS
-- ============================================================================

-- Security: Validate user role scope
CREATE OR REPLACE FUNCTION app_auth.validate_user_role_scope()
RETURNS TRIGGER AS $$
DECLARE
    v_role_level INTEGER;
BEGIN
    SELECT level INTO v_role_level FROM app_auth.roles WHERE id = NEW.role_id;
    IF v_role_level = 4 AND NEW.company_id IS NULL THEN
        RAISE EXCEPTION 'Security Error: Company Admin (Level 4) must be assigned to a specific company_id.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_user_role_scope
BEFORE INSERT OR UPDATE ON app_auth.user_roles
FOR EACH ROW EXECUTE FUNCTION app_auth.validate_user_role_scope();

-- Get user tenant scope
CREATE OR REPLACE FUNCTION app_auth.get_user_tenant_scope(p_user_id BIGINT)
RETURNS TABLE(company_id BIGINT, branch_id BIGINT, role_level INTEGER, role_name VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT ur.company_id, ur.branch_id, r.level, r.name
    FROM app_auth.user_roles ur
    JOIN app_auth.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND ur.is_active = TRUE
    ORDER BY r.level DESC LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check company access
CREATE OR REPLACE FUNCTION app_auth.can_access_company(p_user_id BIGINT, p_company_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    v_scope RECORD;
BEGIN
    SELECT * INTO v_scope FROM app_auth.get_user_tenant_scope(p_user_id);
    IF NOT FOUND THEN RETURN FALSE; END IF;
    IF v_scope.role_level >= 5 THEN RETURN TRUE; END IF;
    IF v_scope.role_level = 4 THEN RETURN v_scope.company_id = p_company_id; END IF;
    RETURN v_scope.company_id = p_company_id OR v_scope.company_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user permissions
CREATE OR REPLACE FUNCTION app_auth.get_user_permissions(p_user_id BIGINT)
RETURNS TABLE(permission_name VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name
    FROM app_auth.user_roles ur
    JOIN app_auth.role_permissions rp ON ur.role_id = rp.role_id
    JOIN app_auth.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id AND ur.is_active = TRUE AND p.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Timestamp trigger
CREATE OR REPLACE FUNCTION app_auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON app_auth.users 
FOR EACH ROW EXECUTE FUNCTION app_auth.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON app_auth.roles 
FOR EACH ROW EXECUTE FUNCTION app_auth.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON app_auth.user_roles 
FOR EACH ROW EXECUTE FUNCTION app_auth.update_updated_at_column();

CREATE TRIGGER update_menu_registry_updated_at BEFORE UPDATE ON app_auth.menu_registry 
FOR EACH ROW EXECUTE FUNCTION app_auth.update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ MASTER 02: Auth & Security Schema Created!';
    RAISE NOTICE '🔐 Tables: users, roles, permissions, user_roles, notifications';
    RAISE NOTICE '🛡️ Security: Multi-tenant validation triggers active';
END $$;
