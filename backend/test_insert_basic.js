
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    console.log('--- Testing basic insert into ems.attendance_records ---');
    const testRecord = {
        company_id: 13,
        session_id: 4,
        student_id: 41,
        status: 'PRESENT'
    };

    const { data, error } = await supabase.schema('ems').from('attendance_records').insert(testRecord).select();

    if (error) {
        console.error('Insert Error:', error.message);
    } else {
        console.log('Insert Success:', data);
        // Delete it after test
        await supabase.schema('ems').from('attendance_records').delete().eq('id', data[0].id);
    }
}
test();
