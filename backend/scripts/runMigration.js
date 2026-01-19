/**
 * Execute SQL Migration Script
 * Usage: node scripts/runMigration.js database/32_fix_branch_unique_constraint.sql
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

async function runMigration(sqlFilePath) {
    try {
        console.log(`📄 Reading SQL file: ${sqlFilePath}`);
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        console.log(`🚀 Executing migration...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

        if (error) {
            console.error('❌ Migration failed:', error);
            process.exit(1);
        }

        console.log('✅ Migration completed successfully!');
        if (data) {
            console.log('📊 Result:', data);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

// Get SQL file path from command line argument
const sqlFile = process.argv[2];
if (!sqlFile) {
    console.error('❌ Usage: node scripts/runMigration.js <path-to-sql-file>');
    process.exit(1);
}

const fullPath = path.resolve(__dirname, '..', sqlFile);
if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    process.exit(1);
}

runMigration(fullPath);
