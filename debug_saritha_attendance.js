const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envFile = './backend/.env.local';
let env = {};
if (fs.existsSync(envFile)) {
    const dotenv = require('./backend/node_modules/dotenv');
    env = dotenv.parse(fs.readFileSync(envFile, 'utf8'));
} else {
    env = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    };
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function debugSaritha() {
    console.log('--- DEBUGGING SARITHA ATTENDANCE ---');
    const studentName = 'saritha';

    // 1. Find Student
    const { data: students, error: sError } = await supabase.schema('ems').from('students')
        .select('*')
        .ilike('first_name', `%${studentName}%`);

    if (sError || !students || students.length === 0) {
        console.error('Student not found:', sError || 'Empty list');
        return;
    }

    const student = students[0];
    console.log(`Student Found: ID=${student.id}, Name=${student.first_name} ${student.last_name}, CompanyID=${student.company_id}, UserID=${student.user_id}`);

    // 2. Check Enrollments
    const { data: enrollments, error: eError } = await supabase.schema('ems').from('student_enrollments')
        .select('*')
        .eq('student_id', student.id)
        .eq('enrollment_status', 'ACTIVE');

    if (eError) {
        console.error('Enrollment error:', eError);
    }

    console.log(`Enrollments Found: ${enrollments?.length || 0}`);
    const batchIds = enrollments?.map(e => e.batch_id).filter(Boolean) || [];
    console.log('Student Batches:', batchIds);

    // 3. Check All Sessions for this Company Today
    const today = new Date().toISOString().split('T')[0];
    const { data: sessions, error: sessError } = await supabase.schema('ems').from('attendance_sessions')
        .select('*')
        .eq('company_id', student.company_id)
        .eq('session_date', today);

    if (sessError) {
        console.error('Session fetch error:', sessError);
    }

    console.log(`Sessions found for company ${student.company_id} today: ${sessions?.length || 0}`);
    sessions?.forEach(s => {
        console.log(`- Session ID=${s.id}, BatchID=${s.batch_id}, Status=${s.status}, Date=${s.session_date}`);
    });

    // 4. Check if any session matches student batches
    const matches = sessions?.filter(s => batchIds.includes(s.batch_id));
    console.log(`Sessions matching student batches: ${matches?.length || 0}`);

    // 5. Final conclusion
    if (matches?.length === 0) {
        console.log('REASON: No sessions found for the specific batches this student is enrolled in.');
    } else if (!matches.some(m => ['OPEN', 'IN_PROGRESS', 'IDENTIFYING_ENTRY'].includes(m.status))) {
        console.log('REASON: Sessions found for student batches, but none are currently in an "OPEN" or "IN_PROGRESS" status.');
    } else {
        console.log('SUCCESS: Sessions are available and matching. If dashboard still fails, check API token/tenant resolution.');
    }
}

debugSaritha();
