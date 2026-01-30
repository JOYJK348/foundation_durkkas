const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function safeUpsert(schema, table, query, data) {
    console.log(`--- Seeding ${table} ---`);
    const { data: existing } = await supabase.schema(schema).from(table).select('*').match(query).maybeSingle();

    if (existing) {
        console.log(`Found existing ${table}, updating...`);
        const { data: updated, error } = await supabase.schema(schema).from(table).update(data).match(query).select().single();
        if (error) throw error;
        return updated;
    } else {
        console.log(`Creating new ${table}...`);
        const { data: created, error } = await supabase.schema(schema).from(table).insert({ ...query, ...data }).select().single();
        if (error) throw error;
        return created;
    }
}

async function setup() {
    try {
        console.log('🚀 Starting Universal Seed...');

        // 1. Company
        const company = await safeUpsert('core', 'companies', { code: 'DIPL' }, {
            name: 'Durkkas Institute of Professional Learning',
            legal_name: 'DIPL Pvt Ltd',
            email: 'admin@dipl.edu',
            phone: '+91-9876543210',
            subscription_plan: 'ENTERPRISE',
            enabled_modules: ['LMS', 'HR', 'ATTENDANCE', 'FINANCE', 'CRM'],
            is_active: true
        });
        console.log('✅ Company ID:', company.id);

        // 2. Branch
        const branch = await safeUpsert('core', 'branches', { company_id: company.id, code: 'DIPL-MAIN' }, {
            name: 'DIPL Main Campus',
            branch_type: 'HQ',
            email: 'campus@dipl.edu',
            phone: '+91-9876543211',
            is_active: true
        });
        console.log('✅ Branch ID:', branch.id);

        // 3. User
        console.log('--- Seeding users ---');
        const plainPassword = 'admin@123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const user = await safeUpsert('app_auth', 'users', { email: 'ems.admin@dipl.edu' }, {
            password_hash: hashedPassword,
            first_name: 'EMS',
            last_name: 'Administrator',
            display_name: 'EMS Admin',
            is_active: true,
            is_verified: true
        });
        console.log('✅ User ID:', user.id);

        // 4. Role Assignment
        console.log('--- Checking Role ---');
        const { data: role } = await supabase.schema('app_auth').from('roles')
            .select('id').eq('name', 'BRANCH_ADMIN').single();

        if (role) {
            await safeUpsert('app_auth', 'user_roles', { user_id: user.id, role_id: role.id, company_id: company.id }, {
                branch_id: branch.id,
                is_active: true
            });
            console.log('✅ Role Linked');
        }

        console.log('🎉 ALL DONE!');
    } catch (err) {
        console.error('❌ SEVERE FAILURE:', err);
    }
}

setup();
