/**
 * Quick Script to Create Test Student Account
 * Run: npx tsx scripts/create-test-student.ts
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestStudent() {
    try {
        console.log('🔧 Creating test student account...\n');

        // 1. Hash password
        const password = 'student@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Create user in app_auth.users
        const { data: user, error: userError } = await supabase
            .from('users')
            .insert({
                email: 'priya.patel@student.dipl.edu',
                password_hash: hashedPassword,
                first_name: 'Priya',
                last_name: 'Patel',
                display_name: 'Priya Patel',
                is_active: true,
                is_verified: true
            })
            .select()
            .single();

        if (userError) {
            console.error('❌ User creation failed:', userError);
            return;
        }

        console.log('✅ User created:', user.email);

        // 3. Get company ID (DIPL)
        const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('code', 'DIPL')
            .single();

        if (!company) {
            console.error('❌ Company DIPL not found');
            return;
        }

        // 4. Create student record
        const { data: student, error: studentError } = await supabase
            .from('students')
            .insert({
                company_id: company.id,
                user_id: user.id,
                student_code: 'DIPL2026002',
                first_name: 'Priya',
                last_name: 'Patel',
                email: 'priya.patel@student.dipl.edu',
                date_of_birth: '2006-03-20',
                gender: 'Female',
                phone: '+91-9876543210',
                status: 'ACTIVE',
                is_active: true
            })
            .select()
            .single();

        if (studentError) {
            console.error('❌ Student creation failed:', studentError);
            return;
        }

        console.log('✅ Student created:', student.student_code);

        // 5. Assign STUDENT role
        const { data: role } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'STUDENT')
            .single();

        if (role) {
            await supabase.from('user_roles').insert({
                user_id: user.id,
                role_id: role.id,
                company_id: company.id,
                is_active: true
            });
            console.log('✅ Role assigned: STUDENT');
        }

        console.log('\n🎉 Test student created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    priya.patel@student.dipl.edu');
        console.log('🔑 Password: student@123');
        console.log('🆔 Code:     DIPL2026002');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createTestStudent();
