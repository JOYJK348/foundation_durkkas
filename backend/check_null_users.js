
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkNullUsers() {
    const { data: emps } = await supabase.schema('core').from('employees').select('id, user_id, email, first_name');
    const nullUsers = emps.filter(e => e.user_id === null);
    console.log("Employees with NULL user_id:", JSON.stringify(nullUsers, null, 2));

    const { data: users } = await supabase.schema('app_auth').from('users').select('id, email');
    console.log("\nMatching by Email:");
    nullUsers.forEach(e => {
        const u = users.find(u => u.email === e.email);
        console.log(`Emp: ${e.email} (ID: ${e.id}) -> Auth User ID: ${u?.id || 'NOT FOUND'}`);
    });
}

checkNullUsers();
