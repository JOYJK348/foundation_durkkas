const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalTest() {
    const s = `*, courses:course_id (course_name, course_code), batches:batch_id (batch_name)`;
    const { data, error } = await supabase.schema('ems').from('live_classes').select(s).limit(1);
    if (error) {
        console.log("❌ Failed:", error.message);
    } else {
        console.log("✅ Success!");
        console.log("Relations:", Object.keys(data[0] || {}).filter(k => typeof data[0][k] === 'object'));
    }
}
finalTest();
