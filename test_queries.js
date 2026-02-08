const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const envFile = fs.readFileSync('./backend/.env.local', 'utf8');
const env = dotenv.parse(envFile);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTriggerQueries() {
    console.log('--- TESTING ENROLLMENT JOIN ---');
    // Try different join syntax
    const { data: e1, error: err1 } = await supabase
        .schema('ems')
        .from('student_enrollments')
        .select('student_id, students:student_id (user_id)')
        .limit(1);

    if (err1) console.log('Join 1 Failed:', err1.message);
    else console.log('Join 1 Success:', JSON.stringify(e1));

    const { data: e2, error: err2 } = await supabase
        .schema('ems')
        .from('student_enrollments')
        .select('student_id, students (user_id)')
        .limit(1);

    if (err2) console.log('Join 2 Failed:', err2.message);
    else console.log('Join 2 Success:', JSON.stringify(e2));

    console.log('\n--- TESTING ASSIGNMENT RELATIONS ---');
    const { data: a1, error: aErr1 } = await supabase
        .schema('ems')
        .from('assignments')
        .select('id, courses:course_id (course_name)')
        .limit(1);

    if (aErr1) console.log('Assign Join Failed:', aErr1.message);
    else console.log('Assign Join Success:', JSON.stringify(a1));
}

testTriggerQueries();
