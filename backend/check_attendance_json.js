
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAttendance() {
    const { data: openSessions } = await supabase
        .schema('ems')
        .from('attendance_sessions')
        .select('*')
        .eq('status', 'OPEN');

    console.log(JSON.stringify(openSessions, null, 2));
}

checkAttendance();
