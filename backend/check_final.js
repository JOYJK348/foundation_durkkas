
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFinal() {
    console.log("FINAL CHECK - TUTOR ASSIGNMENTS:");
    const { data: emps } = await supabase.schema('core').from('employees').select('id, email, user_id, first_name');
    const { data: courses } = await supabase.schema('ems').from('courses').select('id, course_name, tutor_id');
    const { data: ct } = await supabase.schema('ems').from('course_tutors').select('*').is('deleted_at', null);

    const targetTutors = emps.filter(e => e.first_name.includes('Priya') || e.first_name.includes('Arun'));

    targetTutors.forEach(e => {
        const c_legacy = courses.filter(c => c.tutor_id === e.id);
        const c_junction = ct.filter(m => m.tutor_id === e.id);
        console.log(`\nTutor: ${e.first_name} (${e.email})`);
        console.log(`- UserID: ${e.user_id}`);
        console.log(`- Legacy Courses: ${c_legacy.map(c => c.course_name).join(', ')}`);
        console.log(`- Junction Courses: ${c_junction.map(m => courses.find(c => c.id === m.course_id)?.course_name).join(', ')}`);
    });
}

checkFinal();
