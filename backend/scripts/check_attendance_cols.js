const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://waxbttxqhyoczmdshpzz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18');

async function checkColumns() {
    try {
        // Try to get one row to see keys
        const { data, error } = await s.schema('ems').from('attendance_records').select('*').limit(1);
        if (error) {
            console.error('Error selecting *:', error.message);
        } else if (data && data.length > 0) {
            console.log('Columns found in data:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, trying direct column inquiry...');
            // Try individual common columns to see which ones fail
            const testCols = ['id', 'company_id', 'session_id', 'student_id', 'status', 'check_in_time', 'in_time', 'check_in', 'verification_status', 'created_at'];
            for (const col of testCols) {
                const { error: colErr } = await s.schema('ems').from('attendance_records').select(col).limit(0);
                if (!colErr) {
                    console.log(`Column EXISTS: ${col}`);
                } else {
                    console.log(`Column MISSING: ${col} (${colErr.message})`);
                }
            }
        }
    } catch (e) {
        console.error('Catch error:', e);
    }
}

checkColumns();
