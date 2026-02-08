const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const env = dotenv.parse(fs.readFileSync('./backend/.env.local', 'utf8'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: assignments } = await supabase.schema('ems').from('assignments').select('*').eq('company_id', 13);
    console.log('--- ALL ASSIGNMENTS (Company 13) ---');
    assignments.forEach(a => {
        console.log(`ID: ${a.id} | Title: ${a.assignment_title} | Course: ${a.course_id} | Batch: ${a.batch_id} | Active: ${a.is_active} | Deadline: ${a.deadline}`);
    });

    const { data: enrollments } = await supabase.schema('ems').from('student_enrollments').select('course_id, batch_id').eq('student_id', 41).eq('enrollment_status', 'ACTIVE');
    console.log('\n--- STUDENT 41 ENROLLMENTS ---');
    enrollments.forEach(e => {
        console.log(`Course: ${e.course_id} | Batch: ${e.batch_id}`);
    });
}
run();
