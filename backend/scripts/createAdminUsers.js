/**
 * Generate Admin Users with Bcrypt Password
 * Run this script to create admin users in Supabase
 * 
 * Usage: node scripts/createAdminUsers.js
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUsers() {
    try {
        console.log('🔐 Generating password hash...');
        const password = 'durkkas@2026';
        const passwordHash = await bcrypt.hash(password, 10);

        console.log('📊 Fetching roles...');

        // Get Platform Admin role (Level 5)
        const { data: platformRole, error: platformRoleError } = await supabase
            .schema('app_auth')
            .from('roles')
            .select('id')
            .eq('name', 'PLATFORM_ADMIN')
            .single();

        if (platformRoleError) {
            console.error('❌ Error fetching PLATFORM_ADMIN role:', platformRoleError);
            throw platformRoleError;
        }

        // Get Company Admin role (Level 4)
        const { data: companyRole, error: companyRoleError } = await supabase
            .schema('app_auth')
            .from('roles')
            .select('id')
            .eq('name', 'COMPANY_ADMIN')
            .single();

        if (companyRoleError) {
            console.error('❌ Error fetching COMPANY_ADMIN role:', companyRoleError);
            throw companyRoleError;
        }

        console.log('✅ Roles found:', {
            platformRoleId: platformRole.id,
            companyRoleId: companyRole.id
        });

        // 1. Create Platform Admin
        console.log('\n👤 Creating Platform Admin...');
        const { data: platformAdmin, error: platformAdminError } = await supabase
            .schema('app_auth')
            .from('users')
            .upsert({
                email: 'platform.admin@durkkas.com',
                password_hash: passwordHash,
                first_name: 'Platform',
                last_name: 'Admin',
                is_active: true,
                is_verified: true
            }, {
                onConflict: 'email'
            })
            .select()
            .single();

        if (platformAdminError) {
            console.error('❌ Error creating Platform Admin:', platformAdminError);
            throw platformAdminError;
        }

        console.log('✅ Platform Admin created:', platformAdmin.email);

        // Assign Platform Admin role
        const { error: platformRoleAssignError } = await supabase
            .schema('app_auth')
            .from('user_roles')
            .upsert({
                user_id: platformAdmin.id,
                role_id: platformRole.id,
                company_id: null, // NULL = Global access
                is_active: true
            }, {
                onConflict: 'user_id,role_id,company_id,branch_id'
            });

        if (platformRoleAssignError) {
            console.error('❌ Error assigning Platform Admin role:', platformRoleAssignError);
        } else {
            console.log('✅ Platform Admin role assigned (Global Access)');
        }

        // 2. Create System Admin (Company Admin)
        console.log('\n👤 Creating System Admin...');
        const { data: systemAdmin, error: systemAdminError } = await supabase
            .schema('app_auth')
            .from('users')
            .upsert({
                email: 'system.admin@durkkas.com',
                password_hash: passwordHash,
                first_name: 'System',
                last_name: 'Admin',
                is_active: true,
                is_verified: true
            }, {
                onConflict: 'email'
            })
            .select()
            .single();

        if (systemAdminError) {
            console.error('❌ Error creating System Admin:', systemAdminError);
            throw systemAdminError;
        }

        console.log('✅ System Admin created:', systemAdmin.email);

        // Assign Company Admin role (for company_id = 1)
        const { error: companyRoleAssignError } = await supabase
            .schema('app_auth')
            .from('user_roles')
            .upsert({
                user_id: systemAdmin.id,
                role_id: companyRole.id,
                company_id: 1, // ABC School
                is_active: true
            }, {
                onConflict: 'user_id,role_id,company_id,branch_id'
            });

        if (companyRoleAssignError) {
            console.error('❌ Error assigning Company Admin role:', companyRoleAssignError);
        } else {
            console.log('✅ Company Admin role assigned (Company ID: 1)');
        }

        console.log('\n🎉 SUCCESS! Admin users created!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 LOGIN CREDENTIALS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n1️⃣  Platform Admin (Global Access):');
        console.log('   Email: platform.admin@durkkas.com');
        console.log('   Password: durkkas@2026');
        console.log('\n2️⃣  System Admin (Company: ABC School):');
        console.log('   Email: system.admin@durkkas.com');
        console.log('   Password: durkkas@2026');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

// Run the script
createAdminUsers();
