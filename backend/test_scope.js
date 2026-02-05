
const { createClient } = require('@supabase/supabase-js');
const { cookies } = require('next/headers');
require('dotenv').config({ path: '.env.local' });

// Mocking headers and cookies because they are not available in node script
// But I want to test the logic. 
// I'll just copy the core logic from tenantFilter.ts to test it locally.

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app_auth = {
    userRoles: () => supabase.schema('app_auth').from('user_roles'),
    roles: () => supabase.schema('app_auth').from('roles'),
    users: () => supabase.schema('app_auth').from('users'),
};

const core = {
    employees: () => supabase.schema('core').from('employees'),
};

async function testScope(email) {
    const { data: user } = await app_auth.users().select('id').eq('email', email).single();
    const userId = user.id;

    console.log(`\n--- TESTING SCOPE FOR: ${email} (ID: ${userId}) ---`);

    // 1. Get User Roles
    const { data: userRoles } = await app_auth.userRoles().select('company_id, branch_id, role_id').eq('user_id', userId).eq('is_active', true);
    const roleIds = userRoles.map(ur => ur.role_id);
    const { data: roles } = await app_auth.roles().select('id, name, level, role_type').in('id', roleIds);

    const combined = userRoles.map(ur => {
        const role = roles?.find(r => r.id === ur.role_id);
        return { ...ur, role_level: role?.level || 0, role_name: role?.name || 'Unknown' };
    }).sort((a, b) => b.role_level - a.role_level);

    let selectedRole = combined[0];
    console.log("Selected Role:", selectedRole.role_name);

    if (selectedRole.role_name === 'TUTOR') {
        let { data: employee } = await core.employees().select('id, email, user_id').eq('user_id', userId).eq('company_id', selectedRole.company_id).single();
        console.log("Resolved by user_id:", employee ? "YES" : "NO");

        if (!employee) {
            const { data: userData } = await app_auth.users().select('email').eq('id', userId).single();
            const { data: empByEmail } = await core.employees().select('id, email, user_id').eq('email', userData.email).eq('company_id', selectedRole.company_id).single();
            console.log("Resolved by email:", empByEmail ? "YES" : "NO");
            if (empByEmail) employee = empByEmail;
        }

        if (employee) {
            console.log("FINAL PROFILE ID:", employee.id);
        } else {
            console.log("ERROR: PROFILE NOT RESOLVED");
        }
    }
}

async function runTests() {
    await testScope('priya.sharma@durkkas.com');
    await testScope('arun.patel@durkkas.com');
}

runTests();
