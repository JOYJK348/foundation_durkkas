
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAttendance() {
    console.log('--- Attendance Debug ---');

    // 1. All sessions
    const { data: allSessions, error } = await supabase
        .schema('ems')
        .from('attendance_sessions')
        .select('id, session_date, status, batch_id')
        .limit(10);

    console.log('Sample Sessions:');
    console.table(allSessions);

    // 2. Open sessions
    const { data: openSessions } = await supabase
        .schema('ems')
        .from('attendance_sessions')
        .select('id, session_date, status, batch_id')
        .eq('status', 'OPEN');

    console.log('Open Sessions:');
    console.table(openSessions);

    // 3. Batches
    const { data: batches } = await supabase
        .schema('ems')
        .from('batches')
        .select('id, batch_name')
        .limit(5);
    console.log('Sample Batches:');
    console.table(batches);
}

checkAttendance();
