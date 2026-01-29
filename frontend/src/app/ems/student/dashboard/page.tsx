"use client";

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
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
    const stats = [
        { label: "Courses", value: "3", icon: BookOpen, color: "blue", href: "/ems/student/courses" },
        { label: "Assignments", value: "5", icon: FileText, color: "green", href: "/ems/student/assignments" },
        { label: "Assessments", value: "2", icon: ClipboardCheck, color: "purple", href: "/ems/student/assessments" },
        { label: "Progress", value: "68%", icon: TrendingUp, color: "orange", href: "/ems/student/progress" },
    ];

    const quickActions = [
        { label: "My Courses", icon: BookOpen, href: "/ems/student/courses", color: "blue" },
        { label: "Assignments", icon: FileText, href: "/ems/student/assignments", color: "green" },
        { label: "Assessments", icon: ClipboardCheck, href: "/ems/student/assessments", color: "purple" },
        { label: "Doubts", icon: MessageSquare, href: "/ems/student/doubts", color: "red" },
        { label: "Progress", icon: TrendingUp, href: "/ems/student/progress", color: "orange" },
        { label: "Attendance", icon: Calendar, href: "/ems/student/attendance", color: "pink" },
    ];

    const recentCourses = [
        {
            id: 1,
            title: "Web Development - Full Stack",
            progress: 68,
            nextLesson: "React Hooks - useState",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
        },
        {
            id: 2,
            title: "Data Science Basics",
            progress: 45,
            nextLesson: "Pandas Fundamentals",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        },
    ];

    const upcomingAssignments = [
        { id: 1, title: "React Component Assignment", dueDate: "Dec 22, 2024", status: "pending" },
        { id: 2, title: "API Integration Project", dueDate: "Dec 25, 2024", status: "pending" },
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
                        Welcome Back, Student!
                    </h1>
                    <p className="text-gray-600">Continue your learning journey</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recentCourses.map((course, index) => (
                            <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-white font-bold text-lg mb-1">{course.title}</h3>
                                        <p className="text-white/90 text-sm">{course.nextLesson}</p>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Progress</span>
                                        <span className="text-sm font-bold text-blue-600">{course.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Play className="h-4 w-4 mr-2" />
                                        Continue Learning
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

                {/* Upcoming Assignments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
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
                    <div className="space-y-3">
                        {upcomingAssignments.map((assignment) => (
                            <Card key={assignment.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Due: {assignment.dueDate}
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    );
}
