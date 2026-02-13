/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GST FINANCE LAB - EDUCATIONAL SIMULATION MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Complete GST learning system with ledger management, returns, and payments
 * 
 * FEATURES:
 * ✅ Mock Company Registration (GSTIN generation)
 * ✅ Purchase Entry (Input GST tracking)
 * ✅ Sales Entry (Output GST tracking)
 * ✅ Automatic GST Calculation
 * ✅ Electronic Ledger System (Input/Output/Cash)
 * ✅ Monthly Return Summary (GSTR-3B style)
 * ✅ Challan Generation (PMT-06 simulation)
 * ✅ Payment Simulation
 * ✅ ITC Carry Forward
 * 
 * EDUCATIONAL FOCUS: Teaches real GST workflows without legal compliance burden
 * ═══════════════════════════════════════════════════════════════════════════
 */

-- ═══════════════════════════════════════════════════════════════════════════
-- 1️⃣ COMPANY SETUP (Mock GST Registration)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ems.gst_lab_companies (
    id BIGSERIAL PRIMARY KEY,
    allocation_id BIGINT REFERENCES ems.student_practice_allocations(id) ON DELETE CASCADE,
    
    -- Company Details
    company_name VARCHAR(200) NOT NULL,
    state VARCHAR(50) NOT NULL,
    state_code VARCHAR(2) NOT NULL, -- e.g., '33' for Tamil Nadu
    
    -- Mock GSTIN (Format: SSAAAAA9999A1Z5)
    gstin VARCHAR(15) UNIQUE NOT NULL,
    
    -- Configuration
    default_gst_rate NUMERIC(5,2) DEFAULT 18.00,
    financial_year VARCHAR(10) DEFAULT '2025-26',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(allocation_id) -- One company per student allocation
);

COMMENT ON TABLE ems.gst_lab_companies IS 'Mock GST company registration for educational simulation';
COMMENT ON COLUMN ems.gst_lab_companies.gstin IS 'Auto-generated dummy GSTIN (not real)';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2️⃣ PURCHASE MODULE (Input GST Tracking)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ems.gst_lab_purchases (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES ems.gst_lab_companies(id) ON DELETE CASCADE,
    
    -- Purchase Details
    supplier_name VARCHAR(200) NOT NULL,
    supplier_gstin VARCHAR(15),
    invoice_no VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    
    -- Amounts
    taxable_amount NUMERIC(15,2) NOT NULL CHECK (taxable_amount > 0),
    gst_rate NUMERIC(5,2) NOT NULL CHECK (gst_rate IN (0, 5, 12, 18, 28)),
    
    -- Calculated GST
    cgst_amount NUMERIC(15,2) DEFAULT 0,
    sgst_amount NUMERIC(15,2) DEFAULT 0,
    igst_amount NUMERIC(15,2) DEFAULT 0,
    total_gst_amount NUMERIC(15,2) GENERATED ALWAYS AS (cgst_amount + sgst_amount + igst_amount) STORED,
    
    -- Total
    total_amount NUMERIC(15,2) GENERATED ALWAYS AS (taxable_amount + cgst_amount + sgst_amount + igst_amount) STORED,
    
    -- Transaction Type
    transaction_type VARCHAR(20) DEFAULT 'INTRA_STATE' CHECK (transaction_type IN ('INTRA_STATE', 'INTER_STATE')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, invoice_no)
);

CREATE INDEX idx_gst_purchases_company ON ems.gst_lab_purchases(company_id);
CREATE INDEX idx_gst_purchases_date ON ems.gst_lab_purchases(invoice_date);

COMMENT ON TABLE ems.gst_lab_purchases IS 'Purchase entries for Input Tax Credit (ITC) calculation';

