"use client";

import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import Link from "next/link";
import {
    GraduationCap,
    Users,
    BookOpen,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    Video,
    UserCheck,
    ClipboardCheck,
    Loader2,
} from "lucide-react";
import api from "@/lib/api";

export default function EMSAdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeCourses: 0,
        runningBatches: 0,
        totalTutors: 0,
    });
    const [recentStudents, setRecentStudents] = useState<any[]>([]);
    const [activeCourses, setActiveCourses] = useState<any[]>([]);

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
                totalTutors: 0, // TODO: Add tutors endpoint
            });

            // Get recent students (last 5)
            setRecentStudents(students.slice(0, 5));

            // Get active courses (last 3)
            setActiveCourses(courses.filter((c: any) => c.status === 'PUBLISHED').slice(0, 3));

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { label: "Add Student", href: "/ems/admin/students", icon: Users, color: "blue" },
        { label: "Manage Courses", href: "/ems/admin/courses", icon: BookOpen, color: "green" },
        { label: "View Batches", href: "/ems/admin/batches", icon: Calendar, color: "orange" },
        { label: "Assignments", href: "/ems/admin/assignments", icon: ClipboardCheck, color: "pink" },
        { label: "Live Classes", href: "/ems/admin/live-classes", icon: Video, color: "indigo" },
        { label: "Tutors", href: "/ems/admin/tutors", icon: UserCheck, color: "purple" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    EMS Dashboard
                </h1>
                <p className="text-gray-600">Manage your education system efficiently</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Students", value: stats.totalStudents, change: "+12%", icon: Users, color: "blue" },
                    { label: "Active Courses", value: stats.activeCourses, change: "+8%", icon: BookOpen, color: "green" },
                    { label: "Running Batches", value: stats.runningBatches, change: "+15%", icon: Calendar, color: "orange" },
                    { label: "Total Tutors", value: stats.totalTutors, change: "+5%", icon: UserCheck, color: "purple" },
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
                    >
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
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickActions.map((action, index) => (
                        <Link key={index} href={action.href}>
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group text-center">
                                <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-${action.color}-100 group-hover:bg-${action.color}-600 flex items-center justify-center transition-colors`}>
                                    <action.icon className={`h-7 w-7 text-${action.color}-600 group-hover:text-white transition-colors`} />
                                </div>
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {action.label}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Students */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Students</h2>
                        <Link href="/ems/admin/students">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentStudents.length > 0 ? (
                            recentStudents.map((student, index) => (
                                <div key={index} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {student.first_name} {student.last_name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{student.email}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Code: {student.student_code} • {student.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No students found</p>
                        )}
                    </div>
                </motion.div>

                {/* Active Courses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Active Courses</h2>
                        <Link href="/ems/admin/courses">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {activeCourses.length > 0 ? (
                            activeCourses.map((course, index) => (
                                <div key={index} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">{course.course_name}</h3>
                                            <p className="text-sm text-gray-600 mb-1">{course.course_category} • {course.course_level}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>{course.duration_hours} hours</span>
                                                <span>•</span>
                                                <span>{course.total_lessons} lessons</span>
                                                <span>•</span>
                                                <span>₹{course.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No active courses found</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
