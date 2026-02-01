/**
 * Supabase Client Configuration
 * 
 * This file provides a configured Supabase client for database operations.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SCHEMAS } from '@/config/constants';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    }
);

export const supabaseService = supabase;

/**
 * Get data from a specific schema
 * For core schema, we use the table name directly since it's the default schema
 * For other schemas, we need to qualify with schema name
 */
export function fromSchema(schema: string, table: string) {
    // Explicitly set the schema context before targeting the table
    // This prevents standard Supabase clients from prepending default schemas
    return supabase.schema(schema as any).from(table);
}

// Export commonly used schema queries
export const core = {
    companies: () => fromSchema(SCHEMAS.CORE, 'companies'),
    branches: () => fromSchema(SCHEMAS.CORE, 'branches'),
    departments: () => fromSchema(SCHEMAS.CORE, 'departments'),
    designations: () => fromSchema(SCHEMAS.CORE, 'designations'),
    academicYears: () => fromSchema(SCHEMAS.CORE, 'academic_years'),
    countries: () => fromSchema(SCHEMAS.CORE, 'countries'),
    states: () => fromSchema(SCHEMAS.CORE, 'states'),
    cities: () => fromSchema(SCHEMAS.CORE, 'cities'),
    locations: () => fromSchema(SCHEMAS.CORE, 'locations'),
    globalSettings: () => fromSchema(SCHEMAS.CORE, 'global_settings'),
    employees: () => fromSchema(SCHEMAS.CORE, 'employees'),
    subscriptionPlans: () => fromSchema(SCHEMAS.CORE, 'subscription_plans'),
    subscriptionHistory: () => fromSchema(SCHEMAS.CORE, 'subscription_history'),
    platformBranding: () => fromSchema(SCHEMAS.CORE, 'platform_branding'),
    companyBranding: () => fromSchema(SCHEMAS.CORE, 'company_branding'),
    companySecurityWhitelists: () => fromSchema(SCHEMAS.CORE, 'company_security_whitelists'),
};

export const app_auth = {
    users: () => fromSchema(SCHEMAS.AUTH, 'users'),
    roles: () => fromSchema(SCHEMAS.AUTH, 'roles'),
    permissions: () => fromSchema(SCHEMAS.AUTH, 'permissions'),
    userRoles: () => fromSchema(SCHEMAS.AUTH, 'user_roles'),
    rolePermissions: () => fromSchema(SCHEMAS.AUTH, 'role_permissions'),
    menuRegistry: () => fromSchema(SCHEMAS.AUTH, 'menu_registry'),
    menuPermissions: () => fromSchema(SCHEMAS.AUTH, 'menu_permissions'),
    loginHistory: () => fromSchema(SCHEMAS.AUTH, 'login_history'),
    auditLogs: () => fromSchema(SCHEMAS.AUTH, 'audit_logs'),
    trustedDevices: () => fromSchema(SCHEMAS.AUTH, 'trusted_devices'),
    userPermissions: () => fromSchema(SCHEMAS.AUTH, 'user_permissions'),
};

export const hrms = {
    employees: () => fromSchema(SCHEMAS.HRMS, 'employees'),
    attendance: () => fromSchema(SCHEMAS.HRMS, 'attendance'),
    leaveRequests: () => fromSchema(SCHEMAS.HRMS, 'leave_requests'),
    payroll: () => fromSchema(SCHEMAS.HRMS, 'payroll_cycles'),
    jobOpenings: () => fromSchema(SCHEMAS.HRMS, 'job_openings'),
    candidates: () => fromSchema(SCHEMAS.HRMS, 'candidates'),
    performanceReviews: () => fromSchema(SCHEMAS.HRMS, 'performance_reviews'),
    training: () => fromSchema(SCHEMAS.HRMS, 'training_programs'),
    jobApplications: () => fromSchema(SCHEMAS.HRMS, 'job_applications'),
    interviews: () => fromSchema(SCHEMAS.HRMS, 'interviews'),
};

export const ems = {
    students: () => fromSchema(SCHEMAS.EMS, 'students'),
    studentGuardians: () => fromSchema(SCHEMAS.EMS, 'student_guardians'),
    courses: () => fromSchema(SCHEMAS.EMS, 'courses'),
    courseModules: () => fromSchema(SCHEMAS.EMS, 'course_modules'),
    lessons: () => fromSchema(SCHEMAS.EMS, 'lessons'),
    courseMaterials: () => fromSchema(SCHEMAS.EMS, 'course_materials'),
    batches: () => fromSchema(SCHEMAS.EMS, 'batches'),
    enrollments: () => fromSchema(SCHEMAS.EMS, 'student_enrollments'),
    lessonProgress: () => fromSchema(SCHEMAS.EMS, 'lesson_progress'),
    quizzes: () => fromSchema(SCHEMAS.EMS, 'quizzes'),
    assignments: () => fromSchema(SCHEMAS.EMS, 'assignments'),
    attendanceSessions: () => fromSchema(SCHEMAS.EMS, 'attendance_sessions'),
    attendanceRecords: () => fromSchema(SCHEMAS.EMS, 'attendance_records'),
    liveClasses: () => fromSchema(SCHEMAS.EMS, 'live_classes'),
    quizAttempts: () => fromSchema(SCHEMAS.EMS, 'quiz_attempts'),
    quizQuestions: () => fromSchema(SCHEMAS.EMS, 'quiz_questions'),
    quizOptions: () => fromSchema(SCHEMAS.EMS, 'quiz_options'),
    supabase: supabase
};

export const finance = {
    invoices: () => fromSchema(SCHEMAS.FINANCE, 'invoices'),
    payments: () => fromSchema(SCHEMAS.FINANCE, 'payments'),
};

export const crm = {
    leads: () => fromSchema(SCHEMAS.CRM, 'leads'),
};
