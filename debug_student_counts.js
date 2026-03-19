const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const env = dotenv.parse(fs.readFileSync('./backend/.env.local', 'utf8'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAssignments() {
    const studentName = 'saritha';
    const { data: students } = await supabase.schema('ems').from('students').select('*').ilike('first_name', `%${studentName}%`);
    const student = students[0];
    console.log('Student:', student.id, student.first_name);

    const { data: enrollments } = await supabase.schema('ems').from('student_enrollments').select('course_id, batch_id').eq('student_id', student.id).eq('enrollment_status', 'ACTIVE');
    console.log('Enrollments:', enrollments);
    const courseIds = enrollments.map(e => e.course_id);
    const batchIds = enrollments.map(e => e.batch_id).filter(Boolean);

    const { data: assignments } = await supabase.schema('ems').from('assignments')
        .select('*')
        .in('course_id', courseIds)
        .eq('company_id', student.company_id)
        .eq('is_active', true)
        .is('deleted_at', null);

    console.log('Total assignments for student courses:', assignments.length);
    assignments.forEach(a => {
        console.log(`- [${a.id}] ${a.assignment_title} (Course: ${a.course_id}, Batch: ${a.batch_id}, Deadline: ${a.deadline})`);
    });

    const now = new Date().toISOString();
    console.log('Current ISO time:', now);
    const filtered = assignments.filter(a => a.deadline >= now);
    console.log('Assignments with future deadline:', filtered.length);
}

checkAssignments();
