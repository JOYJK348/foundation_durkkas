"use client";

import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AttendancePage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const attendanceRecords = [
        { date: "2024-12-20", status: "present", session: "Web Development - Module 3" },
        { date: "2024-12-18", status: "present", session: "Data Science - Module 2" },
        { date: "2024-12-15", status: "absent", session: "Web Development - Module 2" },
        { date: "2024-12-13", status: "present", session: "Data Science - Module 1" },
    ];

    const stats = {
        total: 20,
        present: 17,
        absent: 3,
        percentage: 85,
    };

    const handleMarkAttendance = () => {
        toast.success("Attendance Marked", {
            description: "Your attendance has been recorded successfully",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-4">
                    <Link href="/ems/student/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">Attendance</h1>
                    <p className="text-gray-600">Track your class attendance</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Classes</p>
                                    <p className="text-3xl font-bold">{stats.total}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Present</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Absent</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Percentage</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.percentage}%</p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-0 shadow-lg mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Attendance Calendar</h2>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="font-semibold">
                                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                                <Button variant="outline" size="icon">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="text-center text-gray-500 py-8">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p>Calendar view coming soon</p>
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <h2 className="text-2xl font-bold mb-4">Recent Attendance</h2>
                    <div className="space-y-3">
                        {attendanceRecords.map((record, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${record.status === "present" ? "bg-green-100" : "bg-red-100"
                                                    }`}>
                                                    {record.status === "present" ? (
                                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-6 w-6 text-red-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{record.session}</h3>
                                                    <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === "present"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
