
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const { AttendanceService } = require('./lib/services/AttendanceService');

async function testFetch() {
    console.log('--- Fetching Attendance Summary as the Academic Manager would ---');
    try {
        const result = await AttendanceService.getBatchAttendanceSummary(13, 9, 4);
        const saritha = result.attendance.find(a => a.student_id === 41);

        console.log('Student:', saritha.student.first_name);
        console.log('Status:', saritha.status);
        console.log('Arrival Trace:', saritha.entry_status || 'No trace', 'at', saritha.entry_verified_at);
        console.log('Departure Trace:', saritha.exit_status || 'No trace', 'at', saritha.exit_verified_at);
    } catch (err) {
        console.error('Test Fetch Error:', err.message);
    }
}
testFetch();
