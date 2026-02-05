
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: emps } = await supabase.schema('core').from('employees').select('id, email, user_id, first_name');
    const filtered = emps.filter(e => ['Priya', 'Arun'].includes(e.first_name));
    fs.writeFileSync('debug_ids.json', JSON.stringify(filtered, null, 2));
}

check();
