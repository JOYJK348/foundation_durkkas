const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://waxbttxqhyoczmdshpzz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18');

async function createTestSession() {
    try {
        // Find a batch for company 13
        const { data: batches } = await s.schema('ems').from('batches').select('id, course_id, company_id').eq('company_id', 13).limit(1);
        if (!batches || batches.length === 0) {
            console.log('No batches found for company 13');
            return;
        }
        const b = batches[0];
        console.log('Using batch:', b);

        const today = new Date().toISOString().split('T')[0];

        // Insert a session for today that is OPEN
        const { data: session, error: sErr } = await s.schema('ems').from('attendance_sessions').insert({
            company_id: b.company_id,
            course_id: b.course_id,
            batch_id: b.id,
            session_date: today,
            session_type: 'LAB',
            status: 'OPEN'
        }).select().single();

        if (sErr) console.error('Error creating session:', sErr);
        else console.log('OPEN Session created successfully:', session);

    } catch (e) { console.error(e); }
}
createTestSession();
