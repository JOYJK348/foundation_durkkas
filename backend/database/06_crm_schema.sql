-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 06 - CRM SCHEMA (CUSTOMER RELATIONSHIP MANAGEMENT)
-- Durkkas Innovations Private Limited
-- Multi-Tenant SaaS | Production-Ready | Enterprise Grade
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP SCHEMA IF EXISTS crm CASCADE;
CREATE SCHEMA crm;
SET search_path TO crm, core, ems, app_auth, public;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. LEADS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS crm.leads (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    
    source VARCHAR(100),  -- WEBSITE, REFERRAL, SOCIAL_MEDIA, WALK_IN
    status VARCHAR(50) DEFAULT 'NEW',  -- NEW, CONTACTED, QUALIFIED, CONVERTED, LOST
    
    assigned_to BIGINT REFERENCES core.employees(id),
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE crm.leads IS 'Lead management (multi-tenant)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. FOLLOW-UPS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS crm.followups (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    lead_id BIGINT NOT NULL REFERENCES crm.leads(id),
    
    followup_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    
    status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, COMPLETED, CANCELLED
    
    created_by BIGINT REFERENCES core.employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_leads_company_id ON crm.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON crm.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON crm.leads(assigned_to);

CREATE INDEX IF NOT EXISTS idx_followups_company_id ON crm.followups(company_id);
CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON crm.followups(lead_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION crm.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'crm' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON crm.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON crm.%I FOR EACH ROW EXECUTE FUNCTION crm.update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF CRM SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
