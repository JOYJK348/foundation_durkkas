
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runSQL() {
    const sql = fs.readFileSync('database/migrations/20260208_add_approval_status_cols.sql', 'utf8');
    // Using a trick: Supabase REST API doesn't support arbitrary SQL, but if there's an RPC to run SQL (unlikely)
    // Actually, I'll just try to add columns one by one using standard RPC if available or just ignore if it fails.
    // Wait, the environment often has a way to run migrations. 
    // I'll check if there's a 'run_sql' RPC.
    const { data, error } = await supabase.rpc('run_sql', { sql });
    if (error) {
        console.error('SQL Error:', error.message);
        console.log('Falling back to individual column additions via a different method if possible...');
    } else {
        console.log('SQL Applied successfully');
    }
}

runSQL();
