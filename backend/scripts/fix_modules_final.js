/**
 * Fix Modules and User Mapping
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    const email = 'jk66@gmail.com';

    // Find active branch for company 11
    const { data: bList } = await supabase
        .schema('core')
        .from('branches')
        .select('id, name, code, is_active, deleted_at')
        .eq('company_id', 11);

    console.log('🔍 Found branches:', JSON.stringify(bList, null, 2));

    const branches = bList?.filter(b => b.is_active && !b.deleted_at);

    if (!branches || branches.length === 0) {
        console.error('❌ No active branches found for company 11');
        return;
    }

    const branchId = branches[0].id;
    console.log(`🚀 Using active branch ${branchId} (${branches[0].name})`);

    // 1. Update ALL branches for this company to have at least HR
    const { error: bErr } = await supabase
        .schema('core')
        .from('branches')
        .update({ enabled_modules: ['HR', 'ATTENDANCE', 'PAYROLL'] })
        .eq('company_id', 11);

    if (bErr) console.error('❌ Branch update error:', bErr.message);
    else console.log('✅ All company branches updated with HR modules.');

    // 2. Update User Mapping to the first active branch
    const { data: user } = await supabase.schema('app_auth').from('users').select('id').eq('email', email).single();
    if (user) {
        const { error: rErr } = await supabase
            .schema('app_auth')
            .from('user_roles')
            .update({ branch_id: branchId })
            .eq('user_id', user.id);

        if (rErr) console.error('❌ User role update error:', rErr.message);
        else console.log(`✅ User ${email} mapped to branch ${branchId}.`);

        // Also give all permissions
        const { data: perms } = await supabase.schema('app_auth').from('permissions').select('id').ilike('name', 'hrms.%');
        if (perms) {
            const up = perms.map(p => ({ user_id: user.id, permission_id: p.id, company_id: 11 }));
            await supabase.schema('app_auth').from('user_permissions').delete().eq('user_id', user.id);
            await supabase.schema('app_auth').from('user_permissions').insert(up);
            console.log('✅ HRMS Permissions assigned.');
        }
    }
}

fix();
