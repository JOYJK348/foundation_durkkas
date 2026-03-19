const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function enroll() {
    console.log('🔗 Enrolling students...');

    const enrollments = [
        { company_id: 13, student_id: 39, course_id: 1 },
        { company_id: 13, student_id: 40, course_id: 2 }
    ];

    for (const e of enrollments) {
        let { data: existing } = await supabase.schema('ems').from('student_enrollments')
            .select('id')
            .eq('student_id', e.student_id)
            .eq('course_id', e.course_id)
            .limit(1)
            .single();

        if (existing) {
            console.log(`ℹ️ Student ${e.student_id} already enrolled in course ${e.course_id}`);
            continue;
        }

        const { error } = await supabase.schema('ems').from('student_enrollments').insert({
            ...e,
            enrollment_status: 'ACTIVE',
            payment_status: 'PAID',
            enrollment_date: new Date().toISOString(),
            total_lessons: 48,
            lessons_completed: 0,
            completion_percentage: 0
        });

        if (error) {
            console.error(`Error enrolling student ${e.student_id}:`, error);
        } else {
            console.log(`✅ Enrolled student ${e.student_id}`);
        }
    }
}
enroll();
