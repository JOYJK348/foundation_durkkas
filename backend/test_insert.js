const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Testing insert into ems.live_classes...");
    const { data, error } = await supabase.schema('ems').from('live_classes').insert({
        class_title: 'Test',
        company_id: 1, // hope 1 exists or it fails with FK which is fine to see columns
        course_id: 1,
        tutor_id: 1,
        scheduled_date: '2026-02-06',
        start_time: '10:00',
        status: 'SCHEDULED',
        external_link: 'http://test.com'
    });

    if (error) {
        console.log("❌ Insert Error:", error.message);
        console.log("Full Error Code:", error.code);
        console.log("Hint:", error.hint);
    } else {
        console.log("✅ Insert Success!");
    }
}
testInsert();
