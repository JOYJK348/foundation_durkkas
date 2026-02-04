import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { app_auth, core } from '@/lib/supabase';
import { generateTokenPair } from '@/lib/jwt';
import { cacheUserSession, enforceMaxConcurrency } from '@/lib/redis';
import { getUserRolesDetailed, Role } from '@/lib/menuAccess';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { AuditService } from '@/lib/services/AuditService';
import { GlobalSettings } from '@/lib/settings';

const loginSchema = z.object({
    email: z.string().min(3, 'Username/Email is too short'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
    let SecurityService: any;
    try {
        const body = await req.json();
        const validatedData = loginSchema.parse(body);
        const { email: identifier, password } = validatedData;

        const ipAddress = AuditService.getIP(req);
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const fingerprint = req.headers.get('x-device-fingerprint') || undefined;
        SecurityService = require('@/lib/services/SecurityService').SecurityService;

        // 🛡️ [PHASE 1] IDENTITY RESOLUTION (Hybrid: Email or Student Code)
        let targetEmail = identifier.toLowerCase();

        // If it doesn't look like an email, it might be a Student Code
        if (!targetEmail.includes('@')) {
            console.log(`🔍 [AUTH] Attempting Student Code resolution for: ${targetEmail}`);
            const { ems } = require('@/lib/supabase');
            const { data: student } = await ems.students()
                .select('email')
                .eq('student_code', targetEmail.toUpperCase()) // Student codes are usually uppercase
                .single();

            if (student?.email) {
                targetEmail = student.email.toLowerCase();
                console.log(`✅ [AUTH] Resolved Student Code to email: ${targetEmail}`);
            }
        }

        // ⚡ STAGE 1: HYPER-PARALLEL DISPATCH (NO WATERFALL)
        // We fetch EVERYTHING we can in a single parallel burst
        const [userResolution, sessionTimeoutHrs, baseMaxConcurrent] = await Promise.all([
            app_auth.users()
                .select(`
                    id, email, password_hash, first_name, last_name, is_active, is_locked, mfa_enabled,
                    user_roles (
                        company_id,
                        branch_id,
                        roles (level, name, display_name)
                    )
                `)
                .eq('email', targetEmail)
                .single(),
            GlobalSettings.getSessionTimeoutHrs(),
            GlobalSettings.getFreshMaxConcurrentSessions()
        ]);

        if (userResolution.error) {
            console.error('❌ [LOGIN] User Resolution Error:', userResolution.error);
            // If it's not a "not found" error, it's a real database error
            if (userResolution.error.code !== 'PGRST116') {
                return errorResponse('DATABASE_ERROR', 'A system error occurred during login. Please try again.', 500);
            }
            return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }

        const user = userResolution.data;
        if (!user) {
            return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }

        const typedUser = user as any;
        const ur = typedUser.user_roles?.[0];
        const roleLevel = ur?.roles?.level || 0;
        const companyId = ur?.company_id;

        // 🛡️ STAGE 2: PARALLEL VALIDATION & POLICY CHECK
        const [
            isPasswordValid,
            companyResolution,
            ipCheck,
            deviceCheck,
            is2FAMandatory
        ] = await Promise.all([
            bcrypt.compare(password, typedUser.password_hash),
            (roleLevel < 5 && companyId)
                ? core.companies().select('is_active, name').eq('id', companyId).single()
                : Promise.resolve({ data: { is_active: true, name: 'System' }, error: null }),
            SecurityService.validateIPRestriction({ ipAddress, companyId, roleLevel }),
            SecurityService.validateDeviceTrust({ userId: typedUser.id, fingerprint, userAgent }),
            SecurityService.is2FAMandatory({ userId: typedUser.id, roleLevel, mfaEnabled: typedUser.mfa_enabled })
        ]);

        const { data: company } = companyResolution as any;

        // 🚨 SECURITY GATEKEEPING
        if (!isPasswordValid) {
            AuditService.logLogin({ userId: typedUser.id, email: typedUser.email, ipAddress, userAgent, status: 'FAILED', failureReason: 'Invalid password' });
            return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }

        if (company && !company.is_active) {
            AuditService.logLogin({ userId: typedUser.id, email: typedUser.email, ipAddress, userAgent, status: 'FAILED', failureReason: 'Company suspended' });
            return errorResponse('COMPANY_SUSPENDED', `Access Denied: ${company.name} has been suspended.`, 403);
        }

        if (!typedUser.is_active || typedUser.is_locked) {
            const reason = typedUser.is_locked ? 'Account locked' : 'Account inactive';
            AuditService.logLogin({ userId: typedUser.id, email: typedUser.email, ipAddress, userAgent, status: 'FAILED', failureReason: reason });
            return errorResponse(typedUser.is_locked ? 'ACCOUNT_LOCKED' : 'ACCOUNT_INACTIVE', reason, 403);
        }

        if (!ipCheck.allowed) {
            AuditService.logLogin({ userId: typedUser.id, email: typedUser.email, ipAddress, userAgent, status: 'FAILED', failureReason: ipCheck.reason });
            return errorResponse('UNAUTHORIZED_IP', ipCheck.reason!, 403);
        }

        if (is2FAMandatory) {
            return successResponse({ mfaRequired: true, email: typedUser.email, userId: typedUser.id }, 'MFA verification required');
        }

        // 🚀 STAGE 3: LIGHT-SPEED COMMIT
        const sessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

        // Transform roles into the expected format
        const rolesDetailed = typedUser.user_roles.map((row: any) => ({
            name: row.roles.name,
            display_name: row.roles.display_name,
            level: row.roles.level,
            company_id: row.company_id,
            branch_id: row.branch_id
        })).sort((a: any, b: any) => b.level - a.level);

        const roleNames = rolesDetailed.map((r: any) => r.name);

        // 🛡️ CRITICAL: Await session registration COMPLETION before returning response
        // This prevents race conditions where the middleware on the redirect page 
        // checks Redis before the session is fully cached.
        await Promise.all([
            enforceMaxConcurrency(typedUser.id, sessionId, Number(baseMaxConcurrent)),
            cacheUserSession(typedUser.id, {
                userId: typedUser.id,
                email: typedUser.email,
                firstName: typedUser.first_name,
                lastName: typedUser.last_name,
                roles: roleNames,
                sessionId,
                loginAt: new Date().toISOString(),
            }, sessionTimeoutHrs * 3600),
        ]);

        // Non-critical background tasks (Fire-and-Forget)
        Promise.all([
            AuditService.logLogin({ userId: typedUser.id, email: typedUser.email, ipAddress, userAgent, status: 'SUCCESS' }),
            AuditService.logAction({
                userId: typedUser.id,
                userEmail: typedUser.email,
                action: 'LOGIN',
                tableName: 'users',
                schemaName: 'app_auth',
                recordId: typedUser.id.toString(),
                ipAddress,
                userAgent,
                companyId: companyId
            })
        ]).catch(err => console.error('📉 [BG_LOG_ERROR]', err));

        const { accessToken, refreshToken } = generateTokenPair(
            typedUser.id,
            typedUser.email,
            roleNames,
            `${sessionTimeoutHrs}h`,
            sessionId
        );

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
