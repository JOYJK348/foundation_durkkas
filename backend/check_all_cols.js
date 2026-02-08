
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data } = await supabase.schema('ems').from('attendance_records').insert({
        company_id: 13,
        session_id: 4,
        student_id: 41,
        status: 'PRESENT'
    }).select().single();

    if (data) {
        console.log('All Columns:', Object.keys(data));
        await supabase.schema('ems').from('attendance_records').delete().eq('id', data.id);
    }
}
test();
