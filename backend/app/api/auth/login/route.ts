import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { app_auth, core } from '@/lib/supabase';
import { generateTokenPair } from '@/lib/jwt';
import { cacheUserSession } from '@/lib/redis';
import { getUserRolesDetailed, Role } from '@/lib/menuAccess';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { AuditService } from '@/lib/services/AuditService';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = loginSchema.parse(body);
        const { email, password } = validatedData;

        const ipAddress = AuditService.getIP(req);
        const userAgent = req.headers.get('user-agent') || 'unknown';

        // 🔑 1. Identify User and their Role Level / Company Scope
        const { data: user, error: userError } = await app_auth.users()
            .select(`
                id, email, password_hash, first_name, last_name, is_active, is_locked,
                user_roles (
                    company_id,
                    roles (level)
                )
            `)
            .eq('email', email.toLowerCase())
            .single();

        if (userError) {
            if (userError.code === 'PGRST116') {
                return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
            }
            return errorResponse('DATABASE_ERROR', userError.message, 500);
        }

        const typedUser = user as any;
        if (!typedUser) return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);

        const ur = typedUser.user_roles?.[0];
        const roleLevel = ur?.roles?.level || 0;
        const companyId = ur?.company_id;

        // 🛡️ 2. Infrastructure Check: Is the Company Suspended?
        // Platform Admins (Level 5) bypass this as they are system roots
        if (roleLevel < 5 && companyId) {
            const { data: company, error: compError } = await core.companies()
                .select('is_active, name')
                .eq('id', companyId)
                .single();

            if (!compError && company && !company.is_active) {
                await AuditService.logLogin({
                    userId: typedUser.id,
                    email: typedUser.email,
                    ipAddress,
                    userAgent,
                    status: 'FAILED',
                    failureReason: 'Company suspended'
                });
                return errorResponse('COMPANY_SUSPENDED', `Access Denied: ${company.name} has been suspended.`, 403);
            }
        }

        if (!typedUser.is_active) {
            await AuditService.logLogin({
                userId: typedUser.id,
                email: typedUser.email,
                ipAddress,
                userAgent,
                status: 'FAILED',
                failureReason: 'Account inactive'
            });
            return errorResponse('ACCOUNT_INACTIVE', 'Account inactive', 403);
        }

        if (typedUser.is_locked) {
            await AuditService.logLogin({
                userId: typedUser.id,
                email: typedUser.email,
                ipAddress,
                userAgent,
                status: 'FAILED',
                failureReason: 'Account locked'
            });
            return errorResponse('ACCOUNT_LOCKED', 'Account locked', 403);
        }

        const isPasswordValid = await bcrypt.compare(password, typedUser.password_hash);
        if (!isPasswordValid) {
            await AuditService.logLogin({
                userId: typedUser.id,
                email: typedUser.email,
                ipAddress,
                userAgent,
                status: 'FAILED',
                failureReason: 'Invalid password'
            });
            return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }

        const rolesDetailed = await getUserRolesDetailed(typedUser.id);
        const roleNames = rolesDetailed.map((r: Role) => r.name);
        const { accessToken, refreshToken } = generateTokenPair(typedUser.id, typedUser.email, roleNames);

        const sessionData = {
            userId: typedUser.id,
            email: typedUser.email,
            firstName: typedUser.first_name,
            lastName: typedUser.last_name,
            roles: roleNames,
            loginAt: new Date().toISOString(),
        };

        await cacheUserSession(typedUser.id, sessionData);

        // Security Log: Successful Login
        await AuditService.logLogin({
            userId: typedUser.id,
            email: typedUser.email,
            ipAddress,
            userAgent,
            status: 'SUCCESS'
        });

        await AuditService.logAction({
            userId: typedUser.id,
            userEmail: typedUser.email,
            action: 'LOGIN',
            tableName: 'users',
            schemaName: 'app_auth',
            recordId: typedUser.id.toString(),
            ipAddress,
            userAgent,
            companyId: companyId
        });

        return successResponse({
            user: {
                id: typedUser.id,
                email: typedUser.email,
                firstName: typedUser.first_name,
                lastName: typedUser.last_name,
                roles: rolesDetailed,
            },
            tokens: { accessToken, refreshToken }
        }, 'Login successful');

    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse('VALIDATION_ERROR', 'Validation Error', 400, error.errors);
        }
        return errorResponse('INTERNAL_SERVER_ERROR', 'Internal Server Error', 500);
    }
}
