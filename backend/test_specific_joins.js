const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJoin() {
    console.log("Testing specific joins...");

    // Test 1: courses (published)
    const { error: err1 } = await supabase.schema('ems').from('live_classes').select('*, courses:course_id(course_name)').limit(1);
    console.log("Course Join:", err1 ? `❌ ${err1.message}` : "✅ Success");

    // Test 2: Tutor Join (using 'employees' as relation)
    const { error: err2 } = await supabase.schema('ems').from('live_classes').select('*, employees:tutor_id(id)').limit(1);
    console.log("Employees Join (id):", err2 ? `❌ ${err2.message}` : "✅ Success");

    // Test 3: Tutor Join with fields
    const { error: err3 } = await supabase.schema('ems').from('live_classes').select('*, employees:tutor_id(first_name, last_name)').limit(1);
    console.log("Employees Join (names):", err3 ? `❌ ${err3.message}` : "✅ Success");

    // Test 4: Batch Join
    const { error: err4 } = await supabase.schema('ems').from('live_classes').select('*, batches:batch_id(batch_name)').limit(1);
    console.log("Batch Join:", err4 ? `❌ ${err4.message}` : "✅ Success");
}
testJoin();
