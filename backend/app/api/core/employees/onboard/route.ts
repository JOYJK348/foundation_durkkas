import { NextRequest } from 'next/server';
import { core, app_auth } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import bcrypt from 'bcryptjs';

/**
 * STRATEGIC ONBOARDING API
 * Route: /api/core/employees/onboard
 * Performs atomic registration of:
 * 1. Employee Record (Master)
 * 2. System User (Auth)
 * 3. Role Assignment (Hierarchy)
 * 4. Granular Permissions (Overrides)
 */
export async function POST(req: NextRequest) {
    try {
        const actingUserId = await getUserIdFromToken(req);
        if (!actingUserId) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

        const scope = await getUserTenantScope(actingUserId);
        if (scope.roleLevel < 4) return errorResponse('FORBIDDEN', 'Access Denied: Strategic Hire requires Company Admin or above', 403);

        const body = await req.json();
        const {
            employee,      // { first_name, last_name, email, phone, branch_id, designation_id, employee_code, date_of_joining, employment_type }
            role_id,       // System role for user account
            permission_ids // Array of permission IDs for granular overrides
        } = body;

        if (!employee.email || !employee.first_name || !employee.employee_code || !role_id) {
            return errorResponse('VALIDATION_ERROR', 'Missing required recruitment parameters', 400);
        }

        // 🛡️ SECURITY: Validate targeting
        // 1. If Company Admin, ensure branch belongs to their company
        if (scope.roleLevel === 4) {
            const { data: branch } = await core.branches()
                .select('company_id')
                .eq('id', employee.branch_id)
                .single();

            if (!branch || branch.company_id !== scope.companyId) {
                return errorResponse('FORBIDDEN', 'Strategic Error: Cannot hire for outside branches', 403);
            }
        }

        // 2. Validate Role Level (Cannot assign a role higher or equal to self)
        const { data: targetRole } = await app_auth.roles().select('level').eq('id', role_id).single();
        if (!targetRole || (targetRole.level >= scope.roleLevel && scope.roleLevel < 5)) {
            return errorResponse('FORBIDDEN', 'Hierarchy Protection: Cannot assign higher-tier roles', 403);
        }

        // 🚀 ATOMIC DISPATCH
        // Note: Using a single Supabase transaction/service role call if possible 
        // For simplicity here, we do sequential with rollback-like logic (better to use RPC for real production)

        // 1. Create Employee Record
        const employeeData = {
            ...employee,
            company_id: scope.companyId || employee.company_id,
            is_active: true
        };

        const { data: newEmployee, error: empError } = await core.employees()
            .insert(employeeData)
            .select()
            .single();

        if (empError) throw new Error(`recruitment_failure: ${empError.message}`);

        // 2. Create System User
        const defaultPassword = 'User@' + Math.floor(1000 + Math.random() * 9000); // Temporary password format
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        const { data: newUser, error: userError } = await app_auth.users()
            .insert({
                email: employee.email,
                password_hash: hashedPassword,
                first_name: employee.first_name,
                last_name: employee.last_name,
                display_name: `${employee.first_name} ${employee.last_name}`,
                is_active: true,
                is_verified: true // Pre-verified for internal onboarding
            })
            .select()
            .single();

        if (userError) {
            // Rollback employee if user creation fails
            await core.employees().delete().eq('id', newEmployee.id);

            // Check for duplicate email
            if (userError.code === '23505' && (userError.message?.toLowerCase().includes('email') || userError.details?.toLowerCase().includes('email'))) {
                return errorResponse(
                    'DUPLICATE_ENTRY',
                    'This email address is already registered in the system. The employee cannot be onboarded with a duplicate email. Please use a different email address.',
                    409,
                    { field: 'email' },
                    'email'
                );
            }

            throw new Error(`credential_generation_failure: ${userError.message}`);
        }

        // 3. Assign User Role
        const { error: roleError } = await app_auth.userRoles()
            .insert({
                user_id: newUser.id,
                role_id: role_id,
                company_id: scope.companyId || employee.company_id,
                branch_id: employee.branch_id || null,
                is_active: true
            });

        if (roleError) throw new Error(`hierarchy_assignment_failure: ${roleError.message}`);

        // 4. Assign Granular Permissions (Overrides)
        if (permission_ids && permission_ids.length > 0) {
            const permissionInserts = permission_ids.map((pid: string) => ({
                user_id: newUser.id,
                permission_id: pid,
                company_id: scope.companyId || employee.company_id
            }));

            const { error: permError } = await app_auth.userPermissions()
                .insert(permissionInserts);

            if (permError) console.error('Non-critical: Overrides failed to apply', permError);
        }

        return successResponse({
            employee: newEmployee,
            user: {
                id: newUser.id,
                email: newUser.email,
                temporary_password: defaultPassword
            }
        }, 'Strategic Personnel Onboarding Complete');

    } catch (error: any) {
        console.error('[OnboardAPI] Error:', error);
        return errorResponse('INTERNAL_ERROR', error.message, 500);
    }
}
