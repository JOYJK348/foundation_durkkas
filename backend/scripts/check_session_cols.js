const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://waxbttxqhyoczmdshpzz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18');

async function checkSessions() {
    try {
        const { data, error } = await s.schema('ems').from('attendance_sessions').select('*').limit(1);
        if (error) {
            console.error('Error:', error.message);
        } else if (data && data.length > 0) {
            console.log('Session Columns:', Object.keys(data[0]));
        } else {
            console.log('No sessions found.');
        }
    } catch (e) { console.error(e); }
}
checkSessions();
