"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Users,
    Calendar,
    ArrowLeft,
    AlertCircle,
    Eye,
    Download
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface StudentSubmission {
    id: number;
    first_name: string;
    last_name: string;
    student_code: string;
    email: string;
    phone?: string;
    status: 'SUBMITTED' | 'NOT_SUBMITTED' | 'GRADED' | 'LATE';
    submission?: {
        id: number;
        submitted_at: string;
        submission_file_url?: string;
        submission_text?: string;
        marks_obtained?: number;
    };
}

export default function AcademicManagerAssignmentDetailPage() {
    const params = useParams();
    const assignmentId = params.id;
    const [data, setData] = useState<{ assignment: any, students: StudentSubmission[] }>({
        assignment: null,
        students: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

    useEffect(() => {
        if (assignmentId) {
            fetchAssignmentDetails();
        }
    }, [assignmentId]);

    const fetchAssignmentDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/assignments/${assignmentId}/submissions`);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            console.error("Error fetching assignment details:", error);
            const msg = error.response?.data?.error?.message || "Failed to load assignment details";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!data.assignment) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Assignment Not Found</h1>
                <Link href="/ems/academic-manager/assignments" className="mt-4 text-purple-600 hover:underline">
                    Back to Assignments
                </Link>
            </div>
        );
    }

    const { assignment, students } = data;
    const submissionCount = students.filter(s => s.status !== 'NOT_SUBMITTED').length;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
            <AcademicManagerTopNavbar />

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <Link href="/ems/academic-manager/assignments" className="inline-flex items-center text-xs sm:text-sm text-gray-500 hover:text-purple-600 mb-3 sm:mb-4 group">
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Assignments
                    </Link>
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 text-xs">
                                    {assignment.courses?.course_code}
                                </Badge>
                                {assignment.batches && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
                                        {assignment.batches.batch_name}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{assignment.assignment_title}</h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-2 line-clamp-3 sm:line-clamp-none">{assignment.assignment_description}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white px-3 py-2 rounded-lg shadow-sm">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                                <span className="truncate">Deadline: {format(new Date(assignment.deadline), "dd MMM yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white px-3 py-2 rounded-lg shadow-sm">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                                <span>{submissionCount} / {students.length} Students</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Assigned Students Summary Quick Grid */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100"
                    >
                        <h2 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-wider sm:tracking-[2px] mb-4 sm:mb-6 flex items-center gap-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                            Assigned Students ({students.length})
                        </h2>
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            {students.map((student) => (
                                <div key={student.id} className="relative group">
                                    <div
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ring-2 ring-offset-2 ${student.status !== 'NOT_SUBMITTED'
                                            ? 'bg-emerald-50 text-emerald-600 ring-emerald-400'
                                            : 'bg-gray-50 text-gray-400 ring-gray-100 hover:ring-purple-300'
                                            }`}
                                    >
                                        {student.first_name[0]}{student.last_name[0]}
                                    </div>
                                    {/* Status Dot */}
                                    <div className={`absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${student.status !== 'NOT_SUBMITTED' ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`} />

                                    {/* Hover Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 sm:px-3 py-1 bg-gray-900 text-white text-[9px] sm:text-[10px] rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {student.first_name} {student.last_name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Student Submissions - Desktop Table / Mobile Cards */}
                    <Card className="border-0 shadow-lg sm:shadow-2xl overflow-hidden bg-white rounded-xl sm:rounded-2xl">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                Student Submissions
                            </h2>
                            <div className="flex gap-2">
                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 shadow-none text-xs">
                                    {students.filter(s => s.status !== 'NOT_SUBMITTED').length} Submitted
                                </Badge>
                                <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-100 shadow-none text-xs">
                                    {students.filter(s => s.status === 'NOT_SUBMITTED').length} Pending
                                </Badge>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted On</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                                                        {student.first_name[0]}{student.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{student.first_name} {student.last_name}</p>
                                                        <p className="text-xs text-gray-500">{student.student_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-gray-600">{student.email}</p>
                                                    <p className="text-xs text-gray-500">{student.phone || '-'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.submission ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900">{format(new Date(student.submission.submitted_at), "dd MMM yyyy")}</span>
                                                        <span className="text-xs text-gray-500">{format(new Date(student.submission.submitted_at), "hh:mm a")}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Not submitted</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs
                                                        ${student.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                        ${student.status === 'GRADED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                                        ${student.status === 'NOT_SUBMITTED' ? 'bg-gray-50 text-gray-500 border-gray-200' : ''}
                                                        ${student.status === 'LATE' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                                    `}
                                                >
                                                    {student.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.submission ? (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                                                        onClick={() => setSelectedSubmission(student)}
                                                    >
                                                        View Answer
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-gray-100">
                            {students.map((student) => (
                                <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                                            {student.first_name[0]}{student.last_name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{student.first_name} {student.last_name}</p>
                                            <p className="text-xs text-gray-500">{student.student_code}</p>
                                            <p className="text-xs text-gray-600 truncate mt-1">{student.email}</p>
                                            {student.phone && <p className="text-xs text-gray-500">{student.phone}</p>}
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] flex-shrink-0
                                                ${student.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                ${student.status === 'GRADED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                                ${student.status === 'NOT_SUBMITTED' ? 'bg-gray-50 text-gray-500 border-gray-200' : ''}
                                                ${student.status === 'LATE' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                            `}
                                        >
                                            {student.status.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        {student.submission ? (
                                            <>
                                                <div className="text-xs text-gray-500">
                                                    <span className="block font-medium text-gray-900">{format(new Date(student.submission.submitted_at), "dd MMM yyyy")}</span>
                                                    <span>{format(new Date(student.submission.submitted_at), "hh:mm a")}</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                                                    onClick={() => setSelectedSubmission(student)}
                                                >
                                                    View Answer
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Not submitted yet</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                Submission Details
                            </DialogTitle>
                        </DialogHeader>

                        {selectedSubmission && selectedSubmission.submission && (
                            <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
                                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-base sm:text-lg font-bold text-gray-700 flex-shrink-0">
                                        {selectedSubmission.first_name[0]}{selectedSubmission.last_name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{selectedSubmission.first_name} {selectedSubmission.last_name}</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">Submitted on {format(new Date(selectedSubmission.submission.submitted_at), "PPP 'at' p")}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Student Answer</h4>
                                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base text-gray-700 whitespace-pre-wrap break-words">
                                        {selectedSubmission.submission.submission_text || "No text answer provided."}
                                    </div>
                                </div>

                                {selectedSubmission.submission.submission_file_url && (
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Attached File</h4>
                                        {(() => {
                                            const url = selectedSubmission.submission.submission_file_url!;
                                            const extension = url.split('.').pop()?.toLowerCase();
                                            const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '');

                                            return (
                                                <div className="space-y-3">
                                                    {/* Image Preview */}
                                                    {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '') && (
                                                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex justify-center p-2">
                                                            <img src={url} alt="Attachment" className="max-w-full max-h-[300px] sm:max-h-[500px] object-contain" />
                                                        </div>
                                                    )}

                                                    {/* PDF Preview */}
                                                    {extension === 'pdf' && (
                                                        <div className="w-full h-[300px] sm:h-[500px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                            <iframe src={url} className="w-full h-full" title="PDF Preview" />
                                                        </div>
                                                    )}

                                                    {/* Google Docs Viewer for Office Files */}
                                                    {isDoc && (
                                                        <div className="w-full h-[300px] sm:h-[500px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                            <iframe
                                                                src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                                                                className="w-full h-full"
                                                                title="Document Preview"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Separate View and Download Buttons */}
                                                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                                                        <a
                                                            href={isDoc ? `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=false` : url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
                                                        >
                                                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            View File
                                                        </a>
                                                        <a
                                                            href={url}
                                                            download
                                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
                                                        >
                                                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            Download
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <AcademicManagerBottomNav />
        </div>
    );
}
