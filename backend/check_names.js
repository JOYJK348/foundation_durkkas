
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkNames() {
    const { data: emps } = await supabase.schema('core').from('employees').select('id, user_id, email, first_name');
    ['Priya', 'Arun', 'Rajesh'].forEach(name => {
        const found = emps.filter(e => e.first_name.includes(name));
        console.log(`${name}:`, JSON.stringify(found, null, 2));
    });
}

checkNames();
