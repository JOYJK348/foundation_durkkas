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
    PlayCircle,
    Users,
    UserCheck,
    MapPin,
    Minus,
    CheckSquare,
    XSquare
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface AttendanceRecord {
    id?: number;
    student_id: number;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'PENDING';
    remarks?: string;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_code: string;
    };
    // Verification fields
    entry_verified_at?: string;
    exit_verified_at?: string;
    entry_status?: string;
    exit_status?: string;
    entry_image?: string;
    exit_image?: string;
    entry_location_verified?: boolean;
    exit_location_verified?: boolean;
    entry_distance?: number;
    exit_distance?: number;
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
            if (sessionRes.data.success) {
                const currentSession = sessionRes.data.data;
                setSession(currentSession);

                // 2. Fetch the detailed attendance Summary (backend now returns ALL enrolled students with metadata)
                const summaryRes = await api.get(`/ems/attendance?session_id=${sessionId}&batch_id=${currentSession.batch_id}`);

                if (summaryRes.data.success) {
                    const { attendance } = summaryRes.data.data;
                    setAttendanceRecords(attendance || []);
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

        // Filter out PENDING records - we only save what is explicitly marked
        const recordsToSave = attendanceRecords.filter(r => r.status !== 'PENDING');

        if (recordsToSave.length === 0) {
            toast.info("No attendance changes to save");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                session_id: session.id,
                records: recordsToSave.map(r => ({
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
                                onClick={() => toggleSessionStatus('IDENTIFYING_ENTRY')}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Open Entry Window
                            </Button>
                        )}
                        {session?.status === 'IDENTIFYING_ENTRY' && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => toggleSessionStatus('IN_PROGRESS')}
                                    variant="outline"
                                    className="border-gray-200 text-gray-600 font-bold"
                                >
                                    Close Window
                                </Button>
                                <Button
                                    onClick={() => toggleSessionStatus('IDENTIFYING_EXIT')}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                                >
                                    Open Exit Window
                                </Button>
                            </div>
                        )}
                        {session?.status === 'IN_PROGRESS' && (
                            <Button
                                onClick={() => toggleSessionStatus('IDENTIFYING_EXIT')}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                            >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Open Exit Window
                            </Button>
                        )}
                        {session?.status === 'IDENTIFYING_EXIT' && (
                            <Button
                                onClick={() => toggleSessionStatus('COMPLETED')}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Session Completed
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
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Card className="flex-1 border-0 shadow-sm bg-white overflow-hidden group">
                            <CardContent className="p-0 flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                    <Input
                                        placeholder="Search student name or code..."
                                        className="pl-12 h-14 border-0 focus-visible:ring-0 shadow-none bg-transparent text-gray-700 font-medium placeholder:text-gray-400"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pr-6 border-l border-gray-100 pl-6 h-14">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    <select
                                        className="bg-transparent text-sm font-bold text-gray-600 focus:outline-none cursor-pointer hover:text-purple-600 transition-colors"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="PRESENT">Present Only</option>
                                        <option value="ABSENT">Absent Only</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all duration-300">
                            <CardContent className="p-4 flex flex-col items-center justify-center relative overflow-hidden">
                                <Users className="absolute -right-2 -bottom-2 h-16 w-16 text-gray-50 opacity-[0.03]" />
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total</p>
                                <p className="text-2xl font-black text-gray-900 leading-none">{attendanceRecords.length}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all duration-300 border-b-2 border-green-500 group">
                            <CardContent className="p-4 flex flex-col items-center justify-center relative">
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                </div>
                                <p className="text-[10px] text-green-600 uppercase font-black tracking-widest mb-1 group-hover:scale-110 transition-transform">Entry (Arrival)</p>
                                <p className="text-2xl font-black text-green-700 leading-none">{attendanceRecords.filter((r: any) => r.entry_verified_at).length}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all duration-300 border-b-2 border-blue-500 group">
                            <CardContent className="p-4 flex flex-col items-center justify-center relative">
                                <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest mb-1 group-hover:scale-110 transition-transform">Exit (Departure)</p>
                                <p className="text-2xl font-black text-blue-700 leading-none">{attendanceRecords.filter((r: any) => r.exit_verified_at).length}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all duration-300 border-b-2 border-purple-500 group">
                            <CardContent className="p-4 flex flex-col items-center justify-center relative">
                                <p className="text-[10px] text-purple-600 uppercase font-black tracking-widest mb-1 group-hover:scale-110 transition-transform">Manual Adjust</p>
                                <p className="text-2xl font-black text-purple-700 leading-none">{countStatus('PRESENT')}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all duration-300 border-b-2 border-red-500 group">
                            <CardContent className="p-4 flex flex-col items-center justify-center relative">
                                <p className="text-[10px] text-red-600 uppercase font-black tracking-widest mb-1 group-hover:scale-110 transition-transform">Absent</p>
                                <p className="text-2xl font-black text-red-700 leading-none">{countStatus('ABSENT')}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Students List */}
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Student Detail</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Arrival Trace</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Departure Trace</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Manual Override</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Intelligence/Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record: any) => (
                                        <tr key={record.student_id} className="group hover:bg-gray-50/80 transition-all duration-200">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-indigo-100 shadow-lg group-hover:scale-105 transition-transform">
                                                            {record.student.first_name[0]}{record.student.last_name[0]}
                                                        </div>
                                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${record.status === 'PRESENT' ? 'bg-green-500' :
                                                                record.status === 'ABSENT' ? 'bg-red-400' :
                                                                    'bg-gray-300'
                                                            }`}></div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                            {record.student.first_name} {record.student.last_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[9px] font-black text-gray-500 uppercase tracking-widest">{record.student.student_code}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Arrival (Entry) */}
                                            <td className="px-6 py-5">
                                                {record.entry_verified_at ? (
                                                    <div className="flex flex-col items-center gap-1.5 focus-within:z-10 relative">
                                                        <div className="flex items-center gap-1">
                                                            <div className="group/img relative">
                                                                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black border border-green-100 flex items-center gap-1 cursor-help">
                                                                    <UserCheck className="h-3 w-3" />
                                                                    {record.entry_status}
                                                                </span>
                                                                {record.entry_image && (
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 group-hover/img:opacity-100 transition-opacity z-50 pointer-events-none">
                                                                        <img src={record.entry_image} alt="Entry Verification" className="w-24 h-24 object-cover rounded-md" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {record.entry_location_verified && (
                                                                <span className="p-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100" title={`Distance: ${Math.round(record.entry_distance || 0)}m`}>
                                                                    <MapPin className="h-3 w-3" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px]">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(record.entry_verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-gray-300">
                                                        <Minus className="h-5 w-5" />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter mt-0.5">No trace</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Departure (Exit) */}
                                            <td className="px-6 py-5">
                                                {record.exit_verified_at ? (
                                                    <div className="flex flex-col items-center gap-1.5 relative">
                                                        <div className="flex items-center gap-1">
                                                            <div className="group/img relative">
                                                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100 flex items-center gap-1 cursor-help">
                                                                    <UserCheck className="h-3 w-3" />
                                                                    {record.exit_status}
                                                                </span>
                                                                {record.exit_image && (
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 group-hover/img:opacity-100 transition-opacity z-50 pointer-events-none">
                                                                        <img src={record.exit_image} alt="Exit Verification" className="w-24 h-24 object-cover rounded-md" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {record.exit_location_verified && (
                                                                <span className="p-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100" title={`Distance: ${Math.round(record.exit_distance || 0)}m`}>
                                                                    <MapPin className="h-3 w-3" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px]">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(record.exit_verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-gray-300">
                                                        <Minus className="h-5 w-5" />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter mt-0.5">No trace</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleStatusChange(record.student_id, 'PRESENT')}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${record.status === 'PRESENT'
                                                            ? 'bg-green-500 text-white shadow-lg shadow-green-100'
                                                            : 'bg-white border border-gray-100 text-gray-400 hover:border-green-300 hover:text-green-500 hover:bg-green-50/30'
                                                            }`}
                                                        title="Mark Present"
                                                    >
                                                        <CheckSquare className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(record.student_id, 'ABSENT')}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${record.status === 'ABSENT'
                                                            ? 'bg-red-500 text-white shadow-lg shadow-red-100'
                                                            : 'bg-white border border-gray-100 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50/30'
                                                            }`}
                                                        title="Mark Absent"
                                                    >
                                                        <XSquare className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="relative max-w-[200px]">
                                                    <Input
                                                        placeholder="Add insight..."
                                                        value={record.remarks || ''}
                                                        onChange={(e) => handleRemarkChange(record.student_id, e.target.value)}
                                                        className="h-10 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-purple-300 transition-all text-[11px] font-medium rounded-xl"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-4">
                                                <Search className="h-8 w-8 text-gray-200" />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No students found matching current filters</p>
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
