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
    Loader2,
    RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function AttendancePage() {
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0
    });

    useEffect(() => {
        setMounted(true);
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/attendance?mode=student-history");
            if (response.data.success) {
                const data = response.data.data || [];
                setAttendanceRecords(data);

                const present = data.filter((r: any) => r.status === 'PRESENT').length;
                const total = data.length || 0;
                setStats({
                    total,
                    present,
                    absent: total - present,
                    percentage: total > 0 ? Math.round((present / total) * 100) : 0
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to load attendance history");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

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
                    <p className="text-gray-600">Track your class attendance across all courses</p>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 font-medium text-[10px] uppercase tracking-wider">Total Classes</p>
                                    <p className="text-3xl font-bold">{stats.total}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-100 fill-blue-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 font-medium text-[10px] uppercase tracking-wider">Present</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-100 fill-green-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 font-medium text-[10px] uppercase tracking-wider">Absent / Partial</p>
                                    <p className="text-3xl font-bold text-orange-600">{stats.absent}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-orange-100 fill-orange-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 font-medium text-[10px] uppercase tracking-wider">Attendance %</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.percentage}%</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <Clock className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Recent Activity</h2>
                            <Button variant="outline" size="sm" onClick={fetchAttendance} className="gap-2">
                                <RefreshCw className="h-4 w-4" /> Refresh
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {attendanceRecords.length === 0 ? (
                                <Card className="border-0 shadow-md">
                                    <CardContent className="p-12 text-center text-gray-500">
                                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>No attendance records found</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                attendanceRecords.map((record, index) => (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${record.status === "PRESENT" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                                                            {record.status === "PRESENT" ? (
                                                                <CheckCircle2 className="h-6 w-6" />
                                                            ) : (
                                                                <Clock className="h-6 w-6" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">{record.session?.course?.course_name || 'Class Session'}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-xs text-gray-500">{mounted ? new Date(record.session?.session_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                                                                <span className="text-gray-300">•</span>
                                                                <p className="text-xs text-gray-500">{record.session?.session_type}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter ${record.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                                                            {record.status}
                                                        </span>
                                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Verification: {record.verification_status}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-0 shadow-lg bg-blue-600 text-white p-2">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold mb-2">Smart Attendance</h3>
                                <p className="text-blue-100 text-sm mb-6">Attendance is now verified using Face Recognition and GPS. Make sure you are within the campus zone during class hours.</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-medium">Campus GPS Verified</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                            <Camera className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-medium">Face ID Recognition</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}

// Add MapPin and Camera to imports
import { MapPin, Camera } from "lucide-react";
