/**
 * AUTH API - System Users
 * Route: /api/auth/users
 */

import { NextRequest } from 'next/server';
import { app_auth } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
    try {
        const actingUserId = await getUserIdFromToken(req);
        if (!actingUserId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const scope = await getUserTenantScope(actingUserId);

        // Multi-tenant check: 
        // Platform Admin (5) can see all users
        // Company Admin (4) can see users associated with their company via user_roles

        let query = app_auth.users().select(`
            id, email, first_name, last_name, display_name, 
            is_active, last_login_at, created_at,
            user_roles!inner(
                company_id,
                role_id,
                roles(name, level)
            )
        `);

        if (scope.roleLevel < 5) {
            query = query.eq('user_roles.company_id', scope.companyId);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(data, 'Users fetched successfully');
    } catch (error: any) {
        return errorResponse('INTERNAL_ERROR', error.message);
    }
}

export async function POST(req: NextRequest) {
    try {
        const actingUserId = await getUserIdFromToken(req);
        if (!actingUserId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const scope = await getUserTenantScope(actingUserId);
        if (scope.roleLevel < 4) return errorResponse('FORBIDDEN', 'Forbidden', 403);

        const body = await req.json();
        const { email, password, first_name, last_name, display_name, role_id, company_id, branch_id } = body;

        if (!email || !password) return errorResponse('VALIDATION_ERROR', 'Email and password required', 400);

        // Security: Ensure Company Admin only creates users for their company
        const targetCompanyId = scope.roleLevel >= 5 ? company_id : scope.companyId;

        // 🛡️ STRICT RBAC: Validate Role Hierarchy
        // Company Admin (Level 4) cannot create equal or higher roles (Level 4, 5)
        if (role_id) {
            const { data: targetRole, error: roleFetchError } = await app_auth.roles()
                .select('level, name')
                .eq('id', role_id)
                .single();

            if (roleFetchError || !targetRole) {
                return errorResponse('INVALID_REQUEST', 'Invalid Role ID', 400);
            }

            if (scope.roleLevel < 5) {
                // Cannot create user with higher or equal role level
                if (targetRole.level >= scope.roleLevel) {
                    return errorResponse('FORBIDDEN', `RBAC Violation: You (Level ${scope.roleLevel}) cannot assign Role '${targetRole.name}' (Level ${targetRole.level})`, 403);
                }

                // Specific Requirement: Company Admin creating Branch Admin
                // Allow creation of Branch Admin (1), Employee/User (0), Product Admin (2)
                // Implicitly allowed by check above.
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 1. Create User
        const { data: user, error: userError } = await app_auth.users().insert({
            email,
            password_hash,
            first_name,
            last_name,
            display_name: display_name || `${first_name} ${last_name}`,
            is_active: true
        }).select().single();

        if (userError) {
            // Check for duplicate email
            if (userError.code === '23505') {
                const message = userError.message?.toLowerCase() || '';
                const details = userError.details?.toLowerCase() || '';

                if (message.includes('email') || details.includes('email')) {
                    return errorResponse(
                        'DUPLICATE_ENTRY',
                        'This email address is already registered. Please use a different email or contact support if you believe this is an error.',
                        409,
                        { field: 'email' },
                        'email'
                    );
                }
                if (message.includes('phone') || details.includes('phone')) {
                    return errorResponse(
                        'DUPLICATE_ENTRY',
                        'This phone number is already registered. Please use a different phone number.',
                        409,
                        { field: 'phone' },
                        'phone'
                    );
                }
            }
            throw new Error(userError.message);
        }

        // 2. Assign Role
        if (role_id) {
            const { error: roleError } = await app_auth.userRoles().insert({
                user_id: user.id,
                role_id: role_id,
                company_id: targetCompanyId,
                branch_id: branch_id || null,
                is_active: true
            });
            if (roleError) {
                // Consider rolling back user creation or handling it
                console.error("Failed to assign role to new user:", roleError);
            }
        }

        return successResponse(user, 'User created and role assigned', 201);
    } catch (error: any) {
        // Enhanced error message parsing
        const message = error.message || '';

        if (message.includes('duplicate') || message.includes('unique')) {
            if (message.toLowerCase().includes('email')) {
                return errorResponse(
                    'DUPLICATE_ENTRY',
                    'This email address is already registered. Please use a different email.',
                    409,
                    { field: 'email' },
                    'email'
                );
            }
        }

        return errorResponse('INTERNAL_ERROR', error.message);
    }
}
