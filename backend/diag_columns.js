const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    // Hacky way to see columns: try to insert something invalid and see the error message if it lists columns, 
    // or just try to select 1 and check keys if it has data.
    // Better: use direct SQL via a temporary function if possible, but let's try selecting first.

    // Check Courses too as a reference
    const { data: courses } = await supabase.schema('ems').from('courses').select('*').limit(1);
    if (courses && courses.length > 0) console.log("Courses Columns:", Object.keys(courses[0]));

    const { data: live, error } = await supabase.schema('ems').from('live_classes').select('*').limit(1);
    if (error) {
        console.log("Live Classes Error:", error.message);
    } else if (live && live.length > 0) {
        console.log("Live Classes Columns:", Object.keys(live[0]));
    } else {
        console.log("Live Classes Table is EMPTY. Cannot see columns via simple select.");
        // Try to insert a dummy row with only ID to see what it accepts?
        // No, let's just use the ALTER approach.
    }
}
check();
