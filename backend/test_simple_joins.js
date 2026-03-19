const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJoin2() {
    console.log("Testing simplified joins...");

    // Test 1: courses (published)
    const { error: err1 } = await supabase.schema('ems').from('live_classes').select('*, courses(course_name)').limit(1);
    console.log("Course Join:", err1 ? `❌ ${err1.message}` : "✅ Success");

    // Test 2: Employees Join (simple)
    const { error: err2 } = await supabase.schema('ems').from('live_classes').select('*, employees(first_name, last_name)').limit(1);
    console.log("Employees Join:", err2 ? `❌ ${err2.message}` : "✅ Success");

    // Test 3: Batches Join (simple)
    const { error: err3 } = await supabase.schema('ems').from('live_classes').select('*, batches(batch_name)').limit(1);
    console.log("Batches Join:", err3 ? `❌ ${err3.message}` : "✅ Success");
}
testJoin2();
