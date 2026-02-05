
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRoles() {
    const { data: roles, error } = await supabase.schema('app_auth').from('roles').select('id, name').order('id');
    roles.forEach(r => console.log(`${r.id}: ${r.name}`));
}

checkRoles();
