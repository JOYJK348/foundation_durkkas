/**
 * EXAMPLE API - Employees with Soft Delete
 * Route: /api/core/employees
 * 
 * Demonstrates:
 * - GET: Auto-exclude deleted records
 * - DELETE: Soft delete instead of hard delete
 * - RESTORE: Restore soft-deleted records
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { supabase } from '@/lib/supabase';
import { applyTenantFilter, autoAssignCompany } from '@/middleware/tenantFilter';
import { excludeDeleted, softDeleteRecord, restoreRecord } from '@/middleware/softDelete';
import { getUserIdFromToken } from '@/lib/jwt';

/**
 * GET /api/core/employees
 * Returns active employees (auto-excludes deleted)
 */
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        // Check if admin wants to see deleted records
        const url = new URL(req.url);
        const includeDeleted = url.searchParams.get('include_deleted') === 'true';

        // Build query
        let query = supabase
            .from('employees')
            .select(`
                *,
                companies:company_id (id, name, code),
                branches:branch_id (id, name),
                departments:department_id (id, name)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        // Apply tenant filter
        query = await applyTenantFilter(userId, query);

        // Apply soft delete filter
        query = excludeDeleted(query, { includeDeleted });

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(
            data,
            `Employees fetched successfully (${data?.length || 0} records)`
        );

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch employees');
    }
}

/**
 * POST /api/core/employees
 * Create new employee
 */
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (!data.first_name || !data.employee_code) {
            return errorResponse(null, 'first_name and employee_code are required', 400);
        }

        const { data: employee, error } = await supabase
            .from('employees')
            .insert(data)
            .select('*, companies:company_id (id, name)')
            .single();

        if (error) throw new Error(error.message);

        return successResponse(employee, 'Employee created successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to create employee');
    }
}

/**
 * DELETE /api/core/employees/[id]
 * Soft delete employee (marks as deleted, doesn't remove)
 */
export async function DELETE(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        // Get employee ID from URL
        const url = new URL(req.url);
        const employeeId = parseInt(url.pathname.split('/').pop() || '0');

        if (!employeeId) {
            return errorResponse(null, 'Invalid employee ID', 400);
        }

        // Get delete reason from body (optional)
        const body = await req.json().catch(() => ({}));
        const deleteReason = body.reason || 'Deleted by user';

        // Soft delete
        const success = await softDeleteRecord(
            'employees',
            employeeId,
            userId,
            deleteReason
        );

        if (!success) {
            return errorResponse(null, 'Failed to delete employee', 500);
        }

        return successResponse(
            { id: employeeId, deleted: true },
            'Employee deleted successfully'
        );

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to delete employee');
    }
}

/**
 * PUT /api/core/employees/[id]/restore
 * Restore soft-deleted employee
 */
export async function PUT(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        // Check if this is a restore request
        const url = new URL(req.url);
        const isRestore = url.pathname.endsWith('/restore');

        if (!isRestore) {
            return errorResponse(null, 'Invalid endpoint', 400);
        }

        // Get employee ID
        const pathParts = url.pathname.split('/');
        const employeeId = parseInt(pathParts[pathParts.length - 2] || '0');

        if (!employeeId) {
            return errorResponse(null, 'Invalid employee ID', 400);
        }

        // Restore record
        const success = await restoreRecord('employees', employeeId, userId);

        if (!success) {
            return errorResponse(null, 'Failed to restore employee', 500);
        }

        return successResponse(
            { id: employeeId, restored: true },
            'Employee restored successfully'
        );

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to restore employee');
    }
}
