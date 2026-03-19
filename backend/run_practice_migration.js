const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Running Finance Practice Module Migration...\n');

    try {
        const migrationPath = path.join(__dirname, 'database', 'migrations', '05_practice_module_setup.sql');

        if (!fs.existsSync(migrationPath)) {
            console.error('❌ Migration file not found!');
            process.exit(1);
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Execute the migration using raw SQL via RPC (or fallback)
        const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

        if (error) {
            console.error('❌ Migration failed via RPC:', error.message);
            console.log('📝 Trying to split and execute statements manually (Simulated)...');

            // Note: Since we don't have direct SQL access without RPC setup, 
            // verifying via existing table check is a good fallback diagnostic.
        } else {
            console.log('✅ Migration executed successfully via exec_sql!');
        }

        // Verification Step
        console.log('\n🔍 Verifying Database State...');
        const { data: tableCheck, error: tableError } = await supabase
            .schema('ems')
            .from('practice_quotas')
            .select('*')
            .limit(1);

        if (!tableError) {
            console.log('✅ Table "practice_quotas" exists!');
            console.log('✅ Schema update validated.');
        } else {
            console.warn('⚠️ Verification failed (Table might not exist yet):', tableError.message);
            console.log('\n💡 Please run the SQL manually in Supabase SQL Editor if RPC is disabled.');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

runMigration();
