const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const envFile = fs.readFileSync('./backend/.env.local', 'utf8');
const env = dotenv.parse(envFile);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTutorData() {
    console.log('--- EMPLOYEES (TUTORS) ---');
    const { data: employees, error: eErr } = await supabase
        .schema('core')
        .from('employees')
        .select('id, employee_code, first_name, last_name, email, user_id');

    if (eErr) {
        console.error('Employee Error:', eErr.message);
    } else {
        employees.forEach(e => {
            console.log(`ID: ${e.id} | Code: ${e.employee_code} | Email: ${e.email} | UserID: ${e.user_id}`);
        });
    }

    console.log('\n--- RECENT NOTIFICATIONS ---');
    const { data: notis, error: nErr } = await supabase
        .schema('app_auth')
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (nErr) {
        console.error('Notification Error:', nErr.message);
    } else {
        notis.forEach(n => {
            console.log(`[${n.created_at}] To: ${n.user_id} | Type: ${n.target_type} | Title: ${n.title}`);
        });
    }
}

checkTutorData();
