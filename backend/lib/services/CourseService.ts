import { ems } from '@/lib/supabase';
import { Course, CourseModule, Lesson } from '@/types/database';

/**
 * Service for Course and Content management
 */
export class CourseService {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. COURSE MANAGEMENT (Multi-Tenant with Role-Based Filtering)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Get all courses with intelligent role-based filtering
     * @param companyId - Company ID for tenant isolation
     * @param emsProfile - Optional EMS profile for role-based filtering
     */
    static async getAllCourses(
        companyId: number,
        emsProfile?: { profileType: 'tutor' | 'student' | 'manager' | null; profileId: number | null }
    ) {
        let query = ems.courses()
            .select('*')
            .eq('company_id', companyId)
            .is('deleted_at', null);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ROLE-BASED FILTERING
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        if (emsProfile?.profileType === 'tutor' && emsProfile.profileId) {
            // TUTORS: Only see courses they are assigned to teach
            // 1. Get IDs from new course_tutors junction table
            const { data: junctionMappings } = await ems.courseTutors()
                .select('course_id')
                .eq('tutor_id', emsProfile.profileId)
                .is('deleted_at', null);

            // 2. Get IDs from legacy tutor_id column in courses table
            const { data: legacyCourses } = await ems.courses()
                .select('id')
                .eq('tutor_id', emsProfile.profileId)
                .eq('company_id', companyId)
                .is('deleted_at', null);

            const assignedCourseIds = [
                ...(junctionMappings?.map((m: any) => m.course_id) || []),
                ...(legacyCourses?.map((c: any) => c.id) || [])
            ];

            const uniqueCourseIds = [...new Set(assignedCourseIds)];

            if (uniqueCourseIds.length > 0) {
                query = query.in('id', uniqueCourseIds);
            } else {
                // Tutor is not assigned to any courses
                return [];
            }
        } else if (emsProfile?.profileType === 'student' && emsProfile.profileId) {
            // STUDENTS: Only see courses they are enrolled in
            // First, get enrolled course IDs
            const { data: enrollments } = await ems.enrollments()
                .select('course_id')
                .eq('student_id', emsProfile.profileId)
                .eq('is_active', true);

            const enrolledCourseIds = enrollments?.map((e: any) => e.course_id) || [];

            if (enrolledCourseIds.length > 0) {
                query = query.in('id', enrolledCourseIds);
            } else {
                // Student has no enrollments - return empty array
                return [];
            }
        }
        // MANAGERS & ADMINS: See all company courses (no additional filter)

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data as Course[];
    }

    /**
     * Get course details with nested modules and lessons
     * @param id - Course ID
     * @param emsProfile - Optional profile for filtering visibility
     */
    static async getCourseDetails(
        id: number,
        companyId: number,
        emsProfile?: { profileType: 'tutor' | 'student' | 'manager' | null; profileId: number | null }
    ) {
        let query = ems.courses()
            .select(`
                *,
                course_modules (
                    *,
                    lessons (
                        *,
                        course_materials (*)
                    )
                )
            `)
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null);

        // 🕵️ Visibility Filtering for Tutors
        if (emsProfile?.profileType === 'tutor' && emsProfile.profileId) {
            const { data: junctionMapping } = await ems.courseTutors()
                .select('id')
                .eq('course_id', id)
                .eq('tutor_id', emsProfile.profileId)
                .is('deleted_at', null)
                .single();

            const { data: legacyCourse } = await ems.courses()
                .select('id')
                .eq('id', id)
                .eq('tutor_id', emsProfile.profileId)
                .single();

            if (!junctionMapping && !legacyCourse) {
                throw new Error('You are not assigned to this course');
            }
        }

        const { data, error } = await query.single();

        if (error) throw error;

        // 🕵️ Check Enrollment for Students
        let isEnrolled = false;
        if (emsProfile?.profileType === 'student' && emsProfile.profileId) {
            const { data: enrollment } = await ems.enrollments()
                .select('id')
                .eq('student_id', emsProfile.profileId)
                .eq('course_id', id)
                .eq('enrollment_status', 'ACTIVE')
                .maybeSingle();

            isEnrolled = !!enrollment;
        }

