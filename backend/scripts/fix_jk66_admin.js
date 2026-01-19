/**
 * Fix Branch Admin for jk66@gmail.com
 */
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdmin() {
    const email = 'jk66@gmail.com';
    const password = 'jkumarjk3';
    const branchId = 29;
    const companyId = 11;

    console.log(`🚀 Fixing admin for ${email} in branch ${branchId}...`);

    try {
        // 1. Hash Password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 2. Create User
        const { data: user, error: userError } = await supabase
            .schema('app_auth')
            .from('users')
            .insert({
                email,
                password_hash,
                first_name: 'Branch',
                last_name: 'Admin',
                display_name: 'Branch Admin',
                is_active: true,
                is_verified: true
            })
            .select()
            .single();

        if (userError) {
            if (userError.code === '23505') {
                console.log('ℹ️ User already exists.');
            } else {
                throw userError;
            }
        }

        const userId = user?.id || (await supabase.schema('app_auth').from('users').select('id').eq('email', email).single()).data.id;

        // 3. Get Role ID
        const { data: role } = await supabase
            .schema('app_auth')
            .from('roles')
            .select('id')
            .eq('name', 'BRANCH_ADMIN')
            .single();

        if (!role) throw new Error('BRANCH_ADMIN role not found');

        // 4. Assign Role
        const { error: roleErr } = await supabase
            .schema('app_auth')
            .from('user_roles')
            .insert({
                user_id: userId,
                role_id: role.id,
                company_id: companyId,
                branch_id: branchId,
                is_active: true
            });

        if (roleErr && roleErr.code !== '23505') throw roleErr;

        console.log('✅ Admin fixed successfully!');
    } catch (err) {
        console.error('❌ Failed to fix admin:', err.message);
    }
}

fixAdmin();
