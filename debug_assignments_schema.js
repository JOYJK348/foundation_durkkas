
const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, 'backend/.env.local');
const env = dotenv.parse(fs.readFileSync(envPath, 'utf8'));

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Describing ems.assignments table...');

    // We can't describe directly via js client easily without parsing schema or using raw sql via some function if allowed.
    // Instead, I'll insert a dummy record with all fields and see what errors, or just selecting * from a known ID.

    const { data, error } = await supabase
        .schema('ems')
        .from('assignments')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns found:');
            Object.keys(data[0]).forEach(key => console.log(`- ${key}`));
        } else {
            console.log('No data found, cannot infer columns.');
            // Try to select specific columns I suspect exist
            const { error: colError } = await supabase
                .schema('ems')
                .from('assignments')
                .select('submission_mode, instructions')
                .limit(1);

            if (colError) {
                console.log('Columns likely missing:', colError.message);
            } else {
                console.log('submission_mode and instructions likely exist.');
            }
        }
    }
}

run();
