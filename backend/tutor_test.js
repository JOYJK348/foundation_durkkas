const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function tutorTest() {
    const s = `*, tutors:employees!tutor_id(id, first_name, last_name)`;
    const { data, error } = await supabase.schema('ems').from('live_classes').select(s).limit(1);
    if (error) {
        console.log("❌ Failed:", error.message);
    } else {
        console.log("✅ Success!");
    }
}
tutorTest();
