
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPriya() {
    console.log("PRIYA (428) ROLES:");
    const { data: roles } = await supabase.schema('app_auth').from('user_roles').select('role_id').eq('user_id', 428);
    console.log(roles);
}

checkPriya();
