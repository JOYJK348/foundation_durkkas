
const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, 'backend/.env.local');
const env = dotenv.parse(fs.readFileSync(envPath, 'utf8'));

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Checking courses...');
    const { data: courses, error } = await supabase
        .schema('ems')
        .from('courses')
        .select('*');

    if (error) {
        console.error('Error fetching courses:', error);
    } else {
        console.log(`Found ${courses.length} courses:`);
        courses.forEach(c => console.log(`- [${c.id}] ${c.course_name} (Company: ${c.company_id})`));
    }

    console.log('\nChecking batches...');
    const { data: batches, error: batchError } = await supabase
        .schema('ems')
        .from('batches')
        .select('*');

    if (batchError) {
        console.error('Error fetching batches:', batchError);
    } else {
        console.log(`Found ${batches.length} batches:`);
        batches.forEach(b => console.log(`- [${b.id}] ${b.batch_name} (Course: ${b.course_id}, Company: ${b.company_id})`));
    }
}

run();
