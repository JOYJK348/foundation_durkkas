
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkArun() {
    console.log("CHECKING ARUN PATEL AUTH:");
    const { data: user, error } = await supabase.schema('app_auth').from('users').select('id, email, is_active, is_verified').eq('email', 'arun.patel@durkkas.com').single();
    if (error) {
        console.error("User not found or error:", error);
    } else {
        console.log("User details:", user);
    }
}

checkArun();
