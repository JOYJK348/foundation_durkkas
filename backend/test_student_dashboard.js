
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboard() {
    const userId = 470;
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Get student
    const { data: student } = await supabase.schema('ems').from('students').select('*').eq('user_id', userId).single();
    if (!student) { console.log('Student not found'); return; }
    console.log('Student ID:', student.id);

    // 2. Get enrollments
    const { data: enrollments } = await supabase.schema('ems').from('student_enrollments').select('batch_id').eq('student_id', student.id).eq('enrollment_status', 'ACTIVE');
    const batchIds = enrollments.map(e => e.batch_id).filter(Boolean);
    console.log('Batches:', batchIds);

    // 3. Get Active Sessions (using the new logic I implemented)
    const { data: sessions, error } = await supabase.schema('ems').from('attendance_sessions')
        .select(`
            id,
            session_date,
            status,
            batch_id
        `)
        .in('batch_id', batchIds)
        .or(`status.eq.OPEN,and(status.eq.SCHEDULED,session_date.eq.${todayStr})`);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Active Sessions Found:', sessions?.length || 0);
        console.table(sessions);
    }
}

testDashboard();
