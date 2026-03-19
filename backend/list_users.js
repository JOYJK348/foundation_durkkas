
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function search() {
    const { data: users } = await supabase.schema('app_auth').from('users').select('id, email');
    const priya = users.filter(u => u.email.toLowerCase().includes('priya'));
    const rajesh = users.filter(u => u.email.toLowerCase().includes('rajesh'));
    fs.writeFileSync('creds_check.json', JSON.stringify({ priya, rajesh }, null, 2));
}

search();
