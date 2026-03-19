
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCourseTutors() {
    console.log("COURSE TUTORS MAPPINGS:");
    const { data: ct } = await supabase.schema('ems').from('course_tutors').select('*').is('deleted_at', null);

    if (ct) {
        for (const m of ct) {
            const { data: emp } = await supabase.schema('core').from('employees').select('id, user_id, email, first_name').eq('id', m.tutor_id).single();
            const { data: course } = await supabase.schema('ems').from('courses').select('id, course_name').eq('id', m.course_id).single();
            console.log(`Course: ${course?.course_name}, TutorID: ${m.tutor_id} (${emp?.first_name} - ${emp?.email}), UserID: ${emp?.user_id}`);
        }
    }
}

checkCourseTutors();