-- ═══════════════════════════════════════════════════════════════════════════
-- 3️⃣ SALES MODULE (Output GST Tracking)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ems.gst_lab_sales (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES ems.gst_lab_companies(id) ON DELETE CASCADE,
    
    -- Sales Details
    customer_name VARCHAR(200) NOT NULL,
    customer_gstin VARCHAR(15),
    invoice_no VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    
    -- Amounts
    taxable_amount NUMERIC(15,2) NOT NULL CHECK (taxable_amount > 0),
    gst_rate NUMERIC(5,2) NOT NULL CHECK (gst_rate IN (0, 5, 12, 18, 28)),
    
    -- Calculated GST
    cgst_amount NUMERIC(15,2) DEFAULT 0,
    sgst_amount NUMERIC(15,2) DEFAULT 0,
    igst_amount NUMERIC(15,2) DEFAULT 0,
    total_gst_amount NUMERIC(15,2) GENERATED ALWAYS AS (cgst_amount + sgst_amount + igst_amount) STORED,
    
    -- Total
    total_amount NUMERIC(15,2) GENERATED ALWAYS AS (taxable_amount + cgst_amount + sgst_amount + igst_amount) STORED,
    
    -- Transaction Type
    transaction_type VARCHAR(20) DEFAULT 'INTRA_STATE' CHECK (transaction_type IN ('INTRA_STATE', 'INTER_STATE')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, invoice_no)
);

CREATE INDEX idx_gst_sales_company ON ems.gst_lab_sales(company_id);
CREATE INDEX idx_gst_sales_date ON ems.gst_lab_sales(invoice_date);

COMMENT ON TABLE ems.gst_lab_sales IS 'Sales entries for Output GST liability calculation';

-- ═══════════════════════════════════════════════════════════════════════════
-- 4️⃣ LEDGER SYSTEM (Electronic Ledgers)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ems.gst_lab_ledgers (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES ems.gst_lab_companies(id) ON DELETE CASCADE,
    
    -- Ledger Type
    ledger_type VARCHAR(30) NOT NULL CHECK (ledger_type IN ('INPUT_TAX_CREDIT', 'OUTPUT_TAX_LIABILITY', 'CASH_LEDGER')),
    
    -- Transaction Details
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(30), -- 'PURCHASE', 'SALES', 'PAYMENT', 'RETURN_FILING'
    reference_id BIGINT, -- ID of purchase/sales/payment
    
    -- Amount (Debit/Credit)
    debit_amount NUMERIC(15,2) DEFAULT 0,
    credit_amount NUMERIC(15,2) DEFAULT 0,
    
    -- Running Balance
    balance NUMERIC(15,2) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, ledger_type, reference_type, reference_id)
);

CREATE INDEX idx_gst_ledgers_company_type ON ems.gst_lab_ledgers(company_id, ledger_type);
CREATE INDEX idx_gst_ledgers_date ON ems.gst_lab_ledgers(transaction_date);

COMMENT ON TABLE ems.gst_lab_ledgers IS 'Electronic ledger system tracking Input GST, Output GST, and Cash';
COMMENT ON COLUMN ems.gst_lab_ledgers.ledger_type IS 'INPUT_TAX_CREDIT = ITC available, OUTPUT_TAX_LIABILITY = Tax payable, CASH_LEDGER = Payments made';

-- ═══════════════════════════════════════════════════════════════════════════
-- 5️⃣ MONTHLY RETURN (GSTR-3B Simulation)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ems.gst_lab_returns (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES ems.gst_lab_companies(id) ON DELETE CASCADE,
    
    -- Return Period
    return_month VARCHAR(20) NOT NULL, -- e.g., 'January 2026'
    return_year INTEGER NOT NULL,
    filing_period VARCHAR(10) NOT NULL, -- e.g., '01-2026'
    
    -- Summary Calculations
    total_sales NUMERIC(15,2) DEFAULT 0,
    total_purchases NUMERIC(15,2) DEFAULT 0,
    
    output_gst_total NUMERIC(15,2) DEFAULT 0, -- Total tax collected
    input_gst_total NUMERIC(15,2) DEFAULT 0,  -- Total ITC available
    
    -- Net Position
    net_tax_payable NUMERIC(15,2) DEFAULT 0, -- If positive: pay, If negative: carry forward
    itc_carry_forward NUMERIC(15,2) DEFAULT 0, -- Excess ITC for next month
    
    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FILED', 'PAID')),
    filed_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, filing_period)
);

CREATE INDEX idx_gst_returns_company ON ems.gst_lab_returns(company_id);
CREATE INDEX idx_gst_returns_period ON ems.gst_lab_returns(filing_period);

