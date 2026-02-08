const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: users } = await supabase.schema('app_auth').from('users').select('id, email');
    console.log('--- ALL USERS AND ROLES ---');
    for (const u of users || []) {
        const { data: userRoles } = await supabase.schema('app_auth').from('user_roles').select(`
            company_id,
            roles (
                name,
                level
            )
        `).eq('user_id', u.id);

        if (userRoles && userRoles.length > 0) {
            console.log(`User: ${u.email} (ID: ${u.id})`);
            userRoles.forEach(ur => {
                console.log(`  - Role: ${ur.roles.name}, Level: ${ur.roles.level}, Company: ${ur.company_id}`);
            });
        }
    }
}
run();
