"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Users,
    GraduationCap,
    Calendar,
    Plus,
    TrendingUp,
    ArrowRight,
    Building2,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import Cookies from "js-cookie";

interface DashboardStats {
    totalCourses: number;
    publishedCourses: number;
    totalBatches: number;
    totalStudents: number;
    totalTutors: number;
    totalEnrollments: number;
    activeStudents: number;
    completionRate: number;
}

export default function AcademicManagerDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState("");

    useEffect(() => {
        fetchDashboardStats();
        // Get company name from cookies or storage
        const storedCompanyName = Cookies.get('company_name') || 'Your Institution';
        setCompanyName(storedCompanyName);
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/ems/dashboard/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = stats ? [
        {
            label: "Public Courses",
            value: stats.publishedCourses.toString(),
            icon: BookOpen,
            color: "purple",
            href: "/ems/academic-manager/courses",
            bgColor: "bg-purple-100",
            textColor: "text-purple-600"
        },
        {
            label: "Total Batches",
            value: stats.totalBatches.toString(),
            icon: Calendar,
            color: "blue",
            href: "/ems/academic-manager/batches",
            bgColor: "bg-blue-100",
            textColor: "text-blue-600"
        },
        {
            label: "Total Students",
            value: stats.totalStudents.toString(),
            icon: Users,
            color: "green",
            href: "/ems/academic-manager/students",
            bgColor: "bg-green-100",
            textColor: "text-green-600"
        },
        {
            label: "Total Tutors",
            value: stats.totalTutors.toString(),
            icon: GraduationCap,
            color: "orange",
            href: "/ems/academic-manager/tutors",
            bgColor: "bg-orange-100",
            textColor: "text-orange-600"
        },
    ] : [];

    const quickActions = [
        { label: "Create Course", icon: BookOpen, href: "/ems/academic-manager/courses", color: "purple" },
        { label: "Create Batch", icon: Calendar, href: "/ems/academic-manager/batches", color: "blue" },
        { label: "Assign Tutor", icon: GraduationCap, href: "/ems/academic-manager/tutors", color: "green" },
        { label: "Enroll Student", icon: Users, href: "/ems/academic-manager/students", color: "orange" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Company Context Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 mb-6 rounded-lg shadow-sm"
                >
                    <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-purple-600 mr-3" />
                        <div>
                            <p className="text-sm font-semibold text-purple-900">
                                {companyName} - Learning Management System
                            </p>
                            <p className="text-xs text-purple-700">
                                Company-wide academic management dashboard
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Welcome Back, Academic Manager!
                    </h1>
                    <p className="text-gray-600">Manage your institution's academic ecosystem</p>
                </motion.div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-3 text-gray-600">Loading dashboard statistics...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {statCards.map((stat, index) => (
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
                                                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

                {/* Recent Activity & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Management */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                            <Link href="/ems/academic-manager/courses">
                                <Button variant="ghost" size="sm">
                                    View All
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-8 text-center">
                                <BookOpen className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2 font-medium">
                                    {stats?.totalCourses || 0} Active Courses
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Manage your academic curriculum
                                </p>
                                <Link href="/ems/academic-manager/courses">
                                    <Button className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create New Course
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Analytics Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                            <Link href="/ems/academic-manager/analytics">
                                <Button variant="ghost" size="sm">
                                    View Details
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-blue-900">
                                            {stats?.activeStudents || 0}
                                        </p>
                                        <p className="text-xs text-blue-700">Active Students</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-green-900">
                                            {stats?.totalEnrollments || 0}
                                        </p>
                                        <p className="text-xs text-green-700">Total Enrollments</p>
                                    </div>
                                </div>
                                <Link href="/ems/academic-manager/analytics" className="block mt-4">
                                    <Button variant="outline" className="w-full">
                                        View Full Analytics
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <AcademicManagerBottomNav />
        </div>
    );
}
