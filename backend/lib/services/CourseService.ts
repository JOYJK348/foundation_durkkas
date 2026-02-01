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
            query = query.eq('tutor_id', emsProfile.profileId);
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
            .eq('id', id);

        // 🕵️ Visibility Filtering for Students
        if (emsProfile?.profileType === 'student') {
            // Note: PostGrest nested filtering is tricky. 
            // We fetch and then filter in JS for reliability in complex nested structures,
            // OR we use the !is_published.is(null) trick if supported.
            // For now, let's fetch and filter to ensure 100% accuracy.
        }

        const { data, error } = await query.single();

        if (error) throw error;

        // 🛡️ Transform/Filter data if student (Deep Filtering)
        if (emsProfile?.profileType === 'student' && data) {
            data.course_modules = data.course_modules
                ?.filter((m: any) => m.is_published && m.is_active)
                ?.map((m: any) => ({
                    ...m,
                    lessons: m.lessons
                        ?.filter((l: any) => l.is_published && l.is_active)
                        ?.map((l: any) => ({
                            ...l,
                            course_materials: l.course_materials?.filter((mat: any) => mat.is_published && mat.is_active)
                        }))
                }))
                ?.sort((a: any, b: any) => (a.module_order || 0) - (b.module_order || 0));
        }

        return data;
    }

    /**
     * Toggle visibility (publish/unpublish) for any content type
     */
    static async updateContentVisibility(
        type: 'module' | 'lesson' | 'material',
        id: number,
        isPublished: boolean,
        companyId: number
    ) {
        let table;
        if (type === 'module') table = ems.courseModules();
        else if (type === 'lesson') table = ems.lessons();
        else table = ems.courseMaterials();

        const { data, error } = await table
            .update({ is_published: isPublished } as any)
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

    static async updateCourse(id: number, courseData: Partial<Course>) {
        const { data, error } = await ems.courses()
            .update(courseData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Course;
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
