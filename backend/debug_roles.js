const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUser(email) {
    console.log(`🔍 Debugging user: ${email}`);

    // 1. Get user id
    const { data: user, error: userError } = await supabase.from('users').select('id, email').eq('email', email).maybeSingle();
    if (userError || !user) {
        console.error('User not found:', email);
        return;
    }
    console.log(`User ID: ${user.id}`);

    // 2. Get user roles
    const { data: userRoles, error: rolesError } = await supabase.schema('app_auth').from('user_roles').select(`
        company_id,
        branch_id,
        roles (
            id,
            name,
            level
        )
    `).eq('user_id', user.id);

    if (rolesError) {
        console.error('Error fetching roles:', rolesError.message);
        return;
    }

    console.log('User Roles:');
    userRoles.forEach(ur => {
        console.log(`- Role: ${ur.roles.name} (L${ur.roles.level}), Company: ${ur.company_id}, Branch: ${ur.branch_id}`);
    });
}

// Check common admin emails
const emails = ['manager@durkkas.com', 'admin@durkkas.com', 'admin@aipl.com'];
(async () => {
    for (const email of emails) {
        await debugUser(email);
        console.log('---');
    }
})();
