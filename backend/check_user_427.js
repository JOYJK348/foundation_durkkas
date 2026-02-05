
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
    console.log("USER 427 (tutor1@durkkas.com) ROLES:");
    const { data: roles } = await supabase.schema('app_auth').from('user_roles').select('role_id').eq('user_id', 427);
    console.log(roles);

    console.log("\nEMPLOYEE record for User 427:");
    const { data: emp } = await supabase.from('employees').select('id, company_id, first_name').eq('user_id', 427);
    console.log(emp);
}

checkUser();
