-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIX: Branch Code Uniqueness for Soft-Deleted Records
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Problem: The UNIQUE(company_id, code) constraint prevents creating a new branch
-- with the same code as an archived (soft-deleted) branch.
--
-- Solution: Replace the table-level constraint with a partial unique index that
-- only enforces uniqueness for active (non-deleted) branches.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Drop the existing table-level UNIQUE constraint
ALTER TABLE core.branches DROP CONSTRAINT IF EXISTS branches_company_id_code_key;

-- 2. Create a partial unique index that only applies to non-deleted branches
-- This allows the same branch code to be reused after archiving
CREATE UNIQUE INDEX IF NOT EXISTS idx_branches_company_code_active 
ON core.branches (company_id, code) 
WHERE deleted_at IS NULL;

-- 3. Add comment for documentation
COMMENT ON INDEX core.idx_branches_company_code_active IS 
'Ensures branch codes are unique per company, but only for active (non-deleted) branches. Allows code reuse after archiving.';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Verify the constraint was removed and index was created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'branches' 
  AND schemaname = 'core'
  AND indexname = 'idx_branches_company_code_active';
