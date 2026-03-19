
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs'); // Use bcryptjs to match backend
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function superReset() {
    const email = 'arun.patel@durkkas.com';
    const password = 'Manager@123';

    console.log(`--- SUPER RESET for ${email} ---`);

    // 1. Get User
    const { data: user } = await supabase.schema('app_auth').from('users').select('id').eq('email', email).single();
    if (!user) {
        console.log("User not found!");
        return;
    }
    console.log(`User ID found: ${user.id}`);

    // 2. Hash Password with bcryptjs (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Update User
    const { error: userUpdateErr } = await supabase.schema('app_auth').from('users').update({
        password_hash: hashedPassword,
        is_active: true,
        is_locked: false,
        mfa_enabled: false
    }).eq('id', user.id);

    if (userUpdateErr) console.error("User Update Error:", userUpdateErr);
    else console.log("Password and Status updated successfully.");

    // 4. Ensure Employee Match
    const { data: emp } = await supabase.schema('core').from('employees').select('id, company_id, branch_id').eq('email', email).single();
    if (emp) {
        console.log(`Found Employee: ${emp.id}, linking to User: ${user.id}`);
        await supabase.schema('core').from('employees').update({ user_id: user.id }).eq('id', emp.id);

        // 5. Ensure ROLE Assignment (Role 37 is TUTOR)
        const { data: existingRole } = await supabase.schema('app_auth').from('user_roles').select('id').eq('user_id', user.id).eq('role_id', 37).maybeSingle();

        if (!existingRole) {
            console.log("Assigning TUTOR role (ID 37)...");
            const { error: roleErr } = await supabase.schema('app_auth').from('user_roles').insert({
                user_id: user.id,
                role_id: 37,
                company_id: emp.company_id,
                branch_id: emp.branch_id || null,
                is_active: true
            });
            if (roleErr) console.error("Role Assignment Error:", roleErr);
            else console.log("Role assigned successfully.");
        } else {
            console.log("User already has TUTOR role.");
        }
    } else {
        console.log("No Employee record found for this email.");
    }

    console.log("--- RESET COMPLETE ---");
}

superReset();
