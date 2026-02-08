const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

// Manual env load
const envFile = fs.readFileSync('./backend/.env', 'utf8');
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
        .select('id, batch_id, submission_mode')
        .limit(1);

    if (error) {
        console.error('Schema Error (Probably missing columns):', error.message);
        if (error.message.includes('column "batch_id" does not exist')) {
            console.log('CONFIRMED: batch_id column is missing.');
        }
    } else {
        console.log('Columns exist! Data:', data);
    }
}

checkSchema();
