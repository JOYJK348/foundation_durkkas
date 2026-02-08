const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const envFile = fs.readFileSync('./backend/.env.local', 'utf8');
const env = dotenv.parse(envFile);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAll() {
    console.log('--- SYNCING EMPLOYEES ---');
    const { data: employees } = await supabase.schema('core').from('employees').select('id, email, user_id');
    const { data: users } = await supabase.schema('app_auth').from('users').select('id, email');

    for (const emp of employees) {
        if (!emp.user_id) {
            const user = users.find(u => u.email.toLowerCase() === emp.email.toLowerCase());
            if (user) {
                console.log(`Linking Employee ${emp.email} -> User ${user.id}`);
                await supabase.schema('core').from('employees').update({ user_id: user.id }).eq('id', emp.id);
            }
        }
    }

    console.log('\n--- SYNCING STUDENTS ---');
    const { data: students } = await supabase.schema('ems').from('students').select('id, email, user_id');
    for (const std of students) {
        if (!std.user_id) {
            const user = users.find(u => u.email.toLowerCase() === std.email.toLowerCase());
            if (user) {
                console.log(`Linking Student ${std.email} -> User ${user.id}`);
                await supabase.schema('ems').from('students').update({ user_id: user.id }).eq('id', std.id);
            }
        }
    }
    console.log('\nSync Complete!');
}

syncAll();
