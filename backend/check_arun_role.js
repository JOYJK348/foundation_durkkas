
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkArunRole() {
    const { data: roles } = await supabase.schema('app_auth').from('user_roles').select('role_id').eq('user_id', 54);
    console.log("ARUN (54) ROLES:", roles);
}

checkArunRole();
