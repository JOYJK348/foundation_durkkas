
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findCourses() {
    const { data: courses } = await supabase.schema('ems').from('courses').select('id, course_name');
    fs.writeFileSync('courses_full_list.json', JSON.stringify(courses, null, 2));
}

findCourses();
