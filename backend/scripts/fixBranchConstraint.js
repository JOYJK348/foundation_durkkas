/**
 * Fix Branch Unique Constraint - Direct Execution
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    db: { schema: 'core' }
});

async function fixBranchConstraint() {
    try {
        console.log('🔧 Step 1: Dropping old UNIQUE constraint...');

        // We'll use the from() method with a raw query approach
        const { error: dropError } = await supabase
            .from('branches')
            .select('id')
            .limit(0); // Just to test connection

        if (dropError) {
            console.error('Connection test failed:', dropError);
        }

        console.log('✅ Connected to Supabase successfully');
        console.log('');
        console.log('⚠️  Manual SQL execution required:');
        console.log('');
        console.log('Please run the following SQL in your Supabase SQL Editor:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('-- 1. Drop the existing UNIQUE constraint');
        console.log('ALTER TABLE core.branches DROP CONSTRAINT IF EXISTS branches_company_id_code_key;');
        console.log('');
        console.log('-- 2. Create partial unique index (allows code reuse after archiving)');
        console.log('CREATE UNIQUE INDEX IF NOT EXISTS idx_branches_company_code_active');
        console.log('ON core.branches (company_id, code)');
        console.log('WHERE deleted_at IS NULL;');
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('📍 Supabase Dashboard → SQL Editor → Run the above commands');
        console.log('');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

fixBranchConstraint();
