"use client";

import { useState, useEffect } from "react";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    ArrowLeft,
    Save,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    PlayCircle
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface AttendanceRecord {
    id?: number;
    student_id: number;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_code: string;
    };
}

interface SessionDetails {
    id: number;
    session_date: string;
    batch_id: number;
    course_id: number;
    status: string;
}

export default function MarkAttendancePage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<SessionDetails | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    useEffect(() => {
        if (sessionId) {
            fetchSessionAndStudents();
        }
    }, [sessionId]);

    const fetchSessionAndStudents = async () => {
        try {
            setLoading(true);
            // 1. First get the session details to know the batch_id
            // Ideally backend should provide a single endpoint for this.
            // Using the one we just fixed/created: GET /api/ems/attendance?session_id=X&batch_id=Y
            // But we don't know batch_id yet. 
            // So we fetching sessions first to find this session.
            // OR better: we implemented: if (sessionId) check for batchId.
            // If we don't pass batchId, my backend logic returns error "Batch ID is required".
            // That's a bit of a catch-22 if we don't have batchId.
            // Let's assume for now we list all sessions and find this one, OR we fix backend to just fetch by session ID.

            // 1. Get the session details to know the batch_id
            const sessionRes = await api.get(`/ems/attendance?session_id=${sessionId}`);
            const currentSession = sessionRes.data.data;

            if (currentSession) {
                setSession(currentSession);

                // Now fetch the detailed attendance Summary (students list)
                const summaryRes = await api.get(`/ems/attendance?session_id=${sessionId}&batch_id=${currentSession.batch_id}`);

                if (summaryRes.data.success) {
                    const { attendance } = summaryRes.data.data;

                    // If attendance records exist, use them.
                    // If not (empty array), we need to fetch all students in the batch and initialize them as ABSENT/PRESENT.
                    // The backend 'getBatchAttendanceReport' returns { sessions, attendance }. 
                    // If 'attendance' is empty, it means no records yet.

                    if (attendance && attendance.length > 0) {
                        setAttendanceRecords(attendance);
                    } else {
                        // Fetch batch students to initialize
                        const batchRes = await api.get(`/ems/batches/${currentSession.batch_id}?details=true`);
                        if (batchRes.data.success) {
                            const enrolledStudents = batchRes.data.data.student_enrollments || [];
                            const initialRecords = enrolledStudents.map((enrollment: any) => ({
                                student_id: enrollment.students.id,
                                status: 'PRESENT', // Default to present
                                remarks: '',
                                student: enrollment.students
                            }));
                            setAttendanceRecords(initialRecords);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load session details");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        setAttendanceRecords(prev => prev.map(record => {
            if (record.student_id === studentId) {
                return { ...record, status };
            }
            return record;
        }));
    };

    const handleRemarkChange = (studentId: number, remarks: string) => {
        setAttendanceRecords(prev => prev.map(record => {
            if (record.student_id === studentId) {
                return { ...record, remarks };
            }
            return record;
        }));
    };

    const countStatus = (status: string) => {
        return attendanceRecords.filter(r => r.status === status).length;
    };

    const toggleSessionStatus = async (newStatus: string) => {
        if (!session) return;
        try {
            setSaving(true);
            const res = await api.post("/ems/attendance?mode=session-status", {
                session_id: session.id,
                status: newStatus
            });
            if (res.data.success) {
                toast.success(`Session is now ${newStatus}`);
                setSession(res.data.data);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update session status");
        } finally {
            setSaving(false);
        }
    };

    const saveAttendance = async () => {
        if (!session) return;

        try {
            setSaving(true);
            const payload = {
                session_id: session.id,
                records: attendanceRecords.map(r => ({
                    company_id: 1, // This should normally come from context/auth
                    session_id: session.id,
                    student_id: r.student_id,
                    status: r.status,
                    remarks: r.remarks
                }))
            };

            console.log("Saving Attendance Payload:", payload);
            const response = await api.post("/ems/attendance?mode=record", payload);

            if (response.data.success) {
                toast.success("Attendance marked successfully");
                // If manual save, we might want to mark session as COMPLETED? 
                // Let the user decide via the status toggle.
                router.push("/ems/academic-manager/attendance");
            }
        } catch (error) {
            console.error("Error saving attendance:", error);
            toast.error("Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    const filteredRecords = attendanceRecords.filter(record => {
        const matchesSearch =
            record.student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.student.student_code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === "ALL" || record.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading student list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/attendance">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Sessions
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Mark Attendance
                            </h1>
                            {session?.status === 'OPEN' && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse flex items-center gap-1 border border-green-200">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    LIVE TRACKING OPEN
                                </span>
                            )}
                            {session?.status === 'SCHEDULED' && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 border border-blue-200">
                                    SCHEDULED
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {session && new Date(session.session_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {session && new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {session?.status === 'SCHEDULED' && (
                            <Button
                                onClick={() => toggleSessionStatus('OPEN')}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Open for Students
                            </Button>
                        )}
                        {session?.status === 'OPEN' && (
                            <Button
                                onClick={() => toggleSessionStatus('COMPLETED')}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Stop Tracking
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => fetchSessionAndStudents()} // Reset/Reload
                        >
                            Refresh
                        </Button>
                        <Button
                            onClick={saveAttendance}
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
                        >
                            {saving ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Final Save
                        </Button>
                    </div>
                </div>

                {/* Stats & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="md:col-span-3 border-0 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search student name or code..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <select
                                    className="h-10 rounded-md border border-gray-300 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="ALL">All Students</option>
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-white">
                        <CardContent className="p-4 flex justify-between items-center text-center">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                                <p className="text-xl font-bold text-gray-900">{attendanceRecords.length}</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div>
                                <p className="text-xs text-green-600 uppercase font-bold">Present</p>
                                <p className="text-xl font-bold text-green-700">{countStatus('PRESENT')}</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div>
                                <p className="text-xs text-red-600 uppercase font-bold">Absent</p>
                                <p className="text-xl font-bold text-red-700">{countStatus('ABSENT')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Students List */}
                <Card className="border-0 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record) => (
                                        <tr key={record.student_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold mr-3">
                                                        {record.student.first_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {record.student.first_name} {record.student.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {record.student.student_code}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleStatusChange(record.student_id, 'PRESENT')}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${record.status === 'PRESENT'
                                                            ? 'bg-green-100 text-green-700 ring-2 ring-green-600 ring-offset-1'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(record.student_id, 'ABSENT')}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${record.status === 'ABSENT'
                                                            ? 'bg-red-100 text-red-700 ring-2 ring-red-600 ring-offset-1'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Input
                                                    placeholder="Add note (optional)"
                                                    value={record.remarks || ''}
                                                    onChange={(e) => handleRemarkChange(record.student_id, e.target.value)}
                                                    className="bg-transparent border-gray-200 focus:bg-white transition-all"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                            <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                            <p>No students found matching your search.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <AcademicManagerBottomNav />
        </div>
    );
}
