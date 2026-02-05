"use client";

import { useState, useEffect } from "react";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    Clock,
    Users,
    CheckCircle,
    ArrowLeft,
    ChevronRight,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface ScheduledBatch {
    id: number;
    batch_name: string;
    batch_code: string;
    start_time: string;
    end_time: string;
    course: {
        id: number;
        course_name: string;
        course_code: string;
    };
    total_students: number;
    session?: {
        id: number;
        status: string;
        present_count: number;
        absent_count: number;
    } | null;
    status: string;
}

export default function AttendancePage() {
    const router = useRouter();
    const [schedule, setSchedule] = useState<ScheduledBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchDailySchedule();
    }, [selectedDate]);

    const fetchDailySchedule = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/attendance?mode=schedule&date=${selectedDate}`);
            if (response.data.success) {
                setSchedule(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (batch: ScheduledBatch) => {
        // If session exists, navigate
        if (batch.session) {
            router.push(`/ems/academic-manager/attendance/${batch.session.id}`);
            return;
        }

        // If no session exists, create one implicitly then navigate
        try {
            toast.loading("Starting session...");

            // Safety check for course_id
            let courseId = 0;
            if (Array.isArray(batch.course)) {
                courseId = (batch.course as any)[0]?.id;
            } else if (batch.course && typeof batch.course === 'object') {
                courseId = (batch.course as any).id;
            }

            const response = await api.post("/ems/attendance?mode=session", {
                batch_id: batch.id,
                course_id: courseId || 1,
                session_date: selectedDate,
                session_type: "REGULAR",
                start_time: batch.start_time || "09:00",
                end_time: batch.end_time || "10:00"
            });

            toast.dismiss();

            if (response.data.success) {
                const newSession = response.data.data;
                toast.success("Session started!");
                router.push(`/ems/academic-manager/attendance/${newSession.id}`);
            }
        } catch (error) {
            toast.dismiss();
            console.error("Error creating session:", error);
            toast.error("Failed to start session");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerTopNavbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Attendance Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Today's Scheduled Classes ({mounted ? new Date(selectedDate).toLocaleDateString() : ''})
                        </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-0 focus-visible:ring-0 w-auto"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading schedule...</p>
                    </div>
                ) : schedule.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Classes Scheduled
                            </h3>
                            <p className="text-gray-600 mb-6">
                                There are no active batches scheduled for this date.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {schedule.map((batch) => (
                            <motion.div
                                key={batch.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group"
                            >
                                <Card className={`border-0 shadow-md transition-all hover:shadow-xl ${batch.session?.status === 'COMPLETED' ? 'bg-green-50/50' : 'bg-white'
                                    }`}>
                                    <CardContent className="p-6 flex items-center gap-6">
                                        {/* Time Column */}
                                        <div className="flex flex-col items-center justify-center min-w-[80px] p-3 bg-purple-50 rounded-xl text-purple-700">
                                            <span className="text-lg font-bold">
                                                {batch.start_time ? batch.start_time.substring(0, 5) : '09:00'}
                                            </span>
                                            <span className="text-xs opacity-70">
                                                {batch.end_time ? batch.end_time.substring(0, 5) : '10:00'}
                                            </span>
                                        </div>

                                        {/* Details Column */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {batch.batch_name}
                                                </h3>
                                                {batch.session?.status === 'COMPLETED' && (
                                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Completed
                                                    </span>
                                                )}
                                                {batch.session?.status === 'SCHEDULED' && (
                                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Scheduled
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-2 flex items-center gap-2 text-sm">
                                                <span className="font-medium text-purple-600">{batch.course?.course_name}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> Classroom A
                                                </span>
                                            </p>

                                            {batch.session && (
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <Users className="h-3 w-3" /> {batch.session.present_count || 0}/{batch.total_students || 0} Present
                                                    </span>
                                                    <span className="flex items-center gap-1 text-red-600">
                                                        <Users className="h-3 w-3" /> {batch.session.absent_count || 0}/{batch.total_students || 0} Absent
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div>
                                            <Button
                                                onClick={() => handleMarkAttendance(batch as any)} // Cast to any to avoid strict type checks on course object mismatches for now
                                                className={`${batch.session
                                                    ? "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
                                                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200"
                                                    } min-w-[140px]`}
                                            >
                                                {batch.session ? "View / Edit" : "Mark Attendance"}
                                                {!batch.session && <ChevronRight className="h-4 w-4 ml-2" />}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AcademicManagerBottomNav />
        </div>
    );
}
