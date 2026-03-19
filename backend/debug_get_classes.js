const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugGet() {
    console.log("Debugging GET live classes...");

    // Test 1: courses and batches (using :col_id format)
    const s1 = `*, courses:course_id(course_name), batches:batch_id(batch_name)`;
    const { data: d1, error: e1 } = await supabase.schema('ems').from('live_classes').select(s1).limit(1);
    console.log(`Test 1 [${s1}]:`, e1 ? `❌ ${e1.message}` : "✅ Success");

    // Test 2: employees join
    const s2 = `*, employees:tutor_id(first_name, last_name)`;
    const { data: d2, error: e2 } = await supabase.schema('ems').from('live_classes').select(s2).limit(1);
    console.log(`Test 2 [${s2}]:`, e2 ? `❌ ${e2.message}` : "✅ Success");

    // Test 3: core_employees join
    const s3 = `*, core_employees:tutor_id(first_name, last_name)`;
    const { data: d3, error: e3 } = await supabase.schema('ems').from('live_classes').select(s3).limit(1);
    console.log(`Test 3 [${s3}]:`, e3 ? `❌ ${e3.message}` : "✅ Success");
}
debugGet();
