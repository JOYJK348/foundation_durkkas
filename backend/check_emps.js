
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEmps() {
    const { data: emps, error } = await supabase.schema('core').from('employees').select('id, user_id, email, first_name');
    if (error) {
        console.error("ERROR:", error);
    } else {
        console.log("ALL EMPLOYEES:", JSON.stringify(emps, null, 2));
    }
}

checkEmps();
