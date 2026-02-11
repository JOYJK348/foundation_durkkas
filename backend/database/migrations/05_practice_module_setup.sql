/*
 * PRACTICAL SIMULATION MODULE SCHEMA - FINAL
 * 
 * Implements the "Study Accounts" style training system within EMS.
 * 
 * Features:
 * 1. Admin Dashboard: License/Quota Management (Total vs Used).
 * 2. Course Integration: Only FINANCE courses get access.
 * 3. Student Limiting: Set attempts limit (e.g., 5 invoices max).
 * 4. Sandbox: Isolated tables for practice data (GST/TDS).
 */

-- 1. Quota / License Management (Admin Dashboard)
-- Tracks how many seats the college has for GST, TDS, Income Tax.
CREATE TABLE IF NOT EXISTS ems.practice_quotas (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES core.companies(id) ON DELETE CASCADE,
    module_type VARCHAR(50) CHECK (module_type IN ('GST', 'TDS', 'INCOME_TAX')),
    
    total_licenses INTEGER DEFAULT 0, -- "My Subscription Plan" limit
    used_licenses INTEGER DEFAULT 0,  -- "Users Created" count
    
    license_expiry DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, module_type)
);

-- 2. Student Usage Mapping (Who is using?)
-- Maps a real student to a practice module slot
CREATE TABLE IF NOT EXISTS ems.student_practice_allocations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES core.companies(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES ems.students(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES ems.courses(id) ON DELETE CASCADE, -- Link to specific course
    
    module_type VARCHAR(50) CHECK (module_type IN ('GST', 'TDS', 'INCOME_TAX')),
    
    -- Limit Configuration
    usage_limit INTEGER DEFAULT 5,    -- Max attempts allowed (e.g. 5 invoices)
    used_count INTEGER DEFAULT 0,     -- Current usage
    
    allocated_by BIGINT, -- Admin who assigned access
    allocated_at TIMESTAMPTZ DEFAULT NOW(),
    
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, REVOKED, LIMIT_REACHED
    
    UNIQUE(student_id, module_type, course_id)
);

-- 3. GST Simulation Table (The "Virtual" Data)
-- Where students enter their practice invoices
CREATE TABLE IF NOT EXISTS ems.practice_gst_entries (
    id BIGSERIAL PRIMARY KEY,
    allocation_id BIGINT REFERENCES ems.student_practice_allocations(id) ON DELETE CASCADE,
    
    -- Transaction Details
    entry_type VARCHAR(20) CHECK (entry_type IN ('SALES', 'PURCHASE', 'CREDIT_NOTE', 'DEBIT_NOTE')),
    date DATE NOT NULL,
    invoice_number VARCHAR(50),
    
    -- Counter Party Details (Simulated)
    party_name VARCHAR(100),
    party_gstin VARCHAR(15), -- Used for validation logic
    place_of_supply VARCHAR(50),
    hsn_sac_code VARCHAR(10),
    
    -- Amounts
    taxable_value NUMERIC(15,2) DEFAULT 0,
    gst_rate NUMERIC(5,2) DEFAULT 18, -- 5, 12, 18, 28
    
    igst_amount NUMERIC(15,2) DEFAULT 0,
    cgst_amount NUMERIC(15,2) DEFAULT 0,
    sgst_amount NUMERIC(15,2) DEFAULT 0,
    
    total_amount NUMERIC(15,2) DEFAULT 0,
    
    -- Validation / Grading
    is_correct BOOLEAN DEFAULT NULL, -- System validates later
    feedback_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GST Returns Simulation (GSTR1, GSTR3B)
CREATE TABLE IF NOT EXISTS ems.practice_gst_returns (
    id BIGSERIAL PRIMARY KEY,
    allocation_id BIGINT REFERENCES ems.student_practice_allocations(id) ON DELETE CASCADE,
    
    return_type VARCHAR(20) CHECK (return_type IN ('GSTR1', 'GSTR3B')),
    return_period VARCHAR(20), -- e.g., "April 2026"
    
    total_tax_liability NUMERIC(15,2) DEFAULT 0,
    input_tax_credit NUMERIC(15,2) DEFAULT 0,
    net_tax_payable NUMERIC(15,2) DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, FILED
    filed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TDS Simulation Table
CREATE TABLE IF NOT EXISTS ems.practice_tds_entries (
    id BIGSERIAL PRIMARY KEY,
    allocation_id BIGINT REFERENCES ems.student_practice_allocations(id) ON DELETE CASCADE,
    
    deductor_name VARCHAR(100), -- Who Deducted?
    deductee_pan VARCHAR(10),   -- Student's fake PAN
    
    section_code VARCHAR(10),   -- 194C, 194J, etc.
    payment_amount NUMERIC(15,2),
    tds_rate NUMERIC(5,2),
    tds_deducted NUMERIC(15,2),
    
    date DATE NOT NULL,
    certificate_url TEXT, -- Uploaded Form 16A (optional)
    
    -- Validation / Grading (Reusing pattern)
    is_correct BOOLEAN DEFAULT NULL,
    feedback_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Income Tax Simulation
CREATE TABLE IF NOT EXISTS ems.practice_it_returns (
    id BIGSERIAL PRIMARY KEY,
    allocation_id BIGINT REFERENCES ems.student_practice_allocations(id) ON DELETE CASCADE,
    
    assessment_year VARCHAR(10), -- e.g., "2026-2027"
    pan_number VARCHAR(10),
    
    gross_total_income NUMERIC(15,2) DEFAULT 0,
    deductions_80c NUMERIC(15,2) DEFAULT 0,
    deductions_other NUMERIC(15,2) DEFAULT 0,
    
    taxable_income NUMERIC(15,2) DEFAULT 0,
    tax_payable NUMERIC(15,2) DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, VERIFIED
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Add Configuration to Courses Table (To enable modules)
ALTER TABLE ems.courses 
ADD COLUMN IF NOT EXISTS enabled_practice_modules JSONB DEFAULT '[]'::jsonb;
-- Example data: ['GST', 'TDS'] or []

-- Indexes for Dashboard Performance
CREATE INDEX IF NOT EXISTS idx_practice_quotas_company ON ems.practice_quotas(company_id);
CREATE INDEX IF NOT EXISTS idx_practice_allocations_student ON ems.student_practice_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_practice_allocations_course ON ems.student_practice_allocations(course_id);
CREATE INDEX IF NOT EXISTS idx_practice_allocations_company_module ON ems.student_practice_allocations(company_id, module_type);

-- COMMENTS
COMMENT ON TABLE ems.practice_quotas IS 'Tracks the number of licenses purchased/assigned for simulation modules';
COMMENT ON TABLE ems.student_practice_allocations IS 'Links a student to a specific practice module (consuming a license)';
COMMENT ON TABLE ems.practice_gst_entries IS 'Sandbox table for students to practice GST invoicing';
COMMENT ON COLUMN ems.student_practice_allocations.usage_limit IS 'Max number of activities allowed (default 5)';
COMMENT ON COLUMN ems.courses.enabled_practice_modules IS 'JSON array of modules enabled for this course (e.g. ["GST", "TDS"])';
