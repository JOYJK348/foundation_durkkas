"use client";

import { motion } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    FileText,
    ClipboardCheck,
    Users,
    TrendingUp,
    Calendar,
    Video,
    Clock,
    ArrowRight,
    Play,
    GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function BranchDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeCourses: 0,
        runningBatches: 0,
        totalAssignments: 0,
    });
    const [recentCourses, setRecentCourses] = useState<any[]>([]);
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch students
            const studentsRes = await api.get('/ems/students');
            const students = studentsRes.data?.data || [];

            // Fetch courses
            const coursesRes = await api.get('/ems/courses');
            const courses = coursesRes.data?.data || [];

            // Fetch batches
            const batchesRes = await api.get('/ems/batches');
            const batches = batchesRes.data?.data || [];

            setStats({
                totalStudents: students.length,
                activeCourses: courses.filter((c: any) => c.status === 'PUBLISHED').length,
                runningBatches: batches.filter((b: any) => b.status === 'ACTIVE').length,
                totalAssignments: 12, // Mock data
            });

            // Get active courses (last 2)
            setRecentCourses(courses.filter((c: any) => c.status === 'PUBLISHED').slice(0, 2));

            // Mock upcoming classes
            setUpcomingClasses([
                { id: 1, title: "React Advanced Patterns", time: "Today, 2:00 PM", course: "Full Stack Development" },
                { id: 2, title: "Data Visualization with Python", time: "Tomorrow, 10:00 AM", course: "Data Science" },
            ]);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsData = [
        { label: "Students", value: stats.totalStudents, icon: Users, color: "blue", href: "/branch/students" },
        { label: "Courses", value: stats.activeCourses, icon: BookOpen, color: "green", href: "/branch/courses" },
        { label: "Batches", value: stats.runningBatches, icon: Calendar, color: "purple", href: "/branch/batches" },
        { label: "Assignments", value: stats.totalAssignments, icon: FileText, color: "orange", href: "/branch/assignments" },
    ];

    const quickActions = [
        { label: "My Courses", icon: BookOpen, href: "/branch/courses", color: "blue" },
        { label: "Students", icon: GraduationCap, href: "/branch/students", color: "green" },
        { label: "Batches", icon: Calendar, href: "/branch/batches", color: "purple" },
        { label: "Assignments", icon: FileText, href: "/branch/assignments", color: "red" },
        { label: "Live Classes", icon: Video, href: "/branch/live-classes", color: "orange" },
        { label: "Analytics", icon: TrendingUp, href: "/branch/analytics", color: "pink" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

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
                    <p className="text-gray-600">Manage your courses and students</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statsData.map((stat, index) => (
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

                {/* Continue Teaching */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Courses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recentCourses.map((course, index) => (
                            <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-white font-bold text-lg mb-1">{course.course_name}</h3>
                                        <p className="text-white/90 text-sm">{course.course_category} • {course.course_level}</p>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-600">Total Lessons</span>
                                        <span className="text-sm font-bold text-blue-600">{course.total_lessons}</span>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Play className="h-4 w-4 mr-2" />
                                        Manage Course
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
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

                {/* Upcoming Classes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Classes</h2>
                        <Link href="/branch/live-classes">
                            <Button variant="ghost" size="sm">
                                View All
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {upcomingClasses.map((classItem) => (
                            <Card key={classItem.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <Video className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{classItem.title}</h3>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {classItem.time}
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            Join
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            </div>

            <TutorBottomNav />
        </div>
    );
}
