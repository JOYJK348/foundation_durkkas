/**
 * CLEAN & SEED SCRIPT
 * 
 * Usage: node scripts/seedCleanData.js
 * 
 * This script will:
 * 1. Update Company 1 to "Durkkas Corp" (Professional)
 * 2. Delete all other dummy companies and their data
 * 3. Clear existing core data for Company 1 (Branches, Depts, etc)
 * 4. Seed fresh, professional data for Company 1
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedCleanData() {
    try {
        console.log('🧹 Starting Maintenance Protocol...');

        const TARGET_COMPANY_ID = 1;

        // 1. Update Main Company to look Professional
        console.log('🏢 Polishing Corporate Identity...');
        const { error: companyError } = await supabase
            .schema('core')
            .from('companies')
            .upsert({
                id: TARGET_COMPANY_ID,
                name: 'Durkkas Innovations Pvt Ltd',
                code: 'DIPL-HQ',
                is_active: true
            });

        if (companyError) throw companyError;

        // 2. Delete Data from OTHER companies (Cleanup)
        console.log('🗑️  Removing deprecated entities...');

        // Helper to delete data not matching our target company
        const deleteForeignData = async (table) => {
            const { error } = await supabase.schema('core').from(table).delete().neq('company_id', TARGET_COMPANY_ID);
            if (error) console.error(`Error cleaning ${table}:`, error.message);
        };

        // We delete in order of dependencies (Employees -> Designations/Depts -> Branches -> Companies)
        await deleteForeignData('employees');
        await deleteForeignData('designations');
        await deleteForeignData('departments');
        await deleteForeignData('branches');

        // Delete other companies
        await supabase.schema('core').from('companies').delete().neq('id', TARGET_COMPANY_ID);

        // 3. Clear CURRENT data for Target Company (to re-seed fresh)
        console.log('✨ Preparing fresh canvas...');
        await supabase.schema('core').from('employees').delete().eq('company_id', TARGET_COMPANY_ID);
        await supabase.schema('core').from('designations').delete().eq('company_id', TARGET_COMPANY_ID);
        await supabase.schema('core').from('departments').delete().eq('company_id', TARGET_COMPANY_ID);
        await supabase.schema('core').from('branches').delete().eq('company_id', TARGET_COMPANY_ID);

        // 4. Seed Fresh Data
        console.log('🌱 Seeding Professional Data...');

        // A. Create Branches
        const { data: hq, error: hqError } = await supabase.schema('core').from('branches').insert([
            {
                company_id: TARGET_COMPANY_ID,
                name: 'Chennai HQ',
                code: 'MAS-01',
                branch_type: 'HEAD_OFFICE',
                is_head_office: true,
                email: 'admin@durkkas.com',
                city: 'Chennai',
                state: 'Tamil Nadu',
                country: 'India',
                is_active: true
            }
        ]).select();

        if (hqError) throw hqError;
        const mainBranchId = hq[0].id;

        // B. Create Departments
        const { data: depts, error: deptError } = await supabase.schema('core').from('departments').insert([
            { company_id: TARGET_COMPANY_ID, branch_id: mainBranchId, name: 'Tech & Development', code: 'TECH' },
            { company_id: TARGET_COMPANY_ID, branch_id: mainBranchId, name: 'Sales & Marketing', code: 'MKT' },
            { company_id: TARGET_COMPANY_ID, branch_id: mainBranchId, name: 'Operations', code: 'OPS' },
            { company_id: TARGET_COMPANY_ID, branch_id: mainBranchId, name: 'Finance', code: 'FIN' }
        ]).select();

        if (deptError) throw deptError;

        // C. Create Designations
        await supabase.schema('core').from('designations').insert([
            { company_id: TARGET_COMPANY_ID, title: 'Project Manager', code: 'PM', hierarchy_level: 3 },
            { company_id: TARGET_COMPANY_ID, title: 'Senior Developer', code: 'SR-DEV', hierarchy_level: 4 },
            { company_id: TARGET_COMPANY_ID, title: 'Junior Developer', code: 'JR-DEV', hierarchy_level: 5 },
            { company_id: TARGET_COMPANY_ID, title: 'UI/UX Designer', code: 'DES', hierarchy_level: 4 },
            { company_id: TARGET_COMPANY_ID, title: 'Sales Executive', code: 'SALES', hierarchy_level: 5 }
        ]);

        console.log('\n✅ D A T A   R E F R E S H E D');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Organization: Durkkas Innovations Pvt Ltd');
        console.log('Branches:     1 Clean Record');
        console.log('Departments:  4 Core Units');
        console.log('Designations: 5 Key Roles');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ SEED ERROR:', error);
    }
}

seedCleanData();
