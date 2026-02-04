
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runReport() {
    const report = {
        timestamp: new Date().toISOString(),
        tutors: []
    };

    const emails = ['priya.sharma@durkkas.com', 'arun.patel@durkkas.com'];

    for (const email of emails) {
        const { data: user } = await supabase.schema('app_auth').from('users').select('id').eq('email', email).single();
        if (!user) continue;

        const { data: emp } = await supabase.schema('core').from('employees').select('*').eq('user_id', user.id).eq('company_id', 13);

        const tutor = {
            email,
            userId: user.id,
            employeeCount: emp?.length || 0,
            employeeIds: emp?.map(e => e.id) || [],
            courses: []
        };

        if (emp?.length === 1) {
            const tutorId = emp[0].id;
            const { data: junction } = await supabase.schema('ems').from('course_tutors').select('course_id').eq('tutor_id', tutorId).is('deleted_at', null);
            const { data: legacy } = await supabase.schema('ems').from('courses').select('id').eq('tutor_id', tutorId).is('deleted_at', null);

            const ids = [...new Set([...(junction?.map(j => j.course_id) || []), ...(legacy?.map(l => l.id) || [])])];
            if (ids.length > 0) {
                const { data: courses } = await supabase.schema('ems').from('courses').select('course_name').in('id', ids);
                tutor.courses = courses.map(c => c.course_name);
            }
        }
        report.tutors.push(tutor);
    }

    fs.writeFileSync('FINAL_STATUS_REPORT.json', JSON.stringify(report, null, 2));
    console.log("Report generated: FINAL_STATUS_REPORT.json");
}

runReport();
