"use client";

import { motion } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    Users,
    BookOpen,
    Calendar,
    FileText,
    Video,
    Award,
    BarChart3,
    Download,
} from "lucide-react";
import { useState } from "react";

export default function BranchAnalytics() {
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                Analytics & Reports
                            </h1>
                            <p className="text-gray-600">Track performance and insights</p>
                        </div>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Download className="h-4 w-4" />
                            Export Report
                        </Button>
                    </div>
                </motion.div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Students", value: "128", change: "+12%", icon: Users, color: "blue" },
                        { label: "Active Courses", value: "8", change: "+2", icon: BookOpen, color: "green" },
                        { label: "Completion Rate", value: "78%", change: "+5%", icon: Award, color: "purple" },
                        { label: "Avg. Attendance", value: "85%", change: "+3%", icon: Calendar, color: "orange" },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-0 shadow-lg">
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

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Student Enrollment Trend */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Student Enrollment Trend</h3>
                                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                                    <div className="text-center">
                                        <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-2" />
                                        <p className="text-gray-500">Chart visualization</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Course Performance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Course Performance</h3>
                                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                                    <div className="text-center">
                                        <BarChart3 className="h-16 w-16 text-green-400 mx-auto mb-2" />
                                        <p className="text-gray-500">Chart visualization</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Quick Reports */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Reports</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { title: "Student Performance Report", icon: Users, color: "blue", desc: "Detailed student analytics" },
                            { title: "Course Completion Report", icon: BookOpen, color: "green", desc: "Track course progress" },
                            { title: "Attendance Report", icon: Calendar, color: "purple", desc: "Monthly attendance data" },
                            { title: "Assignment Submissions", icon: FileText, color: "orange", desc: "Submission statistics" },
                            { title: "Live Class Analytics", icon: Video, color: "pink", desc: "Session engagement data" },
                            { title: "Assessment Results", icon: Award, color: "red", desc: "Test and quiz results" },
                        ].map((report, index) => (
                            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-xl bg-${report.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <report.icon className={`h-6 w-6 text-${report.color}-600`} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{report.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Download className="h-4 w-4 mr-2" />
                                        Generate
                                    </Button>
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
