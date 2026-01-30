"use client";

import { motion } from "framer-motion";
import { UniversalTopNavbar } from "@/components/dashboard/UniversalTopNavbar";
import { UniversalBottomNav } from "@/components/dashboard/UniversalBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    GraduationCap,
    Users,
    BookOpen,
    UserCheck,
    ClipboardCheck,
    Video,
    FileText,
    BarChart3,
    Settings,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Award,
} from "lucide-react";

export default function EMSAdminDashboard() {
    // Configuration for EMS Admin
    const navbarConfig = {
        logo: {
            icon: GraduationCap,
            text: "EMS Admin",
            href: "/ems/admin/dashboard",
        },
        searchPlaceholder: "Search students, courses, tutors...",
        quickActions: [
            { label: "Dashboard", href: "/ems/admin/dashboard", icon: BarChart3 },
            { label: "Students", href: "/ems/admin/students", icon: Users },
            { label: "Courses", href: "/ems/admin/courses", icon: BookOpen },
            { label: "Tutors", href: "/ems/admin/tutors", icon: UserCheck },
            { label: "Batches", href: "/ems/admin/batches", icon: Calendar },
            { label: "Analytics", href: "/ems/admin/analytics", icon: TrendingUp },
        ],
        notificationHref: "/ems/admin/notifications",
        profileHref: "/ems/admin/profile",
        logoutHref: "/login",
        userName: "EMS Administrator",
        userEmail: "ems.admin@durkkas.com",
        moduleColor: "blue",
    };

    const bottomNavConfig = {
        items: [
            { href: "/ems/admin/students", icon: Users, label: "Students" },
            { href: "/ems/admin/courses", icon: BookOpen, label: "Courses" },
            { href: "/ems/admin/tutors", icon: UserCheck, label: "Tutors" },
            { href: "/ems/admin/batches", icon: Calendar, label: "Batches" },
            { href: "/ems/admin/analytics", icon: BarChart3, label: "Analytics" },
            { href: "/ems/admin/settings", icon: Settings, label: "Settings" },
        ],
        moduleColor: "blue",
    };

    const stats = [
        { label: "Total Students", value: "1,245", change: "+85", icon: Users, color: "blue" },
        { label: "Active Courses", value: "32", change: "+4", icon: BookOpen, color: "green" },
        { label: "Total Tutors", value: "18", change: "+2", icon: UserCheck, color: "purple" },
        { label: "Running Batches", value: "24", change: "+6", icon: Calendar, color: "orange" },
    ];

    const quickActions = [
        { label: "Add Student", href: "/ems/admin/students/new", icon: Users, color: "blue" },
        { label: "Create Course", href: "/ems/admin/courses/new", icon: BookOpen, color: "green" },
        { label: "Assign Tutor", href: "/ems/admin/tutors/assign", icon: UserCheck, color: "purple" },
        { label: "New Batch", href: "/ems/admin/batches/new", icon: Calendar, color: "orange" },
        { label: "Assignments", href: "/ems/admin/assignments", icon: ClipboardCheck, color: "pink" },
        { label: "Live Classes", href: "/ems/admin/live-classes", icon: Video, color: "indigo" },
    ];

    const recentEnrollments = [
        { name: "Rajesh Kumar", course: "Full Stack Development", batch: "2024-A", status: "Active", date: "2 hours ago" },
        { name: "Priya Sharma", course: "Data Science Basics", batch: "2024-B", status: "Active", date: "5 hours ago" },
        { name: "Amit Patel", course: "Mobile App Development", batch: "2024-A", status: "Pending", date: "1 day ago" },
        { name: "Sneha Reddy", course: "Full Stack Development", batch: "2024-C", status: "Active", date: "1 day ago" },
    ];

    const upcomingClasses = [
        { title: "React Advanced Concepts", tutor: "Dr. John Smith", time: "Today, 4:00 PM", students: 45 },
        { title: "Python Data Analysis", tutor: "Dr. Jane Doe", time: "Tomorrow, 10:00 AM", students: 38 },
        { title: "Mobile UI/UX Design", tutor: "Prof. Mike Johnson", time: "Tomorrow, 2:00 PM", students: 32 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <UniversalTopNavbar config={navbarConfig} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                        EMS Dashboard
                    </h1>
                    <p className="text-gray-600">Manage your education system efficiently</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                                            <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                                        </div>
                                        <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            {stat.change}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {quickActions.map((action, index) => (
                            <Link key={index} href={action.href}>
                                <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group">
                                    <CardContent className="p-6 text-center">
                                        <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-${action.color}-100 group-hover:bg-${action.color}-600 flex items-center justify-center transition-colors`}>
                                            <action.icon className={`h-7 w-7 text-${action.color}-600 group-hover:text-white transition-colors`} />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {action.label}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Enrollments */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Recent Enrollments</h2>
                            <Link href="/ems/admin/enrollments">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                    View All
                                    <ArrowUpRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentEnrollments.map((enrollment, index) => (
                                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <Users className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{enrollment.name}</h3>
                                                    <p className="text-sm text-gray-600">{enrollment.course}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Batch: {enrollment.batch} • {enrollment.date}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${enrollment.status === "Active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                                }`}>
                                                {enrollment.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>

                    {/* Upcoming Classes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Upcoming Classes</h2>
                            <Link href="/ems/admin/live-classes">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                    View All
                                    <ArrowUpRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {upcomingClasses.map((classItem, index) => (
                                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                <Video className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{classItem.title}</h3>
                                                <p className="text-sm text-gray-600 mb-1">By {classItem.tutor}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {classItem.time}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {classItem.students} students
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            <UniversalBottomNav config={bottomNavConfig} />
        </div>
    );
}
