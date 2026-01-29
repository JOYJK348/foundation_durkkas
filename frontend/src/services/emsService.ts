import axios from 'axios';
import Cookie from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with interceptor for auth
const emsApi = axios.create({
    baseURL: API_URL,
});

// Add auth token to all requests
emsApi.interceptors.request.use((config) => {
    const token = Cookie.get('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const emsService = {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👤 STUDENT PROFILE & AUTHENTICATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getStudentProfile: async (id: number) => {
        const response = await emsApi.get(`/ems/students/${id}`);
        return response.data;
    },

    getCurrentProfile: async () => {
        const response = await emsApi.get(`/ems/students/me`);
        return response.data;
    },

    getStudentDashboard: async () => {
        const response = await emsApi.get(`/ems/student/dashboard`);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📚 COURSES & CONTENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getCourses: async () => {
        const response = await emsApi.get(`/ems/courses`);
        return response.data;
    },

    getCourseDetails: async (id: number) => {
        const response = await emsApi.get(`/ems/courses/${id}`);
        return response.data;
    },

    createCourse: async (data: any) => {
        const response = await emsApi.post('/ems/courses', data);
        return response.data;
    },

    updateCourse: async (id: number, data: any) => {
        const response = await emsApi.patch(`/ems/courses/${id}`, data);
        return response.data;
    },

    deleteCourse: async (id: number) => {
        const response = await emsApi.delete(`/ems/courses/${id}`);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📖 LESSONS & MODULES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getLessons: async (courseId: number) => {
        const response = await emsApi.get(`/ems/lessons?course_id=${courseId}`);
        return response.data;
    },

    getLessonDetails: async (id: number) => {
        const response = await emsApi.get(`/ems/lessons/${id}`);
        return response.data;
    },

    createLesson: async (data: any) => {
        const response = await emsApi.post('/ems/lessons', data);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 ENROLLMENTS & PROGRESS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getEnrollments: async (studentId: number) => {
        const response = await emsApi.get(`/ems/enrollments?student_id=${studentId}`);
        return response.data;
    },

    enrollStudent: async (data: any) => {
        const response = await emsApi.post('/ems/enrollments', data);
        return response.data;
    },

    getProgress: async (enrollmentId: number) => {
        const response = await emsApi.get(`/ems/progress?enrollment_id=${enrollmentId}`);
        return response.data;
    },

    updateProgress: async (data: any) => {
        const response = await emsApi.post('/ems/progress', data);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 ASSIGNMENTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getAssignments: async (courseId?: number) => {
        const url = courseId ? `/ems/assignments?course_id=${courseId}` : '/ems/assignments';
        const response = await emsApi.get(url);
        return response.data;
    },

    createAssignment: async (data: any) => {
        const response = await emsApi.post('/ems/assignments', data);
        return response.data;
    },

    submitAssignment: async (data: any) => {
        const response = await emsApi.post('/ems/assignments/submit', data);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 QUIZZES & ASSESSMENTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getQuizzes: async (courseId?: number) => {
        const url = courseId ? `/ems/quizzes?course_id=${courseId}` : '/ems/quizzes';
        const response = await emsApi.get(url);
        return response.data;
    },

    getQuizDetails: async (id: number) => {
        const response = await emsApi.get(`/ems/quizzes/${id}`);
        return response.data;
    },

    createQuiz: async (data: any) => {
        const response = await emsApi.post('/ems/quizzes', data);
        return response.data;
    },

    submitQuizAttempt: async (data: any) => {
        const response = await emsApi.post('/ems/quizzes/attempt', data);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎥 LIVE CLASSES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getLiveClasses: async (courseId?: number) => {
        const url = courseId ? `/ems/live-classes?course_id=${courseId}` : '/ems/live-classes';
        const response = await emsApi.get(url);
        return response.data;
    },

    joinLiveClass: async (classId: number) => {
        const response = await emsApi.post(`/ems/live-classes/${classId}/join`);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📅 ATTENDANCE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getAttendance: async (studentId?: number) => {
        const url = studentId ? `/ems/attendance?student_id=${studentId}` : '/ems/attendance';
        const response = await emsApi.get(url);
        return response.data;
    },

    markAttendance: async (data: any) => {
        const response = await emsApi.post('/ems/attendance', data);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👥 BATCHES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getBatches: async () => {
        const response = await emsApi.get('/ems/batches');
        return response.data;
    },

    getBatchDetails: async (id: number) => {
        const response = await emsApi.get(`/ems/batches/${id}`);
        return response.data;
    },

    createBatch: async (data: any) => {
        const response = await emsApi.post('/ems/batches', data);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👨‍🎓 STUDENT MANAGEMENT (Admin)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getAllStudents: async () => {
        const response = await emsApi.get('/ems/students');
        return response.data;
    },

    createStudent: async (data: any) => {
        const response = await emsApi.post('/ems/students', data);
        return response.data;
    },

    updateStudent: async (id: number, data: any) => {
        const response = await emsApi.patch(`/ems/students/${id}`, data);
        return response.data;
    },

    deleteStudent: async (id: number) => {
        const response = await emsApi.delete(`/ems/students/${id}`);
        return response.data;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 ANALYTICS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getAnalytics: async (type?: string) => {
        const url = type ? `/ems/analytics?type=${type}` : '/ems/analytics';
        const response = await emsApi.get(url);
        return response.data;
    },

    getCourseAnalytics: async (courseId: number) => {
        const response = await emsApi.get(`/ems/analytics/course/${courseId}`);
        return response.data;
    },

    getStudentAnalytics: async (studentId: number) => {
        const response = await emsApi.get(`/ems/analytics/student/${studentId}`);
        return response.data;
    },
};
