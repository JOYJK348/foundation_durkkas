"use client";

import { motion } from "framer-motion";
import { UniversalTopNavbar } from "@/components/dashboard/UniversalTopNavbar";
import { UniversalBottomNav } from "@/components/dashboard/UniversalBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
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
    ArrowUpRight,
    Loader2,
} from "lucide-react";

// Dashboard configuration based on user role and permissions
interface DashboardConfig {
    role: string;
    permissions: string[];
    modules: string[];
}

export default function BranchDashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
    const [stats, setStats] = useState<any[]>([]);
    const [quickActions, setQuickActions] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        // TODO: Fetch user role and permissions from API
        // For now, using mock data
        fetchDashboardConfig();
    }, []);

    const fetchDashboardConfig = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/branch/dashboard/config');
            // const data = await response.json();

            // Mock data - will be replaced with API
            const mockConfig: DashboardConfig = {
                role: "BRANCH_ADMIN",
                permissions: ["hrms.view", "ems.view", "finance.view", "crm.view"],
                modules: ["HRMS", "EMS", "Finance", "CRM"],
            };

            setDashboardConfig(mockConfig);
            loadDashboardData(mockConfig);
        } catch (error) {
            console.error("Failed to load dashboard config:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadDashboardData = (config: DashboardConfig) => {
        // Build stats based on available modules
        const statsData = [];

        if (config.modules.includes("HRMS")) {
            statsData.push({ label: "Total Employees", value: "45", change: "+5", icon: Users, color: "blue" });
        }

        if (config.modules.includes("EMS")) {
            statsData.push({ label: "Active Students", value: "128", change: "+12", icon: GraduationCap, color: "green" });
        }

        if (config.modules.includes("Finance")) {
            statsData.push({ label: "Monthly Revenue", value: "₹8.5L", change: "+18%", icon: DollarSign, color: "purple" });
        }

        if (config.modules.includes("CRM")) {
            statsData.push({ label: "Active Leads", value: "34", change: "+8", icon: Phone, color: "orange" });
        }

        setStats(statsData);

        // Build quick actions based on permissions
        const actionsData = [];

        if (config.permissions.includes("hrms.view")) {
            actionsData.push({ label: "Employee Management", href: "/branch/hrms/employees", icon: Users, color: "blue" });
            actionsData.push({ label: "Attendance", href: "/branch/hrms/attendance", icon: UserCheck, color: "pink" });
        }

        if (config.permissions.includes("ems.view")) {
            actionsData.push({ label: "Student Admissions", href: "/branch/ems/students", icon: GraduationCap, color: "green" });
        }

        if (config.permissions.includes("finance.view")) {
            actionsData.push({ label: "Invoice Management", href: "/branch/finance/invoices", icon: FileText, color: "purple" });
        }

        if (config.permissions.includes("crm.view")) {
            actionsData.push({ label: "Lead Follow-ups", href: "/branch/crm/leads", icon: Phone, color: "orange" });
        }

        actionsData.push({ label: "Reports", href: "/branch/reports", icon: BarChart3, color: "indigo" });

        setQuickActions(actionsData);

        // Build recent activity
        const activityData = [
            { title: "New Employee Onboarded", subtitle: "John Doe - Software Developer", time: "2 hours ago", icon: Users },
            { title: "Student Admission", subtitle: "5 new students enrolled in Full Stack course", time: "3 hours ago", icon: GraduationCap },
            { title: "Invoice Generated", subtitle: "Invoice #INV-2024-001 for ₹45,000", time: "5 hours ago", icon: DollarSign },
            { title: "New Lead Assigned", subtitle: "Career Guidance inquiry from Mumbai", time: "1 day ago", icon: Phone },
        ];

        setRecentActivity(activityData);
    };

    // Build navbar config dynamically
    const getNavbarConfig = () => {
        if (!dashboardConfig) return null;

        const quickActionsForNav = [];
        quickActionsForNav.push({ label: "Dashboard", href: "/branch/dashboard", icon: BarChart3 });

        if (dashboardConfig.modules.includes("HRMS")) {
            quickActionsForNav.push({ label: "HRMS", href: "/branch/hrms", icon: Users });
        }

        if (dashboardConfig.modules.includes("EMS")) {
            quickActionsForNav.push({ label: "EMS", href: "/branch/ems", icon: GraduationCap });
        }

        if (dashboardConfig.modules.includes("Finance")) {
            quickActionsForNav.push({ label: "Finance", href: "/branch/finance", icon: DollarSign });
        }

        if (dashboardConfig.modules.includes("CRM")) {
            quickActionsForNav.push({ label: "CRM", href: "/branch/crm", icon: Phone });
        }

        quickActionsForNav.push({ label: "Reports", href: "/branch/reports", icon: FileText });

        return {
            logo: {
                icon: Building2,
                text: "Branch Dashboard",
                href: "/branch/dashboard",
            },
            searchPlaceholder: "Search employees, students, invoices...",
            quickActions: quickActionsForNav,
            notificationHref: "/branch/notifications",
            profileHref: "/branch/profile",
            logoutHref: "/login",
            userName: "Branch Manager", // TODO: Get from user session
            userEmail: "manager@durkkas.com", // TODO: Get from user session
            moduleColor: "orange",
        };
    };

    // Build bottom nav config dynamically
    const getBottomNavConfig = () => {
        if (!dashboardConfig) return null;

        const navItems = [];

        if (dashboardConfig.modules.includes("HRMS")) {
            navItems.push({ href: "/branch/hrms", icon: Users, label: "HRMS" });
        }

        if (dashboardConfig.modules.includes("EMS")) {
            navItems.push({ href: "/branch/ems", icon: GraduationCap, label: "EMS" });
        }

        if (dashboardConfig.modules.includes("Finance")) {
            navItems.push({ href: "/branch/finance", icon: DollarSign, label: "Finance" });
        }

        if (dashboardConfig.modules.includes("CRM")) {
            navItems.push({ href: "/branch/crm", icon: Phone, label: "CRM" });
        }

        navItems.push({ href: "/branch/reports", icon: BarChart3, label: "Reports" });
        navItems.push({ href: "/branch/settings", icon: Settings, label: "Settings" });

        return {
            items: navItems.slice(0, 6), // Max 6 items
            moduleColor: "orange",
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const navbarConfig = getNavbarConfig();
    const bottomNavConfig = getBottomNavConfig();

    if (!navbarConfig || !bottomNavConfig) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Failed to load dashboard configuration</p>
                </div>
            </div>
        );
    }

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

                {/* Stats Grid - Dynamic based on modules */}
                {stats.length > 0 && (
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
                )}

                {/* Quick Actions - Dynamic based on permissions */}
                {quickActions.length > 0 && (
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
                )}

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                            <Link href="/branch/activity">
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
                )}
            </div>

            <UniversalBottomNav config={bottomNavConfig} />
        </div>
    );
}
