"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowLeft,
    FileText,
    Clock,
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

export default function AssignmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignmentDetails();
    }, [params.id]);

    const fetchAssignmentDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/students/my-assignments`);
            if (response.data.success) {
                const found = response.data.data.find((a: any) => a.id.toString() === params.id);
                setAssignment(found);
            }
        } catch (error: any) {
            toast.error("Failed to load assignment details");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        // Simulate submission as actual submission endpoint might not be ready
        setTimeout(() => {
            setSubmitting(false);
            toast.success("Assignment submitted successfully!");
            router.push("/ems/student/assignments");
        }, 1500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <TopNavbar />
                <div className="flex flex-col items-center justify-center py-40 text-gray-500">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
                    <p>Loading assignment...</p>
                </div>
                <BottomNav />
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Assignment Not Found</h2>
                <Button onClick={() => router.push('/ems/student/assignments')} className="mt-6 bg-blue-600">Back to Assignments</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 hover:bg-white text-gray-500"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                </Button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-0 shadow-xl overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{assignment.assignment_title}</h1>
                                    <p className="text-blue-100 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        {assignment.course_name}
                                    </p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                                    <p className="text-xs uppercase font-bold text-blue-100 mb-1">Max Score</p>
                                    <p className="text-2xl font-black">{assignment.max_marks || 100}</p>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {assignment.assignment_description || "No detailed description provided for this assignment."}
                                        </p>
                                    </div>

                                    {assignment.status === 'NOT_SUBMITTED' ? (
                                        <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50/50">
                                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h4 className="font-bold text-gray-900 mb-2">Upload Your Solution</h4>
                                            <p className="text-sm text-gray-500 mb-6">PDF, ZIP or DOCX files accepted (Max 10MB)</p>
                                            <input type="file" className="hidden" id="assignment-upload" />
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="bg-blue-600 hover:bg-blue-700 px-8 h-12 rounded-xl"
                                            >
                                                {submitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Upload className="h-5 w-5 mr-2" />}
                                                Submit Assignment
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-green-900">Successfully Submitted</h4>
                                                <p className="text-sm text-green-700">Your assignment is under review by the tutor.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Deadlines</h3>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Submission Due</p>
                                                <p className="font-bold text-gray-900">{new Date(assignment.deadline).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs p-3 bg-white rounded-xl border border-gray-100">
                                            <AlertCircle className="h-4 w-4 text-orange-500" />
                                            <p className="text-gray-600">Late submissions may attract marks penalty.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    );
}
