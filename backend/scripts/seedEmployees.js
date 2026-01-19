/**
 * SEED EMPLOYEES SCRIPT
 * 
 * Usage: node scripts/seedEmployees.js
 * 
 * This script will:
 * 1. Fetch existing Departments/Designations for Durkkas Innovations (Company 1)
 * 2. Create sample Employees linked to these departments
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

async function seedEmployees() {
    try {
        console.log('👥 Recruiting Workforce for Durkkas Innovations...');

        const CMP_ID = 1;

        // 1. Fetch Metadata (We need IDs to link)
        const { data: deptData } = await supabase.schema('core').from('departments').select('id, code').eq('company_id', CMP_ID);
        const { data: desigData } = await supabase.schema('core').from('designations').select('id, code').eq('company_id', CMP_ID);
        const { data: branchData } = await supabase.schema('core').from('branches').select('id, is_head_office').eq('company_id', CMP_ID);

        if (!deptData || !desigData || !branchData) {
            throw new Error('Metadata missing! Run seedCleanData.js first.');
        }

        // Helper to find ID by Code
        const getDept = (code) => deptData.find(d => d.code === code)?.id;
        const getDesig = (code) => desigData.find(d => d.code === code)?.id;
        const mainBranch = branchData.find(b => b.is_head_office)?.id || branchData[0].id;

        // 2. Define Employees
        const newHires = [
            {
                first_name: 'Rahul', last_name: 'Dravid', email: 'rahul.d@durkkas.com', phone: '9876543210',
                department_id: getDept('TECH'), designation_id: getDesig('PM'),
                employee_code: 'EMP-001', is_active: true
            },
            {
                first_name: 'Virat', last_name: 'Kohli', email: 'virat.k@durkkas.com', phone: '9876543211',
                department_id: getDept('TECH'), designation_id: getDesig('SR-DEV'),
                employee_code: 'EMP-002', is_active: true
            },
            {
                first_name: 'Shubman', last_name: 'Gill', email: 'shubman.g@durkkas.com', phone: '9876543212',
                department_id: getDept('TECH'), designation_id: getDesig('JR-DEV'),
                employee_code: 'EMP-003', is_active: true
            },
            {
                first_name: 'Rishabh', last_name: 'Pant', email: 'rishabh.p@durkkas.com', phone: '9876543213',
                department_id: getDept('TECH'), designation_id: getDesig('DES'),
                employee_code: 'EMP-004', is_active: true
            },
            {
                first_name: 'Ravi', last_name: 'Shastri', email: 'ravi.s@durkkas.com', phone: '9876543214',
                department_id: getDept('MKT'), designation_id: getDesig('SALES'),
                employee_code: 'EMP-005', is_active: true
            },
            {
                first_name: 'Ms.', last_name: 'Dhoni', email: 'ms.d@durkkas.com', phone: '9876543215',
                department_id: getDept('OPS'), designation_id: getDesig('PM'), // Ops Manager
                employee_code: 'EMP-006', is_active: true
            }
        ];

        // 3. Insert Employees
        const inserts = newHires.map(emp => ({
            ...emp,
            company_id: CMP_ID,
            branch_id: mainBranch,
            created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
            .schema('core')
            .from('employees')
            .insert(inserts);

        if (insertError) throw insertError;

        console.log('\n✅ S U C C E S S !');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🎉 Onboarded ${newHires.length} new employees`);
        console.log('👉 Dashboard will now show real stats!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ SEED ERROR:', error);
    }
}

seedEmployees();
