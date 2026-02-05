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
    pending_assignments: any[];
    upcoming_quizzes: any[];
    upcoming_live_classes: any[];
    active_attendance_sessions: any[];
}

export default function StudentDashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/students/dashboard");
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error: any) {
            console.error("Error fetching dashboard:", error);
            toast.error(error.response?.data?.message || "Failed to load dashboard");
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

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No data available</p>
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
                {/* Attendance Alerts - Unified Entry Point */}
                {dashboardData.active_attendance_sessions?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8"
                    >
                        <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-125 transition-transform">
                                <ShieldCheck className="h-32 w-32" />
                            </div>
                            <CardContent className="p-0">
                                <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-2xl shadow-black/20 border border-white/30">
                                            <Camera className="h-10 w-10 text-white animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-400 text-[10px] font-black tracking-widest uppercase mb-3 rounded-full text-blue-900 shadow-sm">
                                                <span className="w-2 h-2 bg-blue-900 rounded-full animate-ping" />
                                                Live Now
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase leading-none">
                                                Attendance Open
                                            </h2>
                                            <p className="text-blue-100/90 text-sm font-bold mt-2 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-white" />
                                                {dashboardData.active_attendance_sessions.length} sessions available for marking
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setIsAttendanceModalOpen(true)}
                                        className="bg-white text-blue-700 hover:bg-gray-100 h-16 px-10 rounded-3xl font-black text-xl shadow-2xl flex items-center gap-3 w-full sm:w-auto shrink-0 group-hover:scale-105 transition-all"
                                    >
                                        <ShieldCheck className="h-6 w-6" />
                                        PUNCH NOW
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Welcome Back, {dashboardData.student.name}!
                    </h1>
                    <p className="text-gray-600">Continue your learning journey • {dashboardData.student.student_code}</p>
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

                {/* Continue Learning */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Continue Learning</h2>
                    {dashboardData.enrolled_courses.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Enrolled</h3>
                                <p className="text-gray-600">Contact your administrator to enroll in courses</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {dashboardData.enrolled_courses.slice(0, 4).map((enrollment: any, index: number) => (
                                <Card key={enrollment.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                        {enrollment.course.thumbnail_url ? (
                                            <img
                                                src={enrollment.course.thumbnail_url}
                                                alt={enrollment.course.course_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="h-20 w-20 text-white/30" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-white font-bold text-lg mb-1">{enrollment.course.course_name}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white/90 text-xs px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">{enrollment.course.course_level}</p>
                                                {enrollment.batch && (
                                                    <p className="text-blue-200 text-xs font-bold">#{enrollment.batch.batch_name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Progress</span>
                                            <span className="text-sm font-bold text-blue-600">{Math.round(enrollment.completion_percentage || 0)}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                                            <div
                                                className="h-full bg-blue-600 rounded-full"
                                                style={{ width: `${enrollment.completion_percentage || 0}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                            <span>{enrollment.lessons_completed || 0} / {enrollment.total_lessons || 0} lessons</span>
                                        </div>
                                        <Link href={`/ems/student/courses/${enrollment.course.id}`}>
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                <Play className="h-4 w-4 mr-2" />
                                                Continue Learning
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
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
                        onSuccess={() => {
                            setIsAttendanceModalOpen(false);
                            fetchDashboardData();
                        }}
                        onClose={() => setIsAttendanceModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
