
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceAssign() {
    console.log("Force assigning courses to Priya (123) and Arun (119)...");

    const priyaId = 123;
    const arunId = 119;
    const companyId = 13;

    // 1. Assign Priya to Course 1 (Full Stack)
    await supabase.schema('ems').from('course_tutors').upsert({
        course_id: 1,
        tutor_id: priyaId,
        company_id: companyId,
        tutor_role: 'INSTRUCTOR',
        is_primary: true
    }, { onConflict: 'course_id,tutor_id' });

    // 2. Assign Priya to Course 2 (Data Science)
    await supabase.schema('ems').from('course_tutors').upsert({
        course_id: 2,
        tutor_id: priyaId,
        company_id: companyId,
        tutor_role: 'INSTRUCTOR',
        is_primary: false
    }, { onConflict: 'course_id,tutor_id' });

    // 3. Assign Arun to Course 2 (Data Science)
    await supabase.schema('ems').from('course_tutors').upsert({
        course_id: 2,
        tutor_id: arunId,
        company_id: companyId,
        tutor_role: 'INSTRUCTOR',
        is_primary: true
    }, { onConflict: 'course_id,tutor_id' });

    console.log("Assignments complete.");
}

forceAssign();
