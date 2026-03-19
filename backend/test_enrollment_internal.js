const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEnrollment() {
    console.log('🧪 Testing Student Enrollment...');

    try {
        // 1. Get a course
        const { data: course, error: cError } = await supabase
            .schema('ems')
            .from('courses')
            .select('id, total_lessons')
            .limit(1)
            .single();

        if (cError) {
            console.error('❌ Course Error:', cError);
            return;
        }

        // 2. Get a student
        const { data: student, error: sError } = await supabase
            .schema('ems')
            .from('students')
            .select('id')
            .limit(1)
            .single();

        if (sError) {
            console.error('❌ Student Error:', sError);
            return;
        }

        console.log(`Enrolling student ${student.id} into course ${course.id}...`);

        // 3. Perform enrollment
        const { data, error } = await supabase
            .schema('ems')
            .from('student_enrollments')
            .insert({
                company_id: 13,
                student_id: student.id,
                course_id: course.id,
                total_lessons: course.total_lessons || 0,
                lessons_completed: 0,
                completion_percentage: 0,
                enrollment_status: 'ACTIVE',
                payment_status: 'PAID'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Enrollment Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Success:', data);
        }

    } catch (err) {
        console.error('🔥 Catch:', err);
    }
}

testEnrollment();
