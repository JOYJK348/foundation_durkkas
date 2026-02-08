
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    console.log('--- Testing Database Columns ---');
    const now = new Date().toISOString();
    const testRecord = {
        company_id: 13,
        session_id: 4,
        student_id: 41,
        status: 'PARTIAL',
        check_in_at: now,
        check_in_id: null,
        updated_at: now
    };

    console.log('Attempting to insert test record with check_in_at...');
    const { data, error } = await supabase.schema('ems').from('attendance_records').insert(testRecord).select();

    if (error) {
        console.error('Insert Error:', error.message);
        if (error.message.includes('column "check_in_at" of relation "attendance_records" does not exist')) {
            console.log('CONFIRMED: Column check_in_at is missing.');
        }
    } else {
        console.log('Insert Success:', data);
    }
}
test();
