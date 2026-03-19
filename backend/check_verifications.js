
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Checking Columns of ems.attendance_face_verifications ---');
    const { data, error } = await supabase.schema('ems').from('attendance_face_verifications').select('*').limit(1);

    if (error) {
        console.log('Error fetching verifications:', error.message);
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('No verifications found. Attempting basic select to see if table exists...');
        const { error: error2 } = await supabase.schema('ems').from('attendance_face_verifications').select('id').limit(1);
        if (error2) {
            console.log('Table does not exist or error:', error2.message);
        } else {
            console.log('Table exists but is empty.');
        }
    }
}
check();
