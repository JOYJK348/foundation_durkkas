
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findFinal() {
    const { data: users } = await supabase.schema('app_auth').from('users').select('id, email, first_name');
    const arun = users.filter(u => u.email.includes('arun') || u.first_name.includes('Arun'));
    console.log("USERS MATCHING 'Arun':", JSON.stringify(arun, null, 2));

    const { data: emps } = await supabase.schema('core').from('employees').select('id, user_id, email, first_name');
    const arunEmp = emps.filter(e => e.email.includes('arun') || e.first_name.includes('Arun'));
    console.log("EMPLOYEES MATCHING 'Arun':", JSON.stringify(arunEmp, null, 2));
}

findFinal();
