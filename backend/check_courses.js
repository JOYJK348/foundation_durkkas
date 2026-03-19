const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: courses } = await supabase.schema('ems').from('courses').select('id, course_code, course_name, company_id');
    console.log(JSON.stringify(courses, null, 2));
}
check();
