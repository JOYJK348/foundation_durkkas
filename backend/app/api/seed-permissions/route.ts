import { NextRequest, NextResponse } from 'next/server';
import { app_auth } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const permissions = [
            // HRMS Granular Sub-Menus
            { name: 'hrms.employees', display_name: 'Access Employees', description: 'View employee directory and profiles', permission_scope: 'COMPANY', schema_name: 'hrms', resource: 'employees', action: 'view' },
            { name: 'hrms.attendance', display_name: 'Access Attendance', description: 'View attendance logs and stats', permission_scope: 'COMPANY', schema_name: 'hrms', resource: 'attendance', action: 'view' },
            { name: 'hrms.leaves', display_name: 'Access Leaves', description: 'Manage leave requests', permission_scope: 'COMPANY', schema_name: 'hrms', resource: 'leaves', action: 'view' },
            { name: 'hrms.payroll', display_name: 'Access Payroll', description: 'View salary and payroll info', permission_scope: 'COMPANY', schema_name: 'hrms', resource: 'payroll', action: 'view' },

            // LMS Granular Sub-Menus
            { name: 'lms.courses', display_name: 'Access Courses', description: 'View and manage courses', permission_scope: 'COMPANY', schema_name: 'ems', resource: 'courses', action: 'view' },
            { name: 'lms.live_classes', display_name: 'Live Classes', description: 'Access online classroom tools', permission_scope: 'COMPANY', schema_name: 'ems', resource: 'classes', action: 'view' },
            { name: 'lms.assessments', display_name: 'Assessments', description: 'View quizzes and exams', permission_scope: 'COMPANY', schema_name: 'ems', resource: 'exams', action: 'view' },

            // FINANCE Granular Sub-Menus
            { name: 'finance.invoices', display_name: 'Access Invoices', description: 'View and create invoices', permission_scope: 'COMPANY', schema_name: 'finance', resource: 'invoices', action: 'view' },
            { name: 'finance.payments', display_name: 'Access Payments', description: 'Track incoming/outgoing payments', permission_scope: 'COMPANY', schema_name: 'finance', resource: 'payments', action: 'view' },

            // CRM Granular Sub-Menus
            { name: 'crm.leads', display_name: 'Access Leads', description: 'View potential client leads', permission_scope: 'COMPANY', schema_name: 'crm', resource: 'leads', action: 'view' },
            { name: 'crm.clients', display_name: 'Access Clients', description: 'View active client database', permission_scope: 'COMPANY', schema_name: 'crm', resource: 'clients', action: 'view' }
        ];

        const { data, error } = await app_auth.permissions().upsert(permissions, { onConflict: 'name' }).select();

        if (error) throw error;

        return NextResponse.json({ success: true, count: data.length, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
