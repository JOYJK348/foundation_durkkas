
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetArun() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Manager@123', salt);

    console.log("Resetting password for arun.patel@durkkas.com...");
    const { data, error } = await supabase.schema('app_auth').from('users').update({
        password_hash: hash,
        is_active: true,
        is_locked: false
    }).eq('email', 'arun.patel@durkkas.com');

    if (error) console.error("Error:", error);
    else console.log("Success! Arun's password is now Manager@123");
}

resetArun();
