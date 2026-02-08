
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Checking Columns of ems.attendance_face_verifications ---');
    // Try to insert a dummy row with just required fields to get back all columns
    const { data, error } = await supabase.schema('ems').from('attendance_face_verifications').insert({
        company_id: 13,
        student_id: 41,
        verification_type: 'OPENING',
        face_match_status: 'MATCHED'
    }).select();

    if (error) {
        console.log('Error inserting record:', error.message);
        // Fallback to a select if insert fails
        const { data: data2 } = await supabase.schema('ems').from('attendance_face_verifications').select('*').limit(1);
        if (data2 && data2.length > 0) {
            console.log('Current Columns:', Object.keys(data2[0]));
        } else {
            // If table is empty, we might need to check the schema via RPC or just guess based on errors
            console.log('No data found to determine columns.');
        }
    } else if (data && data.length > 0) {
        console.log('Full Column List:', Object.keys(data[0]));
        // Clean up
        await supabase.schema('ems').from('attendance_face_verifications').delete().eq('id', data[0].id);
    }
}
check();
