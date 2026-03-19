
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPriya() {
    console.log("CHECKING PRIYA SHARMA:");
    const { data: user } = await supabase.schema('app_auth').from('users').select('id, email').eq('email', 'priya.sharma@durkkas.com').single();
    if (!user) { console.log("User not found"); return; }
    console.log(`User ID: ${user.id}`);

    const { data: emp } = await supabase.from('employees').select('id, company_id').eq('user_id', user.id).single();
    console.log(`Employee Record:`, emp);

    if (emp) {
        const { data: courses } = await supabase.schema('ems').from('courses').select('id, course_name, tutor_id').eq('tutor_id', emp.id);
        console.log(`Legacy Assigned Courses:`, courses);

        const { data: mapping } = await supabase.schema('ems').from('course_tutors').select('course_id').eq('tutor_id', emp.id).is('deleted_at', null);
        console.log(`Junction Table Assignments:`, mapping);
    }
}

checkPriya();
