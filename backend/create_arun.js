
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createArun() {
    const email = 'arun.patel@durkkas.com';
    const password = 'Manager@123';

    console.log(`CREATING USER: ${email}`);

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 1. Create User
    const { data: user, error: userError } = await supabase.schema('app_auth').from('users').insert({
        email: email,
        password_hash: hash,
        first_name: 'Arun',
        last_name: 'Patel',
        display_name: 'Arun Patel',
        is_active: true,
        is_verified: true
    }).select('id').single();

    if (userError) {
        console.error("User Creation Error:", userError);
        return;
    }
    console.log(`User created with ID: ${user.id}`);

    // 2. Link to Employee 119
    const { error: empError } = await supabase.schema('core').from('employees').update({
        user_id: user.id
    }).eq('id', 119);

    if (empError) console.error("Employee Link Error:", empError);
    else console.log("Linked to Employee 119 (Data Science & AI Mastery)");

    // 3. Assign Role 37 (TUTOR)
    const { error: roleError } = await supabase.schema('app_auth').from('user_roles').insert({
        user_id: user.id,
        role_id: 37,
        company_id: 13,
        branch_id: 46,
        is_active: true
    });

    if (roleError) console.error("Role Assignment Error:", roleError);
    else console.log("Assigned TUTOR role.");

    console.log("DONE! Try logging in now.");
}

createArun();
