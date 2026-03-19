const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper for schema-aware queries
function fromSchema(schema, table) {
    return supabase.schema(schema).from(table);
}

async function createTestStudents() {
    console.log('🚀 Creating test students for company 13...');

    const companyId = 13;
    const branchId = 46;
    const password = 'Student@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const studentsToCreate = [
        {
            email: 'fs_student@durkkas.com',
            firstName: 'FullStack',
            lastName: 'Student',
            courseCode: 'FSD-2026',
            studentCode: 'STU-FS-999'
        },
        {
            email: 'ds_student@durkkas.com',
            firstName: 'DataScience',
            lastName: 'Student',
            courseCode: 'DSAI-2026',
            studentCode: 'STU-DS-999'
        }
    ];

    for (const s of studentsToCreate) {
        // 1. Create/Update User
        let { data: user } = await fromSchema('app_auth', 'users')
            .select('id')
            .eq('email', s.email)
            .single();

        if (!user) {
            const { data: newUser, error: userError } = await fromSchema('app_auth', 'users').insert({
                email: s.email,
                password_hash: hashedPassword,
                first_name: s.firstName,
                last_name: s.lastName,
                display_name: `${s.firstName} ${s.lastName}`,
                is_active: true,
                is_verified: true
            }).select().single();

            if (userError) {
                console.error(`Error creating user ${s.email}:`, userError);
                continue;
            }
            user = newUser;
            console.log(`✅ Created User: ${s.email}`);
        } else {
            await fromSchema('app_auth', 'users').update({
                password_hash: hashedPassword,
                is_active: true
            }).eq('id', user.id);
            console.log(`✅ Updated User: ${s.email}`);
        }

        // 2. Assign Role if missing
        const { data: role } = await fromSchema('app_auth', 'roles').select('id').eq('name', 'STUDENT').single();
        if (role) {
            await fromSchema('app_auth', 'user_roles').upsert({
                user_id: user.id,
                role_id: role.id,
                company_id: companyId,
                branch_id: branchId,
                is_active: true
            }, { onConflict: 'user_id,role_id,company_id,branch_id' });
        }

        // 3. Create Student Record
        let { data: student } = await fromSchema('ems', 'students')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!student) {
            const { data: newStudent, error: stuError } = await fromSchema('ems', 'students').insert({
                company_id: companyId,
                branch_id: branchId,
                user_id: user.id,
                student_code: s.studentCode,
                first_name: s.firstName,
                last_name: s.lastName,
                email: s.email,
                status: 'ACTIVE',
                is_active: true
            }).select().single();

            if (stuError) {
                console.error(`Error creating student for ${s.email}:`, stuError);
                continue;
            }
            student = newStudent;
            console.log(`✅ Created Student Record: ${s.studentCode}`);
        } else {
            await fromSchema('ems', 'students').update({
                company_id: companyId,
                branch_id: branchId,
                is_active: true,
                status: 'ACTIVE'
            }).eq('id', student.id);
            console.log(`✅ Updated Student Record: ${s.studentCode}`);
        }

        // 4. Enroll in course
        const { data: course } = await fromSchema('ems', 'courses').select('id').eq('course_code', s.courseCode).single();
        if (course) {
            const { data: batch } = await fromSchema('ems', 'batches').select('id').eq('course_id', course.id).limit(1).single();

            const { error: enrollError } = await fromSchema('ems', 'student_enrollments').upsert({
                company_id: companyId,
                student_id: student.id,
                course_id: course.id,
                batch_id: batch ? batch.id : null,
                enrollment_status: 'ACTIVE',
                payment_status: 'PAID',
                enrollment_date: new Date().toISOString(),
                total_lessons: 48,
                lessons_completed: 0,
                completion_percentage: 0
            }, { onConflict: 'student_id,course_id' });

            if (enrollError) {
                console.error(`Error enrolling ${s.email}:`, enrollError);
            } else {
                console.log(`✅ Enrolled ${s.email} in ${s.courseCode}`);
            }
        } else {
            console.warn(`⚠️ Course ${s.courseCode} not found!`);
        }
    }

    console.log('✨ All done!');
}

createTestStudents();
