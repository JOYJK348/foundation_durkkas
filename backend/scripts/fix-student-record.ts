import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://waxbttxqhyoczmdshpzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStudent() {
    try {
        console.log('🛠️ Fixing Student Record (Safe Mode)...\n');

        const userId = 254;
        const companyId = 11;
        const branchId = 37;

        // Try to insert directly with schema qualification
        // If it fails with permission denied, it's a DB level issue
        const { data: student, error: studentError } = await supabase
            .schema('ems')
            .from('students')
            .upsert({
                company_id: companyId,
                branch_id: branchId,
                user_id: userId,
                student_code: 'DIPL2026001',
                first_name: 'Rajesh',
                last_name: 'Sharma',
                email: 'rajesh.sharma@student.dipl.edu',
                date_of_birth: '2005-06-15',
                gender: 'Male',
                phone: '+91-9123456789',
                status: 'ACTIVE',
                is_active: true
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (studentError) {
            console.error('❌ Failed to create student record:', studentError.message);

            if (studentError.message.includes('permission denied')) {
                console.log('\n💡 INSTRUCTION: Please run the following SQL in your Supabase SQL Editor:');
                console.log('GRANT ALL ON SCHEMA ems TO postgres, authenticated, anon, service_role;');
                console.log('GRANT ALL ON ALL TABLES IN SCHEMA ems TO postgres, authenticated, anon, service_role;');
                console.log('GRANT ALL ON ALL SEQUENCES IN SCHEMA ems TO postgres, authenticated, anon, service_role;');
            }
        } else {
            console.log('✅ Student record created/updated successfully:', student.student_code);

            // Create enrollment
            const { error: enrollError } = await supabase
                .schema('ems')
                .from('student_enrollments')
                .upsert({
                    company_id: companyId,
                    student_id: student.id,
                    course_id: 1, // Assumed course ID 1
                    enrollment_date: new Date().toISOString(),
                    enrollment_status: 'ACTIVE',
                    total_lessons: 48,
                    lessons_completed: 12,
                    completion_percentage: 25
                }, { onConflict: 'student_id,course_id' });

            if (enrollError) {
                console.error('❌ Failed to create enrollment:', enrollError.message);
            } else {
                console.log('✅ Enrollment created/updated.');
            }
        }

    } catch (e: any) {
        console.error('FIX FAILED:', e.message);
    }
}

fixStudent();
