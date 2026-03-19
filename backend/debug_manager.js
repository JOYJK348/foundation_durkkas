const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const email = 'manager@durkkas.com';
    const { data: user } = await supabase.schema('app_auth').from('users').select('id, email').eq('email', email).maybeSingle();
    if (user) {
        console.log(`User: ${user.email} (ID: ${user.id})`);
        const { data: userRoles } = await supabase.schema('app_auth').from('user_roles').select(`
            company_id,
            roles (
                name,
                level
            )
        `).eq('user_id', user.id);

        userRoles.forEach(ur => {
            console.log(`  - Role: ${ur.roles.name}, Level: ${ur.roles.level}, Company: ${ur.company_id}`);
        });
    } else {
        console.log('User not found: ' + email);
    }
}
run();
