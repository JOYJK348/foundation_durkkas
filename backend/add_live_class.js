
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addLiveClass() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Adding live class for ${today}...`);

    await supabase.schema('ems').from('live_classes').insert({
        course_id: 1,
        company_id: 13,
        scheduled_date: today,
        start_time: '10:00:00',
        end_time: '12:00:00',
        topic: 'Introduction to Full Stack',
        meeting_link: 'https://zoom.us/test',
        is_active: true
    });

    console.log("Live class added.");
}

addLiveClass();
