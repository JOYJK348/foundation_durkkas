"use client";

import { useState, useEffect } from "react";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Calendar,
    Plus,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    ArrowLeft,
    X,
    Download,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface AttendanceSession {
    id: number;
    session_date: string;
    batch_id: number;
    course_id: number;
    total_students: number;
    present_count: number;
    absent_count: number;
    status: string;
    batches?: {
        batch_name: string;
    };
    courses?: {
        course_name: string;
    };
}

interface Batch {
    id: number;
    batch_name: string;
    batch_code: string;
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

export default function AttendancePage() {
    const [sessions, setSessions] = useState<AttendanceSession[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        batch_id: "",
        course_id: "",
        session_date: "",
        session_time: "",
    });

    useEffect(() => {
        fetchSessions();
        fetchBatches();
        fetchCourses();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/attendance");
            if (response.data.success) {
                setSessions(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching attendance sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await api.get("/ems/batches");
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get("/ems/courses");
            if (response.data.success) {
                setCourses(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/ems/attendance?mode=session", {
                ...formData,
                batch_id: parseInt(formData.batch_id),
                course_id: parseInt(formData.course_id),
                session_date: `${formData.session_date}T${formData.session_time}`,
            });

            if (response.data.success) {
                setShowCreateForm(false);
                fetchSessions();
                setFormData({
                    batch_id: "",
                    course_id: "",
                    session_date: "",
                    session_time: "",
                });
            }
        } catch (error) {
            console.error("Error creating attendance session:", error);
        }
    };

    const filteredSessions = sessions.filter((session) =>
        session.batches?.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.courses?.course_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getAttendancePercentage = (session: AttendanceSession) => {
        if (session.total_students === 0) return 0;
        return Math.round((session.present_count / session.total_students) * 100);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                            Track and manage student attendance
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Session
                    </Button>
                </div>

                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search by batch or course..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading attendance sessions...</p>
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Attendance Sessions Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first attendance session to start tracking
                            </p>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Session
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredSessions.map((session) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="h-6 w-6 text-purple-600" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                            {session.batches?.batch_name}
                                                        </h3>
                                                        <p className="text-sm text-purple-600 font-medium">
                                                            {session.courses?.course_name}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === 'COMPLETED'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {session.status}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span>
                                                        {new Date(session.session_date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                        <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                                                        <p className="text-2xl font-bold text-gray-900">{session.total_students}</p>
                                                        <p className="text-xs text-gray-600">Total</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                                                        <p className="text-2xl font-bold text-green-700">{session.present_count}</p>
                                                        <p className="text-xs text-gray-600">Present</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                                        <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                                                        <p className="text-2xl font-bold text-red-700">{session.absent_count}</p>
                                                        <p className="text-xs text-gray-600">Absent</p>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>Attendance Rate</span>
                                                        <span className="font-semibold">{getAttendancePercentage(session)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${getAttendancePercentage(session) >= 75
                                                                ? 'bg-green-600'
                                                                : getAttendancePercentage(session) >= 50
                                                                    ? 'bg-yellow-600'
                                                                    : 'bg-red-600'
                                                                }`}
                                                            style={{ width: `${getAttendancePercentage(session)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="flex-1">
                                                        View Details
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        Mark Attendance
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Session Modal */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowCreateForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Create Attendance Session
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateSession} className="p-6 space-y-6">
                                <div>
                                    <Label htmlFor="course_id">Select Course *</Label>
                                    <select
                                        id="course_id"
                                        required
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={formData.course_id}
                                        onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                    >
                                        <option value="">Choose a course...</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="batch_id">Select Batch *</Label>
                                    <select
                                        id="batch_id"
                                        required
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={formData.batch_id}
                                        onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                                    >
                                        <option value="">Choose a batch...</option>
                                        {batches.map((batch) => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.batch_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="session_date">Date *</Label>
                                        <Input
                                            id="session_date"
                                            type="date"
                                            required
                                            value={formData.session_date}
                                            onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="session_time">Time *</Label>
                                        <Input
                                            id="session_time"
                                            type="time"
                                            required
                                            value={formData.session_time}
                                            onChange={(e) => setFormData({ ...formData, session_time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        💡 All enrolled students will be marked as ABSENT by default. You can update their status after creating the session.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Create Session
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AcademicManagerBottomNav />
        </div>
    );
}
