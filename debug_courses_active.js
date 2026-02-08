
const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, 'backend/.env.local');
const env = dotenv.parse(fs.readFileSync(envPath, 'utf8'));

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Checking active courses...');

    // Check for active courses (deleted_at is null)
    const { data: courses, error } = await supabase
        .schema('ems')
        .from('courses')
        .select('*')
        .is('deleted_at', null);

    if (error) {
        console.error('Error fetching courses:', error);
    } else {
        console.log(`Found ${courses.length} ACTIVE (not deleted) courses:`);
        courses.forEach(c => console.log(`- [${c.id}] ${c.course_name} (Company: ${c.company_id})`));

        if (courses.length === 0) {
            console.log('No active courses found! Let us check if there are deleted ones.');
            const { data: allCourses } = await supabase.schema('ems').from('courses').select('*');
            console.log(`Total courses (including deleted): ${allCourses.length}`);
        }
    }
}

run();
