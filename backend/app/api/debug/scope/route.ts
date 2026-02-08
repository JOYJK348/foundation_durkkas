
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { cookies, headers } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return successResponse({
                status: 'Unauthenticated',
                headers: {
                    companyId: headers().get('x-company-id'),
                    branchId: headers().get('x-branch-id')
                },
                cookies: {
                    companyId: cookies().get('x-company-id')?.value,
                    branchId: cookies().get('x-branch-id')?.value
                }
            }, 'User not logged in');
        }

        const scope = await getUserTenantScope(userId);

        return successResponse({
            userId,
            scope,
            requestContext: {
                headerCompanyId: headers().get('x-company-id'),
                cookieCompanyId: cookies().get('x-company-id')?.value,
                headerBranchId: headers().get('x-branch-id'),
                cookieBranchId: cookies().get('x-branch-id')?.value
            }
        }, 'Scope resolved');

    } catch (error: any) {
        return errorResponse(null, error.message);
    }
}