COMMENT ON TABLE ems.gst_lab_returns IS 'Monthly GST return summary (GSTR-3B style)';
COMMENT ON COLUMN ems.gst_lab_returns.net_tax_payable IS 'Output GST - Input GST. Positive = Pay, Negative = Refund/Carry Forward';

-- ═══════════════════════════════════════════════════════════════════════════
-- 6️⃣ CHALLAN GENERATION (PMT-06 Simulation)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ems.gst_lab_challans (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES ems.gst_lab_companies(id) ON DELETE CASCADE,
    return_id BIGINT REFERENCES ems.gst_lab_returns(id) ON DELETE CASCADE,
    
    -- Challan Details
    challan_number VARCHAR(20) UNIQUE NOT NULL, -- Mock CPIN format
    challan_date DATE NOT NULL,
    
    -- Payment Breakdown
    cgst_amount NUMERIC(15,2) DEFAULT 0,
    sgst_amount NUMERIC(15,2) DEFAULT 0,
    igst_amount NUMERIC(15,2) DEFAULT 0,
    total_amount NUMERIC(15,2) NOT NULL,
    
    -- Payment Status
    status VARCHAR(20) DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'PAID', 'CANCELLED')),
    paid_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gst_challans_company ON ems.gst_lab_challans(company_id);
CREATE INDEX idx_gst_challans_return ON ems.gst_lab_challans(return_id);

COMMENT ON TABLE ems.gst_lab_challans IS 'Payment challans (PMT-06 simulation) for tax payment';
COMMENT ON COLUMN ems.gst_lab_challans.challan_number IS 'Mock CPIN (Common Portal Identification Number)';

-- ═══════════════════════════════════════════════════════════════════════════
-- 7️⃣ PAYMENT SIMULATION
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ems.gst_lab_payments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES ems.gst_lab_companies(id) ON DELETE CASCADE,
    challan_id BIGINT REFERENCES ems.gst_lab_challans(id) ON DELETE CASCADE,
    
    -- Payment Details
    payment_date DATE NOT NULL,
    payment_amount NUMERIC(15,2) NOT NULL,
    payment_mode VARCHAR(30) DEFAULT 'SIMULATED' CHECK (payment_mode IN ('SIMULATED', 'INTERNET_BANKING', 'NEFT', 'RTGS')),
    
    -- Transaction Reference
    transaction_id VARCHAR(50) UNIQUE NOT NULL, -- Mock transaction ID
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gst_payments_company ON ems.gst_lab_payments(company_id);
CREATE INDEX idx_gst_payments_challan ON ems.gst_lab_payments(challan_id);

COMMENT ON TABLE ems.gst_lab_payments IS 'Simulated tax payments against challans';

-- ═══════════════════════════════════════════════════════════════════════════
-- 8️⃣ HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function: Generate Mock GSTIN
CREATE OR REPLACE FUNCTION ems.generate_mock_gstin(state_code VARCHAR(2), company_name VARCHAR(200))
RETURNS VARCHAR(15) AS $$
DECLARE
    pan_part VARCHAR(10);
    entity_code VARCHAR(1) := 'Z';
    checksum VARCHAR(1) := '5';
    random_num VARCHAR(4);
BEGIN
    -- Generate PAN-like part (5 letters + 4 numbers + 1 letter)
    pan_part := UPPER(SUBSTRING(MD5(company_name || NOW()::TEXT), 1, 5)) || 
                LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || 
                CHR(65 + FLOOR(RANDOM() * 26)::INT);
    
    RETURN state_code || pan_part || entity_code || checksum;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate GST Breakdown
CREATE OR REPLACE FUNCTION ems.calculate_gst_breakdown(
    taxable_amount NUMERIC,
    gst_rate NUMERIC,
    is_inter_state BOOLEAN,
    OUT cgst NUMERIC,
    OUT sgst NUMERIC,
    OUT igst NUMERIC
) AS $$
BEGIN
    IF is_inter_state THEN
        -- Inter-state: Only IGST
        cgst := 0;
        sgst := 0;
        igst := ROUND((taxable_amount * gst_rate / 100), 2);
    ELSE
        -- Intra-state: CGST + SGST
        cgst := ROUND((taxable_amount * gst_rate / 200), 2);
        sgst := ROUND((taxable_amount * gst_rate / 200), 2);
        igst := 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Current Ledger Balance
