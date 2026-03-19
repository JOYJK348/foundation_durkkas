
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function repair() {
    console.log('--- Repairing Arrival Trace for Saritha R ---');

    // 1. Manually insert an OPENING trace log
    const { data: trace, error } = await supabase.schema('ems').from('attendance_face_verifications').insert({
        company_id: 13,
        session_id: 4,
        student_id: 41,
        verification_type: 'OPENING',
        face_match_status: 'MATCHED',
        latitude: 9.460327,
        longitude: 77.776939,
        location_verified: true,
        distance_from_venue_meters: 0,
        face_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', // Dummy avatar for trace
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    }).select().single();

    if (error) {
        console.error('Error creating arrival trace:', error.message);
        return;
    }
    console.log('✅ Created Arrival Trace ID:', trace.id);

    // 2. Link this trace to the attendance record
    const { error: updateError } = await supabase.schema('ems').from('attendance_records')
        .update({ check_in_id: trace.id })
        .eq('session_id', 4)
        .eq('student_id', 41);

    if (updateError) {
        console.error('Error linking trace to record:', updateError.message);
    } else {
        console.log('✅ Linked Arrival Trace to Attendance Record');
    }
}
repair();
