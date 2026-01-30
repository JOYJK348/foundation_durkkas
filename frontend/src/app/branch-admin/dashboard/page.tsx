"use client";

import { motion } from "framer-motion";
import { UniversalTopNavbar } from "@/components/dashboard/UniversalTopNavbar";
import { UniversalBottomNav } from "@/components/dashboard/UniversalBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Building2,
    Users,
    GraduationCap,
    DollarSign,
    Phone,
    BarChart3,
    Settings,
    TrendingUp,
    UserCheck,
    FileText,
    Calendar,
    Bell,
    ArrowUpRight,
} from "lucide-react";

export default function BranchAdminDashboard() {
    // Configuration for Branch Admin
    const navbarConfig = {
        logo: {
            icon: Building2,
            text: "Branch Admin",
            href: "/branch-admin/dashboard",
        },
        searchPlaceholder: "Search employees, students, invoices...",
        quickActions: [
            { label: "Dashboard", href: "/branch-admin/dashboard", icon: BarChart3 },
            { label: "HRMS", href: "/branch-admin/hrms", icon: Users },
            { label: "EMS", href: "/branch-admin/ems", icon: GraduationCap },
            { label: "Finance", href: "/branch-admin/finance", icon: DollarSign },
            { label: "CRM", href: "/branch-admin/crm", icon: Phone },
            { label: "Reports", href: "/branch-admin/reports", icon: FileText },
        ],
        notificationHref: "/branch-admin/notifications",
        profileHref: "/branch-admin/profile",
        logoutHref: "/login",
        userName: "Branch Manager",
        userEmail: "manager@durkkas.com",
        moduleColor: "orange",
    };

    const bottomNavConfig = {
        items: [
            { href: "/branch-admin/hrms", icon: Users, label: "HRMS" },
            { href: "/branch-admin/ems", icon: GraduationCap, label: "EMS" },
            { href: "/branch-admin/finance", icon: DollarSign, label: "Finance" },
            { href: "/branch-admin/crm", icon: Phone, label: "CRM" },
            { href: "/branch-admin/reports", icon: BarChart3, label: "Reports" },
            { href: "/branch-admin/settings", icon: Settings, label: "Settings" },
        ],
        moduleColor: "orange",
    };

    const stats = [
        { label: "Total Employees", value: "45", change: "+5", icon: Users, color: "blue" },
        { label: "Active Students", value: "128", change: "+12", icon: GraduationCap, color: "green" },
        { label: "Monthly Revenue", value: "₹8.5L", change: "+18%", icon: DollarSign, color: "purple" },
        { label: "Active Leads", value: "34", change: "+8", icon: Phone, color: "orange" },
    ];

    const quickActions = [
        { label: "Employee Management", href: "/branch-admin/hrms/employees", icon: Users, color: "blue" },
        { label: "Student Admissions", href: "/branch-admin/ems/students", icon: GraduationCap, color: "green" },
        { label: "Invoice Management", href: "/branch-admin/finance/invoices", icon: FileText, color: "purple" },
        { label: "Lead Follow-ups", href: "/branch-admin/crm/leads", icon: Phone, color: "orange" },
        { label: "Attendance", href: "/branch-admin/hrms/attendance", icon: UserCheck, color: "pink" },
        { label: "Reports", href: "/branch-admin/reports", icon: BarChart3, color: "indigo" },
    ];

    const recentActivity = [
        { title: "New Employee Onboarded", subtitle: "John Doe - Software Developer", time: "2 hours ago", icon: Users },
        { title: "Student Admission", subtitle: "5 new students enrolled in Full Stack course", time: "3 hours ago", icon: GraduationCap },
        { title: "Invoice Generated", subtitle: "Invoice #INV-2024-001 for ₹45,000", time: "5 hours ago", icon: DollarSign },
        { title: "New Lead Assigned", subtitle: "Career Guidance inquiry from Mumbai", time: "1 day ago", icon: Phone },
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
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                        Branch Dashboard
                    </h1>
                    <p className="text-gray-600">Welcome back! Here's what's happening in your branch.</p>
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
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {action.label}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                        <Link href="/branch-admin/activity">
                            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                                View All
                                <ArrowUpRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <activity.icon className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                                            <p className="text-sm text-gray-600 mb-1">{activity.subtitle}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            </div>

            <UniversalBottomNav config={bottomNavConfig} />
        </div>
    );
}
