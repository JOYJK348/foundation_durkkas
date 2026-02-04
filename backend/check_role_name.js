
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRoleName() {
    const { data: role, error } = await supabase.schema('app_auth').from('roles').select('*').eq('id', 3).single();
    console.log("ROLE Name for ID 3:", JSON.stringify(role, null, 2));
}

checkRoleName();
