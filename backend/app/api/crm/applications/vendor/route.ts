import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRoute, getPaginationParams, applyPagination } from '@/lib/apiHelpers';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { vendorApplicationSchema } from '@/lib/validations/crm';
import { getUserIdFromToken } from '@/lib/jwt';
import { autoAssignCompany } from '@/middleware/tenantFilter';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VENDOR APPLICATIONS API
 * Supports Public Submission (POST) and Authenticated Listing (GET)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// GET - List Vendor Applications (Authenticated)
export const GET = apiRoute({
    requireAuth: true,
    requireTenant: true,
    handler: async (req, body, scope) => {
        const params = getPaginationParams(req);

        // Build base query
        let query = supabase
            .schema('crm')
            .from('vendor_applications')
            .select('*', { count: 'exact' })
            .eq('company_id', scope!.companyId)
            .is('deleted_at', null);

        // Apply filters
        const search = req.nextUrl.searchParams.get('search');
        if (search) {
            query = query.or(`vendor_name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Apply pagination
        query = applyPagination(query, params);

        const { data, error, count } = await query;

        if (error) return errorResponse('DATABASE_ERROR', error.message, 500);

        return successResponse(data, 'Vendor applications fetched successfully', 200, {
            total: count || 0,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil((count || 0) / params.limit)
        });
    }
});

// POST - Submit Vendor Application (Public or Authenticated)
export const POST = asyncHandler(async (req: NextRequest) => {
    try {
        let body = await req.json();
        console.log(`[CRM VENDOR] 🚀 Submission received:`, { email: body.email });

        // CRM PROTECTION: If user is logged in, auto-attribute to their company/branch
        try {
            const userId = await getUserIdFromToken(req);
            if (userId) {
                console.log(`[CRM VENDOR] 🔐 Auth user detected: ${userId}`);
                body = await autoAssignCompany(userId, body);
                console.log(`[CRM VENDOR] ✅ Attributed to Company: ${body.company_id}, Branch: ${body.branch_id}`);
            }
        } catch (e: any) {
            console.log(`[CRM VENDOR] 🔓 Public submission or auth error: ${e.message}`);
        }

        // Validate request
        const validatedData = vendorApplicationSchema.safeParse(body);
        if (!validatedData.success) {
            return errorResponse('VALIDATION_ERROR', validatedData.error.errors[0].message, 400);
        }

        // Insert into database
        const { data, error } = await supabase
            .schema('crm')
            .from('vendor_applications')
            .insert([{
                ...validatedData.data,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('CRM Vendor Application Error:', error);
            return errorResponse('DATABASE_ERROR', error.message, 500);
        }

        return successResponse(data, 'Application submitted successfully', 201);
    } catch (err: any) {
        return errorResponse('INTERNAL_SERVER_ERROR', err.message, 500);
    }
});
