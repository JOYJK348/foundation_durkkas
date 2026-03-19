const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function fromSchema(schema, table) {
    return supabase.schema(schema).from(table);
}

async function fixStudentLogin() {
    const email = 'sarithra@gmail.com';
    const password = 'Student@123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const companyId = 13; // Using same company as before likely
    const branchId = 46;

    console.log(`🔧 Fixing login for: ${email}`);

    // 1. Get or Create User
    let { data: user } = await fromSchema('app_auth', 'users').select('*').eq('email', email).single();

    if (!user) {
        console.log('User not found, creating new user...');
        const { data: newUser, error } = await fromSchema('app_auth', 'users').insert({
            email: email,
            password_hash: hashedPassword,
            first_name: 'Sarithra',
            last_name: 'Student',
            display_name: 'Sarithra Student',
            is_active: true,
            is_verified: true
        }).select().single();

        if (error) {
            console.error('Failed to create user:', error);
            return;
        }
        user = newUser;
        console.log('✅ User created');
    } else {
        console.log('User found, updating password...');
        const { error } = await fromSchema('app_auth', 'users').update({
            password_hash: hashedPassword,
            is_active: true
        }).eq('id', user.id);

        if (error) console.error('Failed to update password:', error);
        else console.log('✅ Password updated to: Student@123');
    }

    // 2. Assign STUDENT role
    const { data: role } = await fromSchema('app_auth', 'roles').select('id').eq('name', 'STUDENT').single();
    if (role) {
        await fromSchema('app_auth', 'user_roles').upsert({
            user_id: user.id,
            role_id: role.id,
            company_id: companyId,
            branch_id: branchId,
            is_active: true
        }, { onConflict: 'user_id,role_id,company_id,branch_id' });
        console.log('✅ Role assigned');
    }

    // 3. Ensure Student Record Exists (Critical for 404 error)
    const { data: student } = await fromSchema('ems', 'students').select('id').eq('user_id', user.id).single();

    if (!student) {
        console.log('Student profile missing, creating...');
        const { error: stuError } = await fromSchema('ems', 'students').insert({
            company_id: companyId,
            branch_id: branchId,
            user_id: user.id,
            student_code: 'STU-SARITHRA',
            first_name: 'Sarithra',
            last_name: 'Student',
            email: email,
            status: 'ACTIVE',
            is_active: true
        });
        if (stuError) console.error('Failed to create student profile:', stuError);
        else console.log('✅ Student profile created');
    } else {
        console.log('✅ Student profile exists');
    }

    // 4. Enroll in a Course (Data Science) so dashboard isn't empty
    const { data: studentRec } = await fromSchema('ems', 'students').select('id').eq('user_id', user.id).single();
    if (studentRec) {
        // Find Data Science or any course
        const { data: course } = await fromSchema('ems', 'courses').select('id').ilike('course_name', '%Data Science%').limit(1).single();
        if (course) {
            const { data: batch } = await fromSchema('ems', 'batches').select('id').eq('course_id', course.id).limit(1).single();

            await fromSchema('ems', 'student_enrollments').upsert({
                company_id: companyId,
                student_id: studentRec.id,
                course_id: course.id,
                batch_id: batch ? batch.id : null,
                enrollment_status: 'ACTIVE',
                enrollment_date: new Date().toISOString()
            }, { onConflict: 'student_id,course_id' });
            console.log('✅ Enrolled in Data Science course');
        }
    }
}

fixStudentLogin();
