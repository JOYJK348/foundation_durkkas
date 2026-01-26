/**
 * Application Constants
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRODUCTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PRODUCTS = {
    ERP: 'ERP',
    EMS: 'EMS', // Education Management System (Students, Courses)
    HRMS: 'HRMS', // Human Resource Management System (Employees, Attendance, Payroll)
    CRM: 'CRM',
    FINANCE: 'FINANCE',
    BACKOFFICE: 'BACKOFFICE',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORS & FRONTEND CONFIG (FOR SEPARATE REPOS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FRONTEND_URLS = {
    ERP: process.env.NEXT_PUBLIC_ERP_URL || 'http://localhost:3001',
    EMS: process.env.NEXT_PUBLIC_EMS_URL || 'http://localhost:3002',
    HRMS: process.env.NEXT_PUBLIC_HRMS_URL || 'http://localhost:3003',
    BACKOFFICE: process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3004',
} as const;

export const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'https://foundation-durkkas.vercel.app',
    'https://foundation-durkkas-8fj4.vercel.app',
    FRONTEND_URLS.ERP,
    FRONTEND_URLS.EMS,
    FRONTEND_URLS.HRMS,
    FRONTEND_URLS.BACKOFFICE,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SCHEMAS = {
    CORE: 'core',
    AUTH: 'app_auth',
    EMS: 'ems', // Education Management System
    HRMS: 'hrms', // Human Resource Management System
    CRM: 'crm',
    FINANCE: 'finance',
    BACKOFFICE: 'backoffice',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SYSTEM_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    SYSTEM_ADMIN: 'SYSTEM_ADMIN',
    ERP_ADMIN: 'ERP_ADMIN',
    EMS_ADMIN: 'EMS_ADMIN', // Education
    HRMS_ADMIN: 'HRMS_ADMIN', // HR, Attendance, Payroll
    CRM_ADMIN: 'CRM_ADMIN',
    FINANCE_ADMIN: 'FINANCE_ADMIN',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR CODES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ERROR_CODES = {
    // Authentication
    AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',

    // Authorization
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    MENU_ACCESS_DENIED: 'MENU_ACCESS_DENIED',

    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',

    // Database
    DATABASE_ERROR: 'DATABASE_ERROR',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    NOT_FOUND: 'NOT_FOUND',

    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

    // Generic
    METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGINATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMPLOYMENT TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const EMPLOYMENT_TYPES = {
    FULL_TIME: 'FULL_TIME',
    PART_TIME: 'PART_TIME',
    CONTRACT: 'CONTRACT',
    INTERN: 'INTERN',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const COURSE_TYPES = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    HYBRID: 'HYBRID',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEAD STATUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LEAD_STATUS = {
    NEW: 'NEW',
    CONTACTED: 'CONTACTED',
    QUALIFIED: 'QUALIFIED',
    CONVERTED: 'CONVERTED',
    LOST: 'LOST',
} as const;
