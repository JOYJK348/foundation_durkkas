import { ems } from '@/lib/supabase';
import { Course, CourseModule, Lesson } from '@/types/database';

/**
 * Service for Course and Content management
 */
export class CourseService {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. COURSE MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async getAllCourses(companyId: number) {
        const { data, error } = await ems.courses()
            .select('*')
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Course[];
    }

    static async getCourseDetails(id: number) {
        const { data, error } = await ems.courses()
            .select(`
                *,
                course_modules (
                    *,
                    lessons (*)
                )
            `)
            .eq('id', id)
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
