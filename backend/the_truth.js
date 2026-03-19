
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findTheTruth() {
    console.log("Fetching data...");

    // 1. Get all users
    const { data: users } = await supabase.schema('app_auth').from('users').select('id, email, first_name');

    // 2. Get all employees
    const { data: emps } = await supabase.schema('core').from('employees').select('id, user_id, email, first_name');

    // 3. Get all courses with tutors
    const { data: courses } = await supabase.schema('ems').from('courses').select('id, course_name, tutor_id');

    // 4. Get all junction mappings
    const { data: ct } = await supabase.schema('ems').from('course_tutors').select('tutor_id, course_id').is('deleted_at', null);

    const connections = {
        courses: courses.map(c => {
            const emp = emps.find(e => e.id === c.tutor_id);
            const user = emp ? users.find(u => u.id === emp.user_id) : null;
            return {
                course: c.course_name,
                tutor_emp_id: c.tutor_id,
                tutor_email: emp?.email,
                tutor_user_id: emp?.user_id,
                auth_email: user?.email
            };
        }),
        junctions: ct.map(m => {
            const emp = emps.find(e => e.id === m.tutor_id);
            const user = emp ? users.find(u => u.id === emp.user_id) : null;
            return {
                courseId: m.course_id,
                tutor_emp_id: m.tutor_id,
                tutor_email: emp?.email,
                auth_email: user?.email
            };
        }),
        all_tutors_in_auth: users.filter(u => u.email.includes('chen') || u.email.includes('sharma') || u.email.includes('kumar'))
    };

    fs.writeFileSync('THE_TRUTH.json', JSON.stringify(connections, null, 2));
    console.log("Written to THE_TRUTH.json");
}

findTheTruth();
