import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://waxbttxqhyoczmdshpzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    try {
        console.log('🔍 Running Database Diagnostic v2...\n');

        // 1. Get Rajesh's email and find User ID
        const email = 'rajesh.sharma@student.dipl.edu';
        const { data: userData, error: userError } = await supabase
            .schema('app_auth')
            .from('users')
            .select('id, email, display_name')
            .eq('email', email)
            .single();

        if (userError) {
            console.log('❌ Rajesh user not found:', userError.message);
        } else {
            const userId = userData.id;
            console.log(`✅ User found: ${userData.email} (ID: ${userId})`);

            // 2. Check Role Assignments
            const { data: roles, error: rolesError } = await supabase
                .schema('app_auth')
                .from('user_roles')
                .select('*')
                .eq('user_id', userId);

            console.log(`✅ Roles for User ${userId}:`, roles?.length || 0);
            roles?.forEach(r => console.log(`   - Company: ${r.company_id}, Branch: ${r.branch_id}, Role: ${r.role_id}`));

            // 3. Check Student Record
            const { data: student, error: studentError } = await supabase
                .schema('ems')
                .from('students')
                .select('*')
                .eq('user_id', userId);

            console.log(`✅ Student Record in ems.students for User ${userId}:`, student?.length || 0);
            student?.forEach(s => console.log(`   - ID: ${s.id}, Code: ${s.student_code}, Company ID: ${s.company_id}`));
        }

        // 4. Check Company DIPL
        const { data: company, error: companyError } = await supabase
            .schema('core')
            .from('companies')
            .select('id, name, code')
            .eq('code', 'DIPL')
            .single();

        if (companyError) {
            console.log('❌ Company DIPL error:', companyError.message);
        } else {
            console.log(`✅ Company DIPL: ID = ${company.id}, Name = ${company.name}`);
        }

    } catch (e: any) {
        console.error('DIAGNOSTIC FAILED:', e.message);
    }
}

diagnose();
