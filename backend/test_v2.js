const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testV2() {
    console.log("Testing insert with V2 columns...");
    const { data, error } = await supabase.schema('ems').from('live_classes').insert({
        class_title: 'Test V2',
        company_id: 1,
        course_id: 1,
        class_status: 'SCHEDULED', // V2 column name
        meeting_link: 'http://test.com' // V2 column name
    });

    if (error) {
        console.log("❌ V2 Insert Error:", error.message);
    } else {
        console.log("✅ V2 Insert Success! This means columns are class_status/meeting_link.");
    }
}
testV2();
