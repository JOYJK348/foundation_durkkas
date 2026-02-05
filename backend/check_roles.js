
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRoles() {
    const { data: roles, error } = await supabase.schema('app_auth').from('user_roles').select('*').eq('user_id', 427);
    console.log("ROLES for User 427:", JSON.stringify(roles, null, 2));
}

checkRoles();
