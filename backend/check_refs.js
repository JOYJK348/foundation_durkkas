
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkReferences(id) {
    console.log(`Checking references for Employee ID: ${id}`);

    // Check Courses (Legacy)
    const { data: courses } = await supabase.schema('ems').from('courses').select('id, course_name').eq('tutor_id', id);
    if (courses?.length > 0) console.log("Referenced in ems.courses:", courses);

    // Check course_tutors
    const { data: ct } = await supabase.schema('ems').from('course_tutors').select('id').eq('tutor_id', id);
    if (ct?.length > 0) console.log("Referenced in ems.course_tutors:", ct);

    // Check live_classes (tutor_id might exist there)
    // First check columns of live_classes
    const { data: lc } = await supabase.schema('ems').from('live_classes').select('*').limit(1);
    if (lc && lc[0]) {
        if ('tutor_id' in lc[0]) {
            const { data: lcRef } = await supabase.schema('ems').from('live_classes').select('id').eq('tutor_id', id);
            if (lcRef?.length > 0) console.log("Referenced in ems.live_classes:", lcRef);
        }
    }
}

checkReferences(112);
