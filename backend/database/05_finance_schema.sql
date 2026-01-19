-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 05 - FINANCE SCHEMA (FINANCIAL MANAGEMENT)
-- Durkkas Innovations Private Limited
-- Multi-Tenant SaaS | Production-Ready | Enterprise Grade
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP SCHEMA IF EXISTS finance CASCADE;
CREATE SCHEMA finance;
SET search_path TO finance, core, ems, app_auth, public;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. INVOICES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS finance.invoices (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    
    student_id BIGINT REFERENCES ems.students(id),
    
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    
    status VARCHAR(50) DEFAULT 'DRAFT',  -- DRAFT, SENT, PAID, OVERDUE, CANCELLED
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, invoice_number)
);

COMMENT ON TABLE finance.invoices IS 'Invoice records (multi-tenant)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. PAYMENTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS finance.payments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    invoice_id BIGINT NOT NULL REFERENCES finance.invoices(id),
    
    payment_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    
    payment_method VARCHAR(50),  -- CASH, CARD, UPI, BANK_TRANSFER
    transaction_id VARCHAR(100),
    
    status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, SUCCESS, FAILED
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE finance.payments IS 'Payment records (multi-tenant)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON finance.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student_id ON finance.invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON finance.invoices(status);

CREATE INDEX IF NOT EXISTS idx_payments_company_id ON finance.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON finance.payments(invoice_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION finance.update_updated_at_column()
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
        WHERE table_schema = 'finance' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON finance.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON finance.%I FOR EACH ROW EXECUTE FUNCTION finance.update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF FINANCE SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
