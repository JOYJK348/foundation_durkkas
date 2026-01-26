-- Migration: Advanced Security Infrastructure
-- Implements Device Trust and IP Whitelisting

-- 1. Trusted Devices Table
CREATE TABLE IF NOT EXISTS app_auth.trusted_devices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50), -- MOBILE, DESKTOP, TABLET
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, device_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON app_auth.trusted_devices(user_id);

-- 2. IP Whitelist Table
CREATE TABLE IF NOT EXISTS core.company_security_whitelists (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    UNIQUE(company_id, ip_address)
);

CREATE INDEX IF NOT EXISTS idx_ip_whitelists_company_id ON core.company_security_whitelists(company_id);

-- 3. Seed some default whitelists for local development if needed
-- INSERT INTO core.company_security_whitelists (company_id, ip_address, description) VALUES (1, '127.0.0.1', 'Localhost');
