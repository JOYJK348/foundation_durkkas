import { ems, app_auth } from './backend/lib/supabase';
import bcrypt from 'bcryptjs';

async function createTestStudents() {
    console.log('🚀 Creating test students...');

    const companyId = 13; // Durkkas Academy
    const branchId = null;
    const password = 'Student@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const studentsToCreate = [
        {
            email: 'fs_student@durkkas.com',
            firstName: 'FullStack',
            lastName: 'Student',
            courseCode: 'FS-2026-01',
            studentCode: 'STU-FS-999'
        },
        {
            email: 'ds_student@durkkas.com',
            firstName: 'DataScience',
            lastName: 'Student',
            courseCode: 'DS-2026-01',
            studentCode: 'STU-DS-999'
        }
    ];

    for (const s of studentsToCreate) {
        // 1. Create/Update User
        let userId: number;
        const { data: existingUser } = await app_auth.users()
            .select('id')
            .eq('email', s.email.toLowerCase())
            .single();

        if (!existingUser) {
            const { data: newUser, error: userError } = await app_auth.users().insert({
                email: s.email.toLowerCase(),
                password_hash: hashedPassword,
                first_name: s.firstName,
                last_name: s.lastName,
                display_name: `${s.firstName} ${s.lastName}`,
                is_active: true,
                is_verified: true
            }).select('id').single();

            if (userError) {
                console.error(`Error creating user ${s.email}:`, userError);
                continue;
            }
            userId = (newUser as any).id;
            console.log(`✅ Created User: ${s.email}`);
        } else {
            userId = (existingUser as any).id;
            await app_auth.users().update({
                password_hash: hashedPassword,
                is_active: true,
                updated_at: new Date().toISOString()
            }).eq('id', userId);
            console.log(`✅ Updated User: ${s.email}`);
        }

        // 2. Assign Role (STUDENT)
        const { data: role } = await app_auth.roles().select('id').eq('name', 'STUDENT').single();
        if (role) {
            await app_auth.userRoles().upsert({
                user_id: userId,
                role_id: (role as any).id,
                company_id: companyId,
                branch_id: branchId,
                is_active: true
            }, {
                onConflict: 'user_id,role_id,company_id,branch_id'
            });
        }

        // 3. Create Student Record
        let studentId: number;
        const { data: existingStudent } = await ems.students()
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!existingStudent) {
            const { data: newStudent, error: stuError } = await ems.students().insert({
                company_id: companyId,
                branch_id: branchId,
                user_id: userId,
                student_code: s.studentCode,
                first_name: s.firstName,
                last_name: s.lastName,
                email: s.email.toLowerCase(),
                status: 'ACTIVE',
                is_active: true
            }).select('id').single();

            if (stuError) {
                console.error(`Error creating student for ${s.email}:`, stuError);
                continue;
            }
            studentId = (newStudent as any).id;
        } else {
            studentId = (existingStudent as any).id;
        }

        // 4. Enroll in course (Try to find course by code)
        const { data: course } = await ems.courses().select('id').eq('course_code', s.courseCode).single();
        if (course) {
            const { data: batch } = await ems.batches().select('id').eq('course_id', (course as any).id).limit(1).single();

            await ems.enrollments().upsert({
                company_id: companyId,
                student_id: studentId,
                course_id: (course as any).id,
                batch_id: (batch as any)?.id || null,
                enrollment_status: 'ACTIVE',
                payment_status: 'PAID',
                enrollment_date: new Date().toISOString()
            }, { onConflict: 'student_id,course_id' });

            console.log(`✅ Enrolled ${s.email} in ${s.courseCode}`);
        }
    }

    console.log('✨ All done!');
}

createTestStudents();
