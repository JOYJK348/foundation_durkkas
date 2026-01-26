-- Add missing core security and auth settings
-- Integration for Platform System Settings

INSERT INTO core.global_settings ("group", "key", "value", "description", is_system_setting) VALUES
('AUTH', 'auth.min_password_length', '8', 'Minimum characters required for passwords', TRUE),
('AUTH', 'auth.password_expiry_days', '90', 'Days before password must be changed', TRUE),
('AUTH', 'auth.session_timeout_hrs', '12', 'Duration of active session in hours', TRUE),
('AUTH', 'auth.max_concurrent_sessions', '3', 'Max simultaneous active sessions per user', TRUE),
('SECURITY', 'security.ip_restriction', 'true', 'Restricts company admin access to specific IPs', TRUE),
('SECURITY', 'security.device_fingerprinting', 'true', 'Audits hardware IDs during login', TRUE),
('SECURITY', 'security.2fa_mandatory', 'true', 'Enforces multi-factor for platform admins', TRUE),
('LIMITS', 'limits.max_branches_base', '2', 'Baseline branch allowance for standard tier', TRUE),
('LIMITS', 'limits.max_staff_per_branch', '50', 'Baseline staff allowance per branch', TRUE)
ON CONFLICT ("key") DO UPDATE SET
    "group" = EXCLUDED."group",
    "description" = EXCLUDED."description",
    is_system_setting = EXCLUDED.is_system_setting;
