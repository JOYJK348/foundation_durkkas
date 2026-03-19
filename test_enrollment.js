const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEnrollment() {
    console.log('🧪 Testing Student Enrollment...');

    // Assuming we have these IDs from previous context
    const studentId = 10; // Student ID from earlier commands
    const courseId = 1;  // Assuming course 1 exists
    const companyId = 13;

    console.log(`Enrolling student ${studentId} into course ${courseId}...`);

    try {
        // 1. Check if course exists
        const { data: course, error: cError } = await supabase
            .schema('ems')
            .from('courses')
            .select('id, total_lessons')
            .eq('id', courseId)
            .single();

        if (cError) {
            console.error('❌ Course not found:', cError);
            return;
        }
        console.log('✅ Course found:', course);

        // 2. Perform enrollment
        const { data, error } = await supabase
            .schema('ems')
            .from('student_enrollments')
            .insert({
                company_id: companyId,
                student_id: studentId,
                course_id: courseId,
                total_lessons: course.total_lessons || 0,
                lessons_completed: 0,
                completion_percentage: 0,
                enrollment_status: 'ACTIVE',
                payment_status: 'PAID'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Enrollment failed:', error);
        } else {
            console.log('✅ Enrollment successful:', data);
        }

    } catch (err) {
        console.error('🔥 CRITICAL ERROR:', err);
    }
}

testEnrollment();
