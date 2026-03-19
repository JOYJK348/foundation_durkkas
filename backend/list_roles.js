const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: users } = await supabase.schema('app_auth').from('users').select('id, email').limit(5);
    console.log('--- USERS ---');
    for (const u of users || []) {
        console.log(`ID: ${u.id}, Email: ${u.email}`);
        const { data: roles } = await supabase.schema('app_auth').from('user_roles').select('company_id, roles(name, level)').eq('user_id', u.id);
        (roles || []).forEach(r => console.log(`  - Role: ${r.roles.name}, Co: ${r.company_id}`));
    }
}
run();
