
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Checking Columns of ems.attendance_records ---');
    const { data, error } = await supabase.schema('ems').from('attendance_records').select('*').limit(1);

    if (error) {
        console.log('Error fetching records:', error.message);
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('No records found to check columns. Attempting to fetch from definition if possible...');
        // Try a dummy insert and see what works
    }
}
check();
