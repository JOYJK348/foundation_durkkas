
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAssignments() {
    console.log("--- ASSIGNMENTS FOR EMP 123 (Priya Sharma) ---");

    // 1. Employee Link
    const { data: emp } = await supabase.schema('core').from('employees').select('*').eq('id', 123).single();
    console.log(`Emp 123 email: ${emp.email}, UserID: ${emp.user_id}`);

    // 2. Legacy Courses
    const { data: legacy } = await supabase.schema('ems').from('courses').select('id, course_name').eq('tutor_id', 123);
    console.log(`Legacy Courses:`, legacy);

    // 3. Multi-Tutor Junction
    const { data: ct } = await supabase.schema('ems').from('course_tutors').select('course_id').eq('tutor_id', 123).is('deleted_at', null);
    console.log(`Junction Course IDs:`, ct);

    if (ct && ct.length > 0) {
        const { data: courses } = await supabase.schema('ems').from('courses').select('id, course_name').in('id', ct.map(c => c.course_id));
        console.log(`Junction Courses:`, courses);
    }
}

checkAssignments();
