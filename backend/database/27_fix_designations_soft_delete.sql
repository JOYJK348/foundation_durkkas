-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIX MISSING SOFT DELETE FOR DESIGNATIONS
-- Add soft delete tracking to core.designations table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Add soft delete columns to core.designations
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'designations') THEN
        ALTER TABLE core.designations 
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES app_auth.users(id),
        ADD COLUMN IF NOT EXISTS delete_reason TEXT;
        
        RAISE NOTICE '✅ Added soft delete columns to core.designations';
    ELSE
        RAISE WARNING '⚠️ Table core.designations does not exist';
    END IF;
END $$;

-- 2. Add comments for documentation
COMMENT ON COLUMN core.designations.deleted_at IS 'Timestamp when designation was soft deleted';
COMMENT ON COLUMN core.designations.deleted_by IS 'User ID who performed the deletion';
COMMENT ON COLUMN core.designations.delete_reason IS 'Reason for designation deletion (required for audit)';

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_designations_deleted_at ON core.designations(deleted_at) WHERE deleted_at IS NOT NULL;
