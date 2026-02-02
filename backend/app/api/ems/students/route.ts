import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserTenantScope, autoAssignCompany } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { studentSchema } from '@/lib/validations/ems';
import { StudentService } from '@/lib/services/StudentService';
import { app_auth } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        const data = await StudentService.getAllStudents(scope.companyId!);

        return successResponse(data, `Students fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch students');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();

        // 1. Auto-assign company_id and branch_id based on user session
        data = await autoAssignCompany(userId, data);

        // 2. Validate input using Zod
        const validatedData = studentSchema.parse(data);

        // 3. User Account Creation Logic
        // Generate username from student code (e.g., STU001 -> stu001)
        const generatedUsername = validatedData.student_code.toLowerCase();
        const generatedPassword = (data as any).password || 'Student@123'; // Use provided password or default

        // check if user exists
        let { data: existingUser } = await app_auth.users().select('id').eq('email', validatedData.email).single();
        let newUserId = existingUser?.id;

        if (!newUserId) {
            // Create New User
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);
            const displayName = `${validatedData.first_name} ${validatedData.last_name}`;

            const { data: newUser, error: userError } = await app_auth.users().insert({
                email: validatedData.email,
                password_hash: hashedPassword,
                first_name: validatedData.first_name,
                last_name: validatedData.last_name,
                display_name: displayName,
                is_active: true,
                is_verified: true
            }).select().single();

            if (userError) throw new Error(`User creation failed: ${userError.message}`);
            newUserId = newUser.id;

            // Assign STUDENT Role
            // Find role ID for STUDENT
            const { data: roleData } = await app_auth.roles().select('id').eq('name', 'STUDENT').single();
            const roleId = roleData?.id || 6; // Fallback to 6 if not found

            // Link Role
            await app_auth.userRoles().insert({
                user_id: newUserId,
                role_id: roleId,
                company_id: validatedData.company_id,
                branch_id: validatedData.branch_id,
                is_active: true
            });
        }

        // 4. Insert into EMS Students table
        const student = await StudentService.createStudent({
            ...validatedData,
            user_id: newUserId
        });

        return successResponse(
            {
                ...student,
                user_created: !existingUser,
                login_credentials: {
                    email: validatedData.email,
                    password: generatedPassword,
                    student_code: validatedData.student_code
                }
            },
            `Student admitted successfully! Login Email: ${validatedData.email} | Password: ${generatedPassword}`,
            201
        );

    } catch (error: any) {
        console.error("Student Creation Error:", error);
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to admit student');
    }
}
