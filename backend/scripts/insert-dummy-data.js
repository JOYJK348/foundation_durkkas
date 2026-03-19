// Quick script to insert EMS dummy data
const { createClient } = require('@supabase/supabase-js');

// ⚠️ CHANGE THESE VALUES ⚠️
const COMPANY_ID = 2;  // ← Change this to your company_id
const BRANCH_ID = 1;   // ← Change this to your branch_id

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertDummyData() {
    console.log('🚀 Starting dummy data insertion...');
    console.log(`Using Company ID: ${COMPANY_ID}, Branch ID: ${BRANCH_ID}`);

    try {
        // 1. Insert Courses
        console.log('\n📚 Inserting courses...');
        const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .insert([
                {
                    company_id: COMPANY_ID,
                    branch_id: BRANCH_ID,
                    course_code: 'FS-2026-01',
                    course_name: 'Full Stack Web Development Bootcamp',
                    course_description: 'Master modern web development with React, Node.js, and PostgreSQL.',
                    duration_hours: 640,
                    status: 'PUBLISHED',
                    is_published: true,
                    course_category: 'Programming',
                    course_level: 'INTERMEDIATE',
                    total_lessons: 64
                },
                {
                    company_id: COMPANY_ID,
                    branch_id: BRANCH_ID,
                    course_code: 'DS-2026-01',
                    course_name: 'Data Science & Machine Learning',
                    course_description: 'Learn Python, Pandas, NumPy, Scikit-learn, and TensorFlow.',
                    duration_hours: 800,
                    status: 'PUBLISHED',
                    is_published: true,
                    course_category: 'Data Science',
                    course_level: 'ADVANCED',
                    total_lessons: 80
                },
                {
                    company_id: COMPANY_ID,
                    branch_id: BRANCH_ID,
                    course_code: 'DM-2026-01',
                    course_name: 'Digital Marketing Masterclass',
                    course_description: 'Complete digital marketing course covering SEO, SEM, Social Media.',
                    duration_hours: 480,
                    status: 'PUBLISHED',
                    is_published: true,
                    course_category: 'Marketing',
                    course_level: 'BEGINNER',
                    total_lessons: 48
                }
            ])
            .select();

        if (coursesError) throw coursesError;
        console.log(`✅ Created ${courses.length} courses`);

        // 2. Insert Students
        console.log('\n👨‍🎓 Inserting students...');
        const students = [];
        const names = [
            ['Rajesh', 'Kumar', 'MALE'],
            ['Priya', 'Sharma', 'FEMALE'],
            ['Amit', 'Patel', 'MALE'],
            ['Sneha', 'Reddy', 'FEMALE'],
            ['Vikram', 'Singh', 'MALE']
        ];

        for (let i = 0; i < names.length; i++) {
            students.push({
                company_id: COMPANY_ID,
                branch_id: BRANCH_ID,
                student_code: `STU-2026-${String(i + 1).padStart(3, '0')}`,
                first_name: names[i][0],
                last_name: names[i][1],
                email: `${names[i][0].toLowerCase()}.${names[i][1].toLowerCase()}@gmail.com`,
                phone: `+91 987654${String(i).padStart(4, '0')}`,
                gender: names[i][2],
                date_of_birth: '2000-01-01',
                status: 'ACTIVE'
            });
        }

        const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .insert(students)
            .select();

        if (studentsError) throw studentsError;
        console.log(`✅ Created ${studentsData.length} students`);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ DUMMY DATA CREATED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Summary:`);
        console.log(`   - Courses: ${courses.length}`);
        console.log(`   - Students: ${studentsData.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

insertDummyData();
