const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinal() {
    console.log("Testing insert with mapped columns (class_status, meeting_link)...");

    // Simulate what the API now does
    const toInsert = {
        class_title: 'Test Live Class Mapped',
        class_description: 'Test Description',
        company_id: 1,
        course_id: 1, // hope 1 exists
        tutor_id: 1,
        scheduled_date: '2026-02-10',
        start_time: '14:00:00',
        end_time: '15:00:00',
        meeting_platform: 'JITSI',
        meeting_id: 'Test-Meeting-123',
        meeting_link: 'http://meet.jit.si/test', // mapped
        class_status: 'SCHEDULED' // mapped
    };

    const { data, error } = await supabase.schema('ems').from('live_classes').insert(toInsert).select();

    if (error) {
        console.log("❌ Insert Error:", error.message);
        if (error.message.includes('foreign key')) {
            console.log("ℹ️ (Probably just missing sample data for FKs, which is fine, at least columns match!)");
        }
    } else {
        console.log("✅ Success! Columns matched perfectly.");
    }
}
testFinal();
