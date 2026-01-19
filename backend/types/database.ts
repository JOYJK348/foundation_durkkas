/**
 * Database Type Definitions
 * 
 * TypeScript types for database tables
 * These should be generated from your actual database schema
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE SCHEMA TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Company {
    id: number;
    name: string;
    legal_name?: string;
    company_code: string;
    email?: string;
    phone?: string;
    // Platform Admin Fields
    subscription_plan: 'TRIAL' | 'PRO' | 'ENTERPRISE';
    subscription_status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
    subscription_start_date?: string;
    subscription_end_date?: string;
    max_users: number;
    max_branches: number;
    enabled_modules: string[]; 
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Branch {
    id: number;
    company_id: number;
    name: string;
    branch_code: string;
    branch_type: 'HQ' | 'OPERATIONAL' | 'FRANCHISE';
    email?: string;
    phone?: string;
    city_id?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Department {
    id: number;
    company_id: number;
    name: string;
    department_code: string;
    description?: string;
    parent_department_id?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Designation {
    id: number;
    company_id: number;
    title: string;
    designation_code: string;
    description?: string;
    level?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AcademicYear {
    id: number;
    company_id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
}

export interface Country {
    id: number;
    name: string;
    iso_code: string;
    phone_code?: string;
}

export interface State {
    id: number;
    country_id: number;
    name: string;
    state_code?: string;
}

export interface City {
    id: number;
    state_id: number;
    name: string;
}

export interface Location {
    id: number;
    branch_id: number;
    name: string;
    address_line1?: string;
    address_line2?: string;
    city_id?: number;
    pincode?: string;
    is_active: boolean;
}

export interface GlobalSetting {
    id: number;
    setting_key: string;
    setting_value: string;
    description?: string;
    is_system_setting: boolean;
    updated_at: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH SCHEMA TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface User {
    id: number;
    email: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
    is_active: boolean;
    is_verified: boolean;
    is_locked: boolean;
    failed_login_attempts: number;
    last_login_at?: string;
    last_login_ip?: string;
    mfa_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    display_name?: string;
    description?: string;
    role_type: 'SYSTEM' | 'PRODUCT' | 'BRANCH' | 'CUSTOM';
    product?: string;
    level: number;
    is_active: boolean;
    is_system_role: boolean;
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    display_name?: string;
    description?: string;
    schema_name: string;
    resource: string;
    action: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserRole {
    id: number;
    user_id: number;
    role_id: number;
    company_id?: number;
    branch_id?: number;
    valid_from?: string;
    valid_until?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MenuRegistry {
    id: number;
    menu_name: string;
    menu_key: string;
    display_name?: string;
    description?: string;
    parent_menu_id?: number;
    sort_order: number;
    product: string;
    schema_name: string;
    route: string;
    icon?: string;
    is_active: boolean;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: number;
    user_id?: number;
    user_email?: string;
    company_id?: number;
    action: string;
    resource_type?: string;
    resource_id?: number;
    schema_name?: string;
    table_name: string;
    old_values?: any;
    new_values?: any;
    changes?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    user?: {
        email: string;
        first_name: string;
        last_name: string;
    };
}

export interface LoginHistory {
    id: number;
    user_id: number;
    login_at: string;
    ip_address?: string;
    user_agent?: string;
    status: 'SUCCESS' | 'FAILED';
    failure_reason?: string;
}

export interface RolePermission {
    id: number;
    role_id: number;
    permission_id: number;
    created_at: string;
}

export interface MenuPermission {
    id: number;
    menu_id: number;
    permission_id: number;
    created_at: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HRMS SCHEMA TYPES (Employee Master, Payroll, Attendance & Strategic HR)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Employee {
    id: number;
    employee_code: string;
    first_name: string;
    last_name?: string;
    full_name: string;
    date_of_birth?: string;
    gender?: string;
    email?: string;
    phone?: string;
    company_id: number;
    branch_id: number;
    department_id?: number;
    designation_id?: number;
    reporting_to?: number;
    employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
    date_of_joining: string;
    date_of_leaving?: string;
    user_id?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    id: number;
    employee_id: number;
    branch_id: number;
    attendance_date: string;
    check_in_time?: string;
    check_out_time?: string;
    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
    total_hours?: number;
    remarks?: string;
    created_at: string;
    updated_at: string;
}

export interface LeaveType {
    id: number;
    company_id: number;
    name: string;
    code: string;
    max_days_per_year?: number;
    is_active: boolean;
    created_at: string;
}

export interface LeaveRequest {
    id: number;
    employee_id: number;
    leave_type_id: number;
    from_date: string;
    to_date: string;
    total_days: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approved_by?: number;
    created_at: string;
    updated_at: string;
}

export interface PayrollCycle {
    id: number;
    company_id: number;
    cycle_name: string;
    cycle_month: number;
    cycle_year: number;
    status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'PAID';
    created_at: string;
}

export interface Payslip {
    id: number;
    payroll_cycle_id: number;
    employee_id: number;
    net_salary: number;
    payment_status: 'PENDING' | 'PAID';
    created_at: string;
}

export interface JobOpening {
    id: number;
    company_id: number;
    branch_id: number;
    title: string;
    description?: string;
    department_id?: number;
    designation_id?: number;
    employment_type: string;
    vacancies: number;
    status: 'OPEN' | 'CLOSED' | 'ON_HOLD';
    posted_at: string;
    closing_date?: string;
    created_at: string;
    updated_at: string;
}

export interface Candidate {
    id: number;
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
    resume_url?: string;
    skills?: string[];
    experience_years?: number;
    source?: string;
    created_at: string;
    updated_at: string;
}

export interface JobApplication {
    id: number;
    job_opening_id: number;
    candidate_id: number;
    status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'HIRED';
    applied_at: string;
    updated_at: string;
}

export interface Interview {
    id: number;
    application_id: number;
    interviewer_id: number;
    scheduled_at: string;
    duration_minutes: number;
    location?: string;
    feedback?: string;
    rating?: number;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    created_at: string;
}

export interface PerformanceReview {
    id: number;
    employee_id: number;
    reviewer_id: number;
    review_date: string;
    rating: number;
    comments?: string;
    created_at: string;
}

export interface TrainingProgram {
    id: number;
    name: string;
    description?: string;
    trainer_id?: number;
    start_date: string;
    end_date?: string;
    is_active: boolean;
}

export interface TrainingEnrollment {
    id: number;
    program_id: number;
    employee_id: number;
    enrollment_date: string;
    status: 'ENROLLED' | 'COMPLETED' | 'DROPPED';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMS SCHEMA TYPES (Education Management System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Student {
    id: number;
    student_code: string;
    first_name: string;
    last_name?: string;
    full_name: string;
    date_of_birth?: string;
    gender?: string;
    email?: string;
    phone?: string;
    company_id: number;
    branch_id: number;
    academic_year_id?: number;
    enrollment_date: string;
    user_id?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: number;
    company_id: number;
    name: string;
    code: string;
    description?: string;
    course_type: 'ONLINE' | 'OFFLINE' | 'HYBRID';
    duration_hours?: number;
    fee?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CRM SCHEMA TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Lead {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    company_id: number;
    branch_id: number;
    lead_source_id?: number;
    interested_in?: string;
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
    assigned_to?: number;
    created_at: string;
    updated_at: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATABASE TYPE (for Supabase client)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type TableDefinition<T> = {
    Row: T;
    Insert: Partial<T>;
    Update: Partial<T>;
};

export interface Database {
    core: {
        Tables: {
            companies: TableDefinition<Company>;
            branches: TableDefinition<Branch>;
            departments: TableDefinition<Department>;
            designations: TableDefinition<Designation>;
            academic_years: TableDefinition<AcademicYear>;
            countries: TableDefinition<Country>;
            states: TableDefinition<State>;
            cities: TableDefinition<City>;
            locations: TableDefinition<Location>;
            global_settings: TableDefinition<GlobalSetting>;
        };
    };
    app_auth: {
        Tables: {
            users: TableDefinition<User>;
            roles: TableDefinition<Role>;
            permissions: TableDefinition<Permission>;
            user_roles: TableDefinition<UserRole>;
            menu_registry: TableDefinition<MenuRegistry>;
            audit_logs: TableDefinition<AuditLog>;
            login_history: TableDefinition<LoginHistory>;
            role_permissions: TableDefinition<RolePermission>;
            menu_permissions: TableDefinition<MenuPermission>;
        };
    };
    hrms: {
        Tables: {
            employees: TableDefinition<Employee>;
            job_openings: TableDefinition<JobOpening>;
            candidates: TableDefinition<Candidate>;
            job_applications: TableDefinition<JobApplication>;
            interviews: TableDefinition<Interview>;
            attendance: TableDefinition<Attendance>;
            leave_types: TableDefinition<LeaveType>;
            leave_requests: TableDefinition<LeaveRequest>;
            payroll_cycles: TableDefinition<PayrollCycle>;
            payslips: TableDefinition<Payslip>;
            performance_reviews: TableDefinition<PerformanceReview>;
            training_programs: TableDefinition<TrainingProgram>;
            training_enrollments: TableDefinition<TrainingEnrollment>;
        };
    };
    ems: {
        Tables: {
            students: TableDefinition<Student>;
            courses: TableDefinition<Course>;
        };
    };
    finance: {
        Tables: {
            // Add Finance tables here
        };
    };
    crm: {
        Tables: {
            leads: TableDefinition<Lead>;
        };
    };
}
