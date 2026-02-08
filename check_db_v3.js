const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

// Manual env load from .env.local
const envFile = fs.readFileSync('./backend/.env.local', 'utf8');
const env = dotenv.parse(envFile);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking assignments schema...');

    // We try to fetch with the new columns
    const { data, error } = await supabase
        .schema('ems')
        .from('assignments')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Fetch Error:', error.message);
    } else {
        const columns = Object.keys(data[0] || {});
        console.log('Existing columns:', columns);

        if (!columns.includes('batch_id')) console.log('MISSING: batch_id');
        if (!columns.includes('submission_mode')) console.log('MISSING: submission_mode');
    }
}

checkSchema();