        // 🛡️ Post-process: Professional Numbering and Visibility Filtering
        if (data && data.course_modules) {
            // Sort modules first
            data.course_modules.sort((a: any, b: any) => (a.module_order || 0) - (b.module_order || 0));

            data.course_modules = data.course_modules.map((module: any, mIdx: number) => {
                const moduleNumber = mIdx + 1;

                // Sort lessons within module
                const lessons = (module.lessons || []).sort((a: any, b: any) => (a.lesson_order || 0) - (b.lesson_order || 0));

                return {
                    ...module,
                    module_number: moduleNumber,
                    lessons: lessons.map((lesson: any, lIdx: number) => {
                        const lessonNumber = `${moduleNumber}.${lIdx + 1}`;
                        const isLocked = emsProfile?.profileType === 'student' && lesson.visibility === 'ENROLLED' && !isEnrolled;

                        return {
                            ...lesson,
                            lesson_number: lessonNumber,
                            is_locked: isLocked,
                            video_url: isLocked ? null : lesson.video_url,
                            content_body: isLocked ? null : lesson.content_body
                        };
                    })
                };
            });

            // If student, filter out PRIVATE modules/lessons
            if (emsProfile?.profileType === 'student') {
                data.course_modules = data.course_modules
                    .filter((m: any) => m.visibility !== 'PRIVATE' && m.is_active)
                    .map((m: any) => ({
                        ...m,
                        lessons: m.lessons.filter((l: any) => l.visibility !== 'PRIVATE' && l.is_active)
                    }));
            }
        }

        return data;
    }

    static async updateContentVisibility(
        type: 'module' | 'lesson' | 'material',
        id: number,
        visibility: 'PUBLIC' | 'PRIVATE' | 'ENROLLED',
        companyId: number
    ) {
        let table;
        if (type === 'module') table = ems.courseModules();
        else if (type === 'lesson') table = ems.lessons();
        else table = ems.courseMaterials();

        const { data, error } = await table
            .update({
                visibility,
                is_published: visibility !== 'PRIVATE'
            } as any)
            .eq('id', id)
            .eq('company_id', companyId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async createCourse(courseData: Partial<Course>) {
        const { data, error } = await ems.courses()
            .insert(courseData)
            .select()
            .single();

        if (error) throw error;
        return data as Course;
    }

    static async getCourseById(
        id: number,
        companyId: number,
        emsProfile?: { profileType: 'tutor' | 'student' | 'manager' | null; profileId: number | null }
    ) {
        // 🕵️ Visibility Filtering for Tutors
        if (emsProfile?.profileType === 'tutor' && emsProfile.profileId) {
            const { data: junctionMapping } = await ems.courseTutors()
                .select('id')
                .eq('course_id', id)
                .eq('tutor_id', emsProfile.profileId)
                .is('deleted_at', null)
                .single();

            const { data: legacyCourse } = await ems.courses()
                .select('id')
                .eq('id', id)
                .eq('tutor_id', emsProfile.profileId)
                .single();

            if (!junctionMapping && !legacyCourse) {
                return null; // Equivalent to course not found for this tutor
            }
        }

        const { data, error } = await ems.courses()
            .select('*')
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .single();

        if (error) throw error;
        return data as Course;
    }

    static async updateCourse(id: number, companyId: number, courseData: Partial<Course>) {
        const { data, error } = await ems.courses()
            .update(courseData)
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return data as Course;
    }

    static async deleteCourse(id: number, companyId: number, deletedBy: number, reason?: string) {
        const { data, error } = await ems.courses()
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: deletedBy,
                delete_reason: reason || 'Removed by admin',
                is_active: false
            } as any)
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async softDeleteCourse(id: number, deletedBy: number, reason?: string) {
        const { data, error } = await ems.courses()
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: deletedBy,
                delete_reason: reason,
                is_active: false
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. MODULE & LESSON MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async createModule(moduleData: Partial<CourseModule>) {
        const { data, error } = await ems.courseModules()
            .insert(moduleData)
            .select()
            .single();

        if (error) throw error;
        return data as CourseModule;
    }

    static async createLesson(lessonData: Partial<Lesson>) {
        const { data, error } = await ems.lessons()
            .insert(lessonData)
            .select()
            .single();

        if (error) throw error;
        return data as Lesson;
    }

    static async updateLesson(id: number, lessonData: Partial<Lesson>) {
        const { data, error } = await ems.lessons()
            .update(lessonData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Lesson;
    }

    static async createMaterial(materialData: any) {
        const { data, error } = await ems.courseMaterials()
            .insert({
                ...materialData,
                is_active: true,
                is_published: materialData.is_published ?? false
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getMaterialsByMenu(menuId: number, companyId: number) {
        const { data, error } = await ems.courseMaterials()
            .select('*')
            .eq('menu_id', menuId)
            .eq('company_id', companyId)
            .eq('is_active', true)
            .eq('is_published', true);

        if (error) throw error;
        return data;
    }

    static async getGlobalMaterials(companyId: number) {
        const { data, error } = await ems.courseMaterials()
            .select('*')
            .eq('company_id', companyId)
            .is('course_id', null)
            .eq('is_active', true)
            .eq('is_published', true);

        if (error) throw error;
        return data;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. STUDENT ENROLLMENT LOGIC
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async getBatchesByCourse(courseId: number) {
        const { data, error } = await ems.batches()
            .select('*')
            .eq('course_id', courseId)
            .eq('is_active', true);

        if (error) throw error;
        return data;
    }
}
