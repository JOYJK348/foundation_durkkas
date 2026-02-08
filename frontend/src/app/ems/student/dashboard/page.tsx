"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    FileText,
    ClipboardCheck,
    MessageSquare,
    TrendingUp,
    Calendar,
    Award,
    Clock,
    ArrowRight,
    Play,
    Loader2,
    Video,
    Folder,
    Camera,
    ShieldCheck,
    MapPin,
    AlertCircle,
    Zap,
    Bookmark,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";

const AttendanceVerification = dynamic(
    () => import("@/components/ems/attendance/AttendanceVerification").then(mod => mod.AttendanceVerification),
    { ssr: false }
);

interface DashboardData {
    student: {
        id: number;
        name: string;
        email: string;
        student_code: string;
    };
    stats: {
        total_courses: number;
        active_assignments: number;
        pending_quizzes: number;
        average_progress: number;
        upcoming_classes: number;
    };
    enrolled_courses: any[];
    available_courses: any[];
    pending_assignments: any[];
    upcoming_quizzes: any[];
    upcoming_live_classes: any[];
    active_attendance_sessions: any[];
    recent_materials: any[];
}

export default function StudentDashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleAttendanceClick = () => {
        const pending = dashboardData?.active_attendance_sessions?.filter((s: any) => s.recommended_action !== 'COMPLETED') || [];
        if (pending.length > 0) {
            setIsAttendanceModalOpen(true);
        } else if (dashboardData?.active_attendance_sessions?.length && dashboardData.active_attendance_sessions.length > 0) {
            toast.info("Currently no session available. You have completed all attendance for your active sessions.");
        } else {
            toast.info("No active attendance sessions found at this time. Please check with your tutor during class.");
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/ems/students/dashboard?_t=${Date.now()}`);
            if (response.data.success) {
                setDashboardData(response.data.data);
            } else {
                setError(response.data.message || 'Failed to load dashboard data');
            }
        } catch (error: any) {
            console.error("❌ [Student Dashboard] Error:", error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load dashboard';
            setError(errorMsg);

            if (error.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData || error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
                    <p className="text-gray-600 mb-6">
                        {error || "No data available. Please try again or contact support if the issue persists."}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={fetchDashboardData} className="bg-blue-600 hover:bg-blue-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                            Retry
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/ems/student/login'}>
                            Login Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        { label: "Courses", value: dashboardData.stats.total_courses, icon: BookOpen, color: "blue", href: "/ems/student/courses" },
        { label: "Assignments", value: dashboardData.stats.active_assignments, icon: FileText, color: "green", href: "/ems/student/assignments" },
        { label: "Quizzes", value: dashboardData.stats.pending_quizzes, icon: ClipboardCheck, color: "purple", href: "/ems/student/assessments" },
        { label: "Progress", value: `${Math.round(dashboardData.stats.average_progress)}%`, icon: TrendingUp, color: "orange", href: "/ems/student/progress" },
    ];

    const quickActions = [
        { label: "My Courses", icon: BookOpen, href: "/ems/student/courses", color: "blue" },
        { label: "My Materials", icon: Folder, href: "/ems/student/materials", color: "indigo" },
        { label: "Assignments", icon: FileText, href: "/ems/student/assignments", color: "green" },
        { label: "Assessments", icon: ClipboardCheck, href: "/ems/student/assessments", color: "purple" },
        { label: "Doubts", icon: MessageSquare, href: "/ems/student/doubts", color: "red" },
        { label: "Progress", icon: TrendingUp, href: "/ems/student/progress", color: "orange" },
        { label: "Attendance", icon: Calendar, href: "/ems/student/attendance", color: "pink" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            Welcome Back, {dashboardData.student.name}!
                        </h1>
                        <p className="text-gray-600">Continue your learning journey • {dashboardData.student.student_code}</p>
                    </div>

                    {/* Attendance Entry Point */}
                    <Button
                        onClick={handleAttendanceClick}
                        className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center gap-3 transition-all active:scale-95 shrink-0 group"
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <Camera className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-black uppercase tracking-widest leading-none mb-0.5">Attendance</div>
                            <div className="text-[10px] text-blue-100 font-bold leading-none">
                                {dashboardData.active_attendance_sessions?.some((s: any) => s.recommended_action === 'PUNCH_OUT')
                                    ? "Punch Exit"
                                    : dashboardData.active_attendance_sessions?.some((s: any) => s.recommended_action === 'PUNCH_IN')
                                        ? "Punch Entry"
                                        : dashboardData.active_attendance_sessions?.some((s: any) => s.recommended_action === 'COMPLETED')
                                            ? "Checked In"
                                            : "Check Sessions"}
                            </div>
                        </div>
                    </Button>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={stat.href}>
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Continue Learning - REFINED DYNAMIC SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-8 bg-blue-600 rounded-full" />
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Continue Learning</h2>
                    </div>

                    {dashboardData.enrolled_courses.length === 0 ? (
                        <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden border-2 border-dashed border-gray-200">
                            <CardContent className="p-16 text-center">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="h-10 w-10 text-blue-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Kickstart Your Journey!</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-8">You haven't enrolled in any courses yet. Discover something new today.</p>
                                <Button className="rounded-2xl px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                    Browse Catalog
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {dashboardData.enrolled_courses.map((enrollment: any, index: number) => (
                                <Card key={enrollment.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group bg-white rounded-[2rem]">
                                    <div className="relative h-56 overflow-hidden">
                                        {enrollment.course.thumbnail_url ? (
                                            <img
                                                src={enrollment.course.thumbnail_url}
                                                alt={enrollment.course.course_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center">
                                                <Zap className="h-24 w-24 text-white/20 animate-pulse" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent"></div>

                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md text-white border border-white/30">
                                                {enrollment.course.course_level}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-6 left-6 right-6">
                                            <h3 className="text-white font-black text-2xl mb-1 line-clamp-1 group-hover:text-blue-200 transition-colors">
                                                {enrollment.course.course_name}
                                            </h3>
                                            {enrollment.batch && (
                                                <div className="flex items-center gap-2 text-blue-200/80 font-bold text-xs uppercase tracking-widest">
                                                    <Sparkles className="h-3 w-3" />
                                                    #{enrollment.batch.batch_name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                                                <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Progress</span>
                                            </div>
                                            <span className="text-xl font-black text-blue-600">{Math.round(enrollment.completion_percentage || 0)}%</span>
                                        </div>

                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6 border border-gray-50">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${enrollment.completion_percentage || 0}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                                {enrollment.lessons_completed || 0} / {enrollment.total_lessons || 0} MODULES COMPLETED
                                            </div>
                                            <Link href={`/ems/student/courses/${enrollment.course.id}`} className="shrink-0">
                                                <Button className="rounded-2xl px-6 bg-gray-900 hover:bg-blue-600 text-white font-black uppercase text-xs tracking-widest transition-all h-12">
                                                    Resume <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Explore New Courses - MARKETPLACE DYNAMIC SECTION */}
                {dashboardData.available_courses.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-12"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-8 bg-purple-600 rounded-full" />
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Explore New Skills</h2>
                            </div>
                            <Link href="/ems/student/courses/browse">
                                <Button variant="ghost" className="rounded-full font-black text-xs uppercase tracking-widest text-purple-600 hover:bg-purple-50">
                                    Explore Store <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {dashboardData.available_courses.map((course: any, index: number) => (
                                <Card key={course.id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group bg-white rounded-3xl border border-gray-100/50">
                                    <div className="relative h-44 overflow-hidden bg-purple-50">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.course_name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-purple-100">
                                                <Sparkles className="h-10 w-10 text-purple-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-2 py-1 rounded bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-tighter text-purple-600 shadow-sm">
                                                {course.course_level}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-4 right-4">
                                            <button className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-md">
                                                <Bookmark className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="font-black text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors uppercase tracking-tight">
                                            {course.course_name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-6 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                                            {course.course_description || "Master these professional skills with expert-led industry training sessions."}
                                        </p>
                                        <Link href={`/ems/student/courses/${course.id}`}>
                                            <Button variant="outline" className="w-full rounded-2xl border-2 border-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white font-black text-xs uppercase tracking-widest transition-all h-12">
                                                View Course
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {quickActions.map((action, index) => (
                            <Link key={index} href={action.href}>
                                <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
                                    <CardContent className="p-4 text-center">
                                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-${action.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{action.label}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Upcoming Assignments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Assignments</h2>
                        <Link href="/ems/student/assignments">
                            <Button variant="ghost" size="sm">
                                View All
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                    {dashboardData.pending_assignments.length === 0 ? (
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-8 text-center">
                                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-600">No pending assignments</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {dashboardData.pending_assignments.slice(0, 5).map((assignment: any) => (
                                <Card key={assignment.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{assignment.assignment_title}</h3>
                                                    <p className="text-sm text-gray-600">{assignment.course.course_name}</p>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href={`/ems/student/assignments/${assignment.id}`}>
                                                <Button size="sm" variant="outline">
                                                    {assignment.status === 'SUBMITTED' ? 'View' : 'Submit'}
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Recent Materials - MATERIAL BASED NAVIGATION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Study Materials</h2>
                        <Link href="/ems/student/materials">
                            <Button variant="ghost" size="sm">
                                View Library
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                    {(!dashboardData.recent_materials || dashboardData.recent_materials.length === 0) ? (
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                                <Folder className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No materials shared yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dashboardData.recent_materials.map((mat: any, idx: number) => (
                                <Card key={mat.id} className="border-0 shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white rounded-2xl">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                                                <FileText className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate pr-4">{mat.material_name}</h3>
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">{mat.course?.course_name}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-black uppercase">{mat.material_type}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{new Date(mat.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(mat.file_url, '_blank')}
                                                className="rounded-full hover:bg-blue-50 text-blue-600 shrink-0"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <div className="h-1 w-0 bg-blue-600 group-hover:w-full transition-all duration-500" />
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Live Classes */}
                {dashboardData.upcoming_live_classes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Upcoming Live Classes</h2>
                        <div className="space-y-3">
                            {dashboardData.upcoming_live_classes.map((liveClass: any) => (
                                <Card key={liveClass.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                    <Video className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{liveClass.class_title}</h3>
                                                    <p className="text-sm text-gray-600">{liveClass.course.course_name}</p>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(liveClass.scheduled_date).toLocaleDateString()} at {liveClass.start_time}
                                                    </p>
                                                </div>
                                            </div>
                                            {liveClass.meeting_link && (
                                                <a href={liveClass.meeting_link} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                                        Join Class
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <BottomNav />

            {/* Attendance Verification Modal */}
            <AnimatePresence>
                {isAttendanceModalOpen && (
                    <AttendanceVerification
                        sessions={dashboardData.active_attendance_sessions}
                        onSuccess={(session) => {
                            setIsAttendanceModalOpen(false);
                            fetchDashboardData();

                            // Check for redirect
                            if (session && (session.class_mode === 'ONLINE' || session.class_mode === 'HYBRID')) {
                                if (session.live_class?.meeting_link) {
                                    window.open(session.live_class.meeting_link, '_blank');
                                    toast.success("Redirecting to live class...");
                                } else {
                                    toast.info("Class link not available yet.");
                                }
                            }
                        }}
                        onClose={() => setIsAttendanceModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
