import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://waxbttxqhyoczmdshpzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRealData() {
    try {
        console.log('🚀 Setting up real data for Student Dashboard (v2)...\n');

        const userId = 254;
        const companyId = 11;
        const branchId = 37;

        // 1. Check if Student Record exists
        const { data: existingStudent } = await supabase
            .schema('ems')
            .from('students')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        let studentId;
        if (existingStudent) {
            studentId = existingStudent.id;
            console.log('✅ Student record already exists:', studentId);
        } else {
            const { data: student, error: studentError } = await supabase
                .schema('ems')
                .from('students')
                .insert({
                    company_id: companyId,
                    branch_id: branchId,
                    user_id: userId,
                    student_code: 'DIPL2026001',
                    first_name: 'Rajesh',
                    last_name: 'Sharma',
                    email: 'rajesh.sharma@student.dipl.edu',
                    status: 'ACTIVE',
                    is_active: true
                })
                .select()
                .single();

            if (studentError) {
                console.error('❌ Student Record Error:', studentError.message);
                return;
            }
            studentId = student.id;
            console.log('✅ Student Record created:', studentId);
        }

        // 2. Create a Real Course (if none exists)
        let courseId;
        const { data: existingCourse } = await supabase
            .schema('ems')
            .from('courses')
            .select('id')
            .limit(1)
            .maybeSingle();

        if (existingCourse) {
            courseId = existingCourse.id;
            console.log('✅ Using existing course:', courseId);
        } else {
            const { data: newCourse, error: courseError } = await supabase
                .schema('ems')
                .from('courses')
                .insert({
                    company_id: companyId,
                    course_name: 'Full Stack Web Development (Real)',
                    course_code: 'FSWD-01',
                    is_active: true,
                    total_lessons: 40
                })
                .select()
                .single();

            if (courseError) {
                console.error('❌ Course Creation Error:', courseError.message);
                return;
            }
            courseId = newCourse.id;
            console.log('✅ Created new course:', courseId);
        }

        // 3. Create Real Enrollment (Check if exists first to avoid constraint error)
        const { data: existingEnroll } = await supabase
            .schema('ems')
            .from('student_enrollments')
            .select('id')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .maybeSingle();

        if (existingEnroll) {
            console.log('✅ Enrollment already exists:', existingEnroll.id);
        } else {
            const { error: enrollError } = await supabase
                .schema('ems')
                .from('student_enrollments')
                .insert({
                    company_id: companyId,
                    student_id: studentId,
                    course_id: courseId,
                    enrollment_date: new Date().toISOString(),
                    enrollment_status: 'ACTIVE',
                    total_lessons: 40,
                    lessons_completed: 10,
                    completion_percentage: 25
                });

            if (enrollError) {
                console.error('❌ Enrollment Error:', enrollError.message);
            } else {
                console.log('✅ Enrollment created successfully.');
            }
        }

    } catch (e: any) {
        console.error('SETUP FAILED:', e.message);
    }
}

setupRealData();
