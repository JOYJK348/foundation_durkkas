import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import bcrypt from 'bcryptjs';

export interface Tutor {
    id: number;
    company_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_active: boolean;
    user_id?: number;
    employee_code: string;
    specialization?: string;
}

export class TutorService {
    static async getAllTutors(companyId: number) {
        const { core, ems } = require('@/lib/supabase');

        // 1. Fetch employees for the company
        const { data: employees, error: empError } = await core.employees()
            .select('*')
            .eq('company_id', companyId)
            .is('deleted_at', null);

        if (empError) throw empError;
        if (!employees || employees.length === 0) return [];

        // 2. Fetch course IDs from both sources
        const tutorIds = employees.map((e: any) => e.id);

        // Legacy Column
        const { data: legacyCourses } = await ems.courses()
            .select('tutor_id, id')
            .in('tutor_id', tutorIds)
            .eq('company_id', companyId)
            .is('deleted_at', null);

        // New Junction Table
        const { data: junctionMappings } = await ems.courseTutors()
            .select('tutor_id, course_id')
            .in('tutor_id', tutorIds)
            .is('deleted_at', null);

        // 3. Merge and Count Unique Courses
        const tutorsWithCount = employees.map((t: any) => {
            const courseIds = new Set([
                ...(legacyCourses?.filter((c: any) => c.tutor_id === t.id).map((c: any) => c.id) || []),
                ...(junctionMappings?.filter((m: any) => m.tutor_id === t.id).map((m: any) => m.course_id) || [])
            ]);

            return {
                ...t,
                courses_assigned: courseIds.size
            };
        });

        return tutorsWithCount;
    }

    /**
     * Create a new tutor with User account
     */
    static async createTutor(tutorData: any) {
        if (!tutorData.first_name) throw new Error('First name is required');
        if (!tutorData.email) throw new Error('Email is required');
        if (!tutorData.password) throw new Error('Password is required');

        const { core, app_auth } = require('@/lib/supabase');

        // 🛡️ Pre-emptive check for Required References (Avoid NULLs in core.employees)
        // Find or Use Default Department: Academic (ID fallback)
        const { data: dept } = await core.departments()
            .select('id')
            .eq('company_id', tutorData.company_id)
            .ilike('name', '%Academic%')
            .maybeSingle();

        // Find or Use Default Designation: Tutor (ID fallback)
        const { data: desig } = await core.designations()
            .select('id')
            .eq('company_id', tutorData.company_id)
            .ilike('title', '%Tutor%')
            .maybeSingle();

        // 1. Check if user already exists
        const { data: existingUser } = await app_auth.users()
            .select('id')
            .eq('email', tutorData.email.toLowerCase())
            .maybeSingle();

        let userId: number;

        if (existingUser) {
            userId = existingUser.id;
            // Optionally update password if provided and user exists
            if (tutorData.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(tutorData.password, salt);
                await app_auth.users().update({
                    password_hash: hashedPassword,
                    updated_at: new Date().toISOString()
                }).eq('id', userId);
            }
        } else {
            // 2. Create User Account
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tutorData.password, salt);

            const { data: newUser, error: userError } = await app_auth.users()
                .insert({
                    email: tutorData.email.toLowerCase(),
                    password_hash: hashedPassword,
                    first_name: tutorData.first_name,
                    last_name: tutorData.last_name,
                    display_name: `${tutorData.first_name} ${tutorData.last_name}`,
                    is_active: true,
                    is_verified: true
                })
                .select('id')
                .single();

            if (userError) {
                console.error('❌ [TutorService] Error creating auth user:', userError);
                throw new Error(`Auth Account Error: ${userError.message}`);
            }
            userId = newUser.id;
        }

        // 3. Assign/Ensure TUTOR Role exists for this company
        const { data: roleData } = await app_auth.roles()
            .select('id')
            .eq('name', 'TUTOR')
            .single();

        if (roleData) {
            // Use upsert to ensure role exists for this user in this company
            await app_auth.userRoles().upsert({
                user_id: userId,
                role_id: roleData.id,
                company_id: tutorData.company_id,
                branch_id: tutorData.branch_id || null,
                is_active: true
            }, {
                onConflict: 'user_id,role_id,company_id,branch_id'
            });
        }

        // 4. Create Employee Record (Professional Record)
        const employeeCode = tutorData.employee_code || `TTR-${Math.floor(1000 + Math.random() * 9000)}`;

        const insertData: any = {
            company_id: tutorData.company_id,
            branch_id: tutorData.branch_id || null,
            user_id: userId,
            employee_code: employeeCode,
            first_name: tutorData.first_name,
            last_name: tutorData.last_name,
            middle_name: tutorData.middle_name || null,
            email: tutorData.email.toLowerCase(),
            phone: tutorData.phone,
            gender: tutorData.gender || 'Other',
            date_of_birth: tutorData.date_of_birth || null,
            date_of_joining: new Date().toISOString().split('T')[0],
            employment_type: tutorData.employment_type || 'FULL_TIME',
            department_id: dept?.id || null,
            designation_id: desig?.id || null,
            is_active: true,
            reporting_manager_id: tutorData.reporting_manager_id || null
        };

        const { data: employee, error: empError } = await core.employees()
            .insert(insertData)
            .select()
            .single();

        if (empError) {
            console.error('❌ [TutorService] Error creating employee:', empError);
            throw new Error(`Database Error: ${empError.message}`);
        }

        return employee as Tutor;
    }

    /**
     * Get a single tutor by ID
     */
    static async getTutorById(tutorId: number, companyId: number) {
        const { core } = require('@/lib/supabase');
        const { data, error } = await core.employees()
            .select('*')
            .eq('id', tutorId)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .single();

        if (error) throw error;
        return data as Tutor;
    }

    /**
     * Update tutor information
     */
    static async updateTutor(tutorId: number, updates: any, companyId: number) {
        const { core } = require('@/lib/supabase');

        // Ensure we're only updating the tutor for the correct company
        const { data, error } = await core.employees()
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', tutorId)
            .eq('company_id', companyId)
            .select()
            .single();

        if (error) throw error;
        return data as Tutor;
    }
}
