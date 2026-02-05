
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose(email) {
    const results = { email, steps: [] };

    // 1. Get User
    const { data: user } = await supabase.schema('app_auth').from('users').select('id, email').eq('email', email).single();
    if (!user) {
        results.steps.push("User not found in app_auth.users");
        return results;
    }
    results.userId = user.id;

    // 2. Get Roles
    const { data: roles } = await supabase.schema('app_auth').from('user_roles').select('role_id, company_id, branch_id').eq('user_id', user.id);
    results.roles = roles;

    // 3. Resolve Profile
    for (const role of roles) {
        const { data: roleDef } = await supabase.schema('app_auth').from('roles').select('name').eq('id', role.role_id).single();
        if (roleDef.name === 'TUTOR') {
            // Check for duplicates
            const { data: emps, error } = await supabase.schema('core').from('employees')
                .select('id, email, user_id, company_id')
                .eq('user_id', user.id)
                .eq('company_id', role.company_id);

            results.profileLookup = {
                count: emps?.length || 0,
                data: emps,
                error: error
            };
        }
    }

    return results;
}

async function run() {
    const priya = await diagnose('priya.sharma@durkkas.com');
    const arun = await diagnose('arun.patel@durkkas.com');
    fs.writeFileSync('final_diag.json', JSON.stringify({ priya, arun }, null, 2));
}

run();
