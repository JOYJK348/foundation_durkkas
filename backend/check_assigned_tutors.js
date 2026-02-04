
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTutors() {
    const report = { junction: [], legacy: [] };

    const { data: ct } = await supabase.schema('ems').from('course_tutors').select('tutor_id, course_id').is('deleted_at', null);
    if (ct) {
        for (const m of ct) {
            const { data: emp } = await supabase.schema('core').from('employees').select('id, email, first_name').eq('id', m.tutor_id).single();
            report.junction.push({ courseId: m.course_id, tutorEmail: emp?.email, tutorName: emp?.first_name, tutorId: m.tutor_id });
        }
    }

    const { data: courses } = await supabase.schema('ems').from('courses').select('id, course_name, tutor_id').not('tutor_id', 'is', null);
    if (courses) {
        for (const c of courses) {
            const { data: emp } = await supabase.schema('core').from('employees').select('id, email, first_name').eq('id', c.tutor_id).single();
            report.legacy.push({ course: c.course_name, tutorEmail: emp?.email, tutorName: emp?.first_name, tutorId: c.tutor_id });
        }
    }
    fs.writeFileSync('tutor_report.json', JSON.stringify(report, null, 2));
}

checkTutors();
