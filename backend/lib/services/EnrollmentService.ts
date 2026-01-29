import { ems } from '@/lib/supabase';
import { StudentEnrollment, LessonProgress } from '@/types/database';

/**
 * Service for Student Enrollment & Progress Tracking
 * Optimized for high-performance operations
 */
export class EnrollmentService {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. ENROLLMENT OPERATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async enrollStudent(enrollmentData: Partial<StudentEnrollment>) {
        // Check if already enrolled
        const { data: existing } = await ems.enrollments()
            .select('id')
            .eq('student_id', enrollmentData.student_id!)
            .eq('course_id', enrollmentData.course_id!)
            .is('deleted_at', null)
            .single();

        if (existing) {
            throw new Error('Student already enrolled in this course');
        }

        // Get course details for lesson count
        const { data: course } = await ems.courses()
            .select('total_lessons')
            .eq('id', enrollmentData.course_id!)
            .single();

        const { data, error } = await ems.enrollments()
            .insert({
                ...enrollmentData,
                total_lessons: course?.total_lessons || 0,
                lessons_completed: 0,
                completion_percentage: 0,
            })
            .select()
            .single();

        if (error) throw error;
        return data as StudentEnrollment;
    }

    static async getStudentEnrollments(studentId: number, companyId: number) {
        const { data, error } = await ems.enrollments()
            .select(`
                *,
                courses:course_id (
                    id,
                    course_name,
                    course_code,
                    thumbnail_url,
                    total_lessons
                ),
                batches:batch_id (
                    id,
                    batch_name,
                    batch_code
                )
            `)
            .eq('student_id', studentId)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .order('enrollment_date', { ascending: false });

        if (error) throw error;
        return data;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. LESSON PROGRESS TRACKING (OPTIMIZED)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async markLessonComplete(
        studentId: number,
        enrollmentId: number,
        lessonId: number,
        courseId: number,
        companyId: number
    ) {
        // Upsert lesson progress
        const { data: progress, error: progressError } = await ems.lessonProgress()
            .upsert({
                company_id: companyId,
                student_id: studentId,
                enrollment_id: enrollmentId,
                lesson_id: lessonId,
                course_id: courseId,
                is_completed: true,
                completion_percentage: 100,
                completed_at: new Date().toISOString(),
            } as any)
            .select()
            .single();

        if (progressError) throw progressError;

        // Update enrollment completion percentage (OPTIMIZED - Single query)
        await this.recalculateEnrollmentProgress(enrollmentId);

        return progress;
    }

    static async recalculateEnrollmentProgress(enrollmentId: number) {
        // Get completed lessons count
        const { count: completedCount } = await ems.lessonProgress()
            .select('*', { count: 'exact', head: true })
            .eq('enrollment_id', enrollmentId)
            .eq('is_completed', true);

        // Get enrollment details
        const { data: enrollment } = await ems.enrollments()
            .select('total_lessons')
            .eq('id', enrollmentId)
            .single();

        if (!enrollment) return;

        const totalLessons = enrollment.total_lessons || 1;
        const completed = completedCount || 0;
        const percentage = Math.round((completed / totalLessons) * 100);

        // Update enrollment
        await ems.enrollments()
            .update({
                lessons_completed: completed,
                completion_percentage: percentage,
                last_accessed_at: new Date().toISOString(),
            } as any)
            .eq('id', enrollmentId);
    }

    static async getLessonProgress(enrollmentId: number) {
        const { data, error } = await ems.lessonProgress()
            .select(`
                *,
                lessons:lesson_id (
                    id,
                    lesson_name,
                    lesson_order,
                    duration_minutes
                )
            `)
            .eq('enrollment_id', enrollmentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}
