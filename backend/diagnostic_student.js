
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log('--- STUDENT DIAGNOSTIC ---');
    const { data: students, error } = await supabase.schema('ems').from('students').select('id, user_id, company_id, first_name').order('id', { ascending: false }).limit(5);
    console.log('Last 5 Students:', students);

    if (students && students.length > 0) {
        const { data: qas, error: qasErr } = await supabase.schema('ems').from('quiz_assignments').select('*').eq('student_id', students[0].id);
        console.log('Assignments for newest student:', qas);
    }
}

check();
