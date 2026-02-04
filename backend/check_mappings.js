
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
    const { data: emps, error: e1 } = await supabase.from('employees').select('id, user_id, email, company_id');
    if (e1) console.error("E1:", e1);
    else {
        console.log("EMPLOYEES:", emps.length);
        emps.forEach(e => console.log(`EmpID: ${e.id}, UserID: ${e.user_id}, Email: ${e.email}, CompID: ${e.company_id}`));
    }

    const { data: courses, error: e2 } = await supabase.schema('ems').from('courses').select('id, course_name, tutor_id, company_id');
    if (e2) console.error("E2:", e2);
    else {
        console.log("\nCOURSES:", courses.length);
        courses.forEach(c => console.log(`CourseID: ${c.id}, Name: ${c.course_name}, LegacyTutor: ${c.tutor_id}, CompID: ${c.company_id}`));
    }

    const { data: ct, error: e3 } = await supabase.schema('ems').from('course_tutors').select('id, course_id, tutor_id, company_id').is('deleted_at', null);
    if (e3) console.error("E3:", e3);
    else {
        console.log("\nCOURSE_TUTORS:", ct.length);
        ct.forEach(m => console.log(`MapID: ${m.id}, CourseID: ${m.course_id}, TutorID: ${m.tutor_id}, CompID: ${m.company_id}`));
    }
}

checkData();