CREATE OR REPLACE FUNCTION ems.get_ledger_balance(
    p_company_id BIGINT,
    p_ledger_type VARCHAR(30)
) RETURNS NUMERIC AS $$
DECLARE
    current_balance NUMERIC;
BEGIN
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM ems.gst_lab_ledgers
    WHERE company_id = p_company_id AND ledger_type = p_ledger_type
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN COALESCE(current_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9️⃣ TRIGGERS (Auto-update Ledgers)
-- ═══════════════════════════════════════════════════════════════════════════

-- Trigger: Update Input Tax Credit Ledger on Purchase
CREATE OR REPLACE FUNCTION ems.update_itc_ledger_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
    current_balance NUMERIC;
BEGIN
    -- Get current ITC balance
    current_balance := ems.get_ledger_balance(NEW.company_id, 'INPUT_TAX_CREDIT');
    
    -- Add new ITC
    INSERT INTO ems.gst_lab_ledgers (
        company_id, ledger_type, transaction_date, description,
        reference_type, reference_id, debit_amount, balance
    ) VALUES (
        NEW.company_id,
        'INPUT_TAX_CREDIT',
        NEW.invoice_date,
        'ITC from Purchase - ' || NEW.supplier_name,
        'PURCHASE',
        NEW.id,
        NEW.total_gst_amount,
        current_balance + NEW.total_gst_amount
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_purchase_update_itc
AFTER INSERT ON ems.gst_lab_purchases
FOR EACH ROW EXECUTE FUNCTION ems.update_itc_ledger_on_purchase();

-- Trigger: Update Output Tax Liability Ledger on Sales
CREATE OR REPLACE FUNCTION ems.update_output_ledger_on_sales()
RETURNS TRIGGER AS $$
DECLARE
    current_balance NUMERIC;
BEGIN
    -- Get current Output GST balance
    current_balance := ems.get_ledger_balance(NEW.company_id, 'OUTPUT_TAX_LIABILITY');
    
    -- Add new Output GST
    INSERT INTO ems.gst_lab_ledgers (
        company_id, ledger_type, transaction_date, description,
        reference_type, reference_id, credit_amount, balance
    ) VALUES (
        NEW.company_id,
        'OUTPUT_TAX_LIABILITY',
        NEW.invoice_date,
        'Output GST from Sales - ' || NEW.customer_name,
        'SALES',
        NEW.id,
        NEW.total_gst_amount,
        current_balance + NEW.total_gst_amount
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sales_update_output
AFTER INSERT ON ems.gst_lab_sales
FOR EACH ROW EXECUTE FUNCTION ems.update_output_ledger_on_sales();

-- Trigger: Update Cash Ledger on Payment
CREATE OR REPLACE FUNCTION ems.update_cash_ledger_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    current_balance NUMERIC;
BEGIN
    -- Get current Cash balance
    current_balance := ems.get_ledger_balance(NEW.company_id, 'CASH_LEDGER');
    
    -- Add payment to cash ledger
    INSERT INTO ems.gst_lab_ledgers (
        company_id, ledger_type, transaction_date, description,
        reference_type, reference_id, debit_amount, balance
    ) VALUES (
        NEW.company_id,
        'CASH_LEDGER',
        NEW.payment_date,
        'Tax Payment - Challan ' || (SELECT challan_number FROM ems.gst_lab_challans WHERE id = NEW.challan_id),
        'PAYMENT',
        NEW.id,
        NEW.payment_amount,
        current_balance + NEW.payment_amount
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_update_cash
AFTER INSERT ON ems.gst_lab_payments
FOR EACH ROW EXECUTE FUNCTION ems.update_cash_ledger_on_payment();

-- ═══════════════════════════════════════════════════════════════════════════
-- 🎯 INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_gst_companies_allocation ON ems.gst_lab_companies(allocation_id);
CREATE INDEX IF NOT EXISTS idx_gst_companies_gstin ON ems.gst_lab_companies(gstin);

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ SCHEMA COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON SCHEMA ems IS 'Enhanced with GST Finance Lab - Complete educational simulation system';
