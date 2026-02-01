"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Video,
    FileText,
    Users,
    TrendingUp,
    BookOpen,
    Calendar,
    Award,
    Clock,
    ArrowRight,
    Play,
    CheckCircle2,
    BookText,
    Layers,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function TutorDashboard() {
    const [stats, setStats] = useState({
        upcomingClasses: 0,
        pendingGrading: 0,
        totalCourses: 0,
        resourceLibrary: 0
    });
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
    const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashRes, materialsRes] = await Promise.all([
                api.get("/ems/tutor/dashboard"),
                api.get("/ems/materials")
            ]);

            if (dashRes.data.success) {
                const data = dashRes.data.data;
                setUpcomingClasses(data.upcoming_classes || []);
                setAssignedCourses(data.courses || []);
                setStats({
                    upcomingClasses: data.upcoming_classes?.length || 0,
                    pendingGrading: data.pending_grading_count || 0,
                    totalCourses: data.total_courses || 0,
                    resourceLibrary: materialsRes.data.data?.length || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "My Courses", value: stats.totalCourses.toString(), icon: BookOpen, color: "blue", href: "/ems/tutor/courses" },
        { label: "Pending Grading", value: stats.pendingGrading.toString(), icon: FileText, color: "green", href: "/ems/tutor/grading" },
        { label: "Live Classes", value: stats.upcomingClasses.toString(), icon: Video, color: "purple", href: "/ems/tutor/live-classes" },
        { label: "Resource Library", value: stats.resourceLibrary.toString(), icon: Layers, color: "orange", href: "/ems/tutor/materials" },
    ];

    const quickActions = [
        { label: "Live Classes", icon: Video, href: "/ems/tutor/live-classes", color: "blue" },
        { label: "Assignments", icon: FileText, href: "/ems/tutor/assignments", color: "green" },
        { label: "Quizzes", icon: BookOpen, href: "/ems/tutor/quizzes", color: "purple" },
        { label: "Students", icon: Users, href: "/ems/tutor/students", color: "red" },
        { label: "Attendance", icon: Calendar, href: "/ems/tutor/attendance", color: "orange" },
        { label: "Analytics", icon: TrendingUp, href: "/ems/tutor/analytics", color: "pink" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Welcome Back, Tutor!
                    </h1>
                    <p className="text-gray-600">Here's what's happening in your courses today.</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={stat.href}>
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white group h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <stat.icon className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Courses & Modules */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Assigned Courses & Modules Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Assigned Courses & Modules</h2>
                                <Link href="/ems/tutor/courses">
                                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                                        View All Courses
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loading ? (
                                    Array(2).fill(0).map((_, i) => (
                                        <Card key={i} className="border-0 shadow-md animate-pulse">
                                            <CardContent className="h-32 p-6"></CardContent>
                                        </Card>
                                    ))
                                ) : assignedCourses.length === 0 ? (
                                    <Card className="border-0 shadow-md col-span-2">
                                        <CardContent className="p-12 text-center text-gray-500">
                                            <BookText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            No courses currently assigned to you.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    assignedCourses.map((course) => (
                                        <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-all border-l-4 border-l-blue-600">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                                                            {course.course_code}
                                                        </span>
                                                        <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{course.course_name}</h3>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {course.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                            <Layers className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Modules</p>
                                                            <p className="text-sm font-bold">{course.modules_count || 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                            <BookText className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Lessons</p>
                                                            <p className="text-sm font-bold">{course.total_lessons || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link href={`/ems/tutor/courses/${course.id}`} className="mt-4 block">
                                                    <Button variant="outline" className="w-full h-9 text-xs">Manage Course Content</Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                            </div>
                            <div className="space-y-3">
                                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">Class Completed</h3>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        2 hours ago
                                                    </p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                View
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Schedule & Quick Actions */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Upcoming Classes */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Live Schedule</h2>
                                <Link href="/ems/tutor/live-classes">
                                    <Button variant="ghost" size="sm" className="text-blue-600">Full View</Button>
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {upcomingClasses.length === 0 ? (
                                    <Card className="border-0 shadow-md">
                                        <CardContent className="p-8 text-center text-gray-500 italic">
                                            No classes scheduled today.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    upcomingClasses.slice(0, 3).map((cls) => (
                                        <Card key={cls.id} className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden group">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                                                            <span className="text-xs font-bold text-blue-600 uppercase tabular-nums">
                                                                {cls.start_time}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-bold text-gray-900 line-clamp-1">{cls.class_title}</h3>
                                                        <p className="text-xs text-gray-500 mt-1">{cls.courses?.course_name}</p>
                                                    </div>
                                                    <Link href={`/ems/tutor/live-classes/${cls.id}`}>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-blue-50 text-blue-600">
                                                            <Play className="h-4 w-4 fill-current" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Quick Tools</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action, index) => (
                                    <Link key={index} href={action.href}>
                                        <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                            <CardContent className="p-3 text-center">
                                                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <action.icon className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <p className="text-[11px] font-bold text-gray-700 uppercase">{action.label}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <TutorBottomNav />
        </div>
    );
}
