const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('Running migrations...');

    // We can't run raw SQL easily without RPC, but we can try to check columns 
    // and see if they exist. If they don't, we know why it's failing.

    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        const columns = Object.keys(data[0] || {});
        console.log('Existing columns:', columns);

        if (!columns.includes('batch_id')) console.log('MISSING: batch_id');
        if (!columns.includes('submission_mode')) console.log('MISSING: submission_mode');
    }
}

runMigration();
