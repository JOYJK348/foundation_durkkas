"use client";

import { motion } from "framer-motion";
import { UniversalTopNavbar } from "@/components/dashboard/UniversalTopNavbar";
import { UniversalBottomNav } from "@/components/dashboard/UniversalBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    // STEP 1: Import your icons here
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Settings,
    TrendingUp,
    ArrowUpRight,
} from "lucide-react";

export default function TemplateDashboard() {
    // STEP 2: Configure Top Navbar
    const navbarConfig = {
        logo: {
            icon: LayoutDashboard,              // Change this icon
            text: "Module Name",                // Change module name
            href: "/module/role/dashboard",     // Change base route
        },
        searchPlaceholder: "Search...",       // Customize search placeholder
        quickActions: [
            // Add 6 quick actions (shown in profile dropdown)
            { label: "Dashboard", href: "/module/role/dashboard", icon: LayoutDashboard },
            { label: "Action 1", href: "/module/role/action1", icon: Users },
            { label: "Action 2", href: "/module/role/action2", icon: Calendar },
            { label: "Action 3", href: "/module/role/action3", icon: FileText },
            { label: "Action 4", href: "/module/role/action4", icon: Settings },
            { label: "Action 5", href: "/module/role/action5", icon: TrendingUp },
        ],
        notificationHref: "/module/role/notifications",
        profileHref: "/module/role/profile",
        logoutHref: "/login",
        userName: "User Name",                // Will come from API
        userEmail: "user@durkkas.com",        // Will come from API
        moduleColor: "blue",                  // blue, green, purple, orange, red, indigo, pink
    };

    // STEP 3: Configure Bottom Navigation
    const bottomNavConfig = {
        items: [
            // Add up to 6 navigation items
            { href: "/module/role/dashboard", icon: LayoutDashboard, label: "Home" },
            { href: "/module/role/page1", icon: Users, label: "Page 1" },
            { href: "/module/role/page2", icon: Calendar, label: "Page 2" },
            { href: "/module/role/page3", icon: FileText, label: "Page 3" },
            { href: "/module/role/page4", icon: TrendingUp, label: "Page 4" },
            { href: "/module/role/settings", icon: Settings, label: "Settings" },
        ],
        moduleColor: "blue",  // Same as navbar
    };

    // STEP 4: Define Stats (4 items)
    const stats = [
        { label: "Stat 1", value: "100", change: "+10", icon: Users, color: "blue" },
        { label: "Stat 2", value: "50", change: "+5", icon: Calendar, color: "green" },
        { label: "Stat 3", value: "75", change: "+15", icon: FileText, color: "purple" },
        { label: "Stat 4", value: "90%", change: "+5%", icon: TrendingUp, color: "orange" },
    ];

    // STEP 5: Define Quick Actions (6 items)
    const quickActions = [
        { label: "Quick Action 1", href: "/module/role/action1", icon: Users, color: "blue" },
        { label: "Quick Action 2", href: "/module/role/action2", icon: Calendar, color: "green" },
        { label: "Quick Action 3", href: "/module/role/action3", icon: FileText, color: "purple" },
        { label: "Quick Action 4", href: "/module/role/action4", icon: Settings, color: "orange" },
        { label: "Quick Action 5", href: "/module/role/action5", icon: TrendingUp, color: "pink" },
        { label: "Quick Action 6", href: "/module/role/action6", icon: LayoutDashboard, color: "indigo" },
    ];

    // STEP 6: Define Recent Activity/List Items
    const recentItems = [
        { title: "Item 1", subtitle: "Description of item 1", time: "2 hours ago", icon: Users },
        { title: "Item 2", subtitle: "Description of item 2", time: "5 hours ago", icon: Calendar },
        { title: "Item 3", subtitle: "Description of item 3", time: "1 day ago", icon: FileText },
        { title: "Item 4", subtitle: "Description of item 4", time: "2 days ago", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Top Navigation */}
            <UniversalTopNavbar config={navbarConfig} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                        Dashboard Title
                    </h1>
                    <p className="text-gray-600">Welcome message or description</p>
                </motion.div>

                {/* Stats Grid - 4 columns */}
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

                {/* Quick Actions - 6 items in grid */}
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

                {/* Recent Activity/List Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                        <Link href="/module/role/activity">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                View All
                                <ArrowUpRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentItems.map((item, index) => (
                            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <item.icon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                            <p className="text-sm text-gray-600 mb-1">{item.subtitle}</p>
                                            <p className="text-xs text-gray-500">{item.time}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Navigation */}
            <UniversalBottomNav config={bottomNavConfig} />
        </div>
    );
}
