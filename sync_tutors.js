const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const envFile = fs.readFileSync('./backend/.env.local', 'utf8');
const env = dotenv.parse(envFile);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncTutors() {
    console.log('--- SYNCING TUTOR USER_IDS ---');

    // 1. Get all employees (tutors)
    const { data: employees } = await supabase
        .schema('core')
        .from('employees')
        .select('id, email, user_id');

    // 2. Get all users
    const { data: users } = await supabase
        .schema('app_auth')
        .from('users')
        .select('id, email');

    const emailToUserId = {};
    users.forEach(u => emailToUserId[u.email] = u.id);

    for (const emp of employees) {
        if (!emp.user_id && emailToUserId[emp.email]) {
            console.log(`Linking ${emp.email} to User ID ${emailToUserId[emp.email]}`);
            const { error } = await supabase
                .schema('core')
                .from('employees')
                .update({ user_id: emailToUserId[emp.email] })
                .eq('id', emp.id);
            if (error) console.error(`Error linking ${emp.email}:`, error.message);
        } else if (emp.user_id) {
            console.log(`Already linked: ${emp.email} -> ${emp.user_id}`);
        } else {
            console.log(`No match for: ${emp.email}`);
        }
    }
}

syncTutors();
