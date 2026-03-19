
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTutorView(email) {
    const { data: user } = await supabase.schema('app_auth').from('users').select('id').eq('email', email).single();
    if (!user) return console.log("User not found: " + email);
    const userId = user.id;

    const { data: employee } = await supabase.schema('core').from('employees').select('id, company_id').eq('user_id', userId).single();
    if (!employee) return console.log("Employee not found for: " + email);
    const tutorId = employee.id;
    const companyId = employee.company_id;

    const { data: junctionMappings } = await supabase.schema('ems').from('course_tutors').select('course_id').eq('tutor_id', tutorId).is('deleted_at', null);
    const { data: legacyCourses } = await supabase.schema('ems').from('courses').select('id').eq('tutor_id', tutorId).is('deleted_at', null);

    const assignedIds = [...new Set([
        ...(junctionMappings?.map(m => m.course_id) || []),
        ...(legacyCourses?.map(c => c.id) || [])
    ])];

    const { data: qResult } = await supabase.schema('ems').from('quizzes').select('id').in('course_id', assignedIds).eq('company_id', companyId).is('deleted_at', null);
    const { data: aResult } = await supabase.schema('ems').from('assignments').select('id').in('course_id', assignedIds).eq('company_id', companyId).is('deleted_at', null);

    return {
        email,
        courses: assignedIds,
        quizzes: qResult?.length || 0,
        assignments: aResult?.length || 0
    };
}

async function run() {
    const p = await testTutorView('priya.sharma@durkkas.com');
    const a = await testTutorView('arun.patel@durkkas.com');
    console.log(JSON.stringify({ priya: p, arun: a }, null, 2));
}

run();
