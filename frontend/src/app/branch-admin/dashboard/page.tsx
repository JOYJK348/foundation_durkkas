"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Building2,
    Briefcase,
    TrendingUp,
    Settings,
    LogOut,
    GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BranchAdminDashboard() {
    const router = useRouter();

    const stats = [
        { label: "Total Employees", value: "0", icon: Users, color: "blue" },
        { label: "Departments", value: "0", icon: Building2, color: "green" },
        { label: "Active Projects", value: "0", icon: Briefcase, color: "purple" },
        { label: "Performance", value: "N/A", icon: TrendingUp, color: "orange" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                🏢 Branch Admin Dashboard
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Manage your branch operations
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/login")}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Welcome Back, Branch Admin!
                    </h2>
                    <p className="text-slate-600">
                        Here's an overview of your branch performance
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                                            <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                                        </div>
                                        <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                                            <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                        </div>
                                    </div>
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
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* LMS / Academic Management */}
                        <Link href="/ems/academic-manager/dashboard">
                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                            <GraduationCap className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">LMS</p>
                                            <p className="text-sm text-slate-600">Academic Management</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/branch-admin/analytics">
                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">View Analytics</p>
                                            <p className="text-sm text-slate-600">Branch performance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/branch-admin/reports">
                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                            <Briefcase className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Reports</p>
                                            <p className="text-sm text-slate-600">Generate reports</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/branch-admin/notifications">
                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                            <Settings className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Notifications</p>
                                            <p className="text-sm text-slate-600">View updates</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </motion.div>

                {/* Info Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-blue-900 mb-2">
                                🏢 Branch Management Hub
                            </h3>
                            <p className="text-blue-700">
                                Welcome to your branch administration dashboard. Access module-specific features through the navigation menu based on your permissions and enabled modules (HRMS, EMS, Finance, CRM).
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
