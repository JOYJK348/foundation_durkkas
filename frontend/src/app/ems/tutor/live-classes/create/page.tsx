"use client";

import React, { useState, useEffect } from "react";
import {
    Video,
    Calendar,
    Clock,
    BookOpen,
    ArrowLeft,
    Plus,
    Loader2,
    CheckCircle2,
    Users,
    Link as LinkIcon,
    Info,
    Layout,
    Target
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CreateLiveClassPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        course_id: "",
        batch_id: "",
        topic: "",
        description: "",
        scheduled_date: "",
        scheduled_time: "",
        duration_minutes: 60,
        meeting_link: "",
        provider: "ZOOM"
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get("/ems/courses");
            setCourses(res.data.data || []);
        } catch (error) {
            toast.error("Failed to load courses");
        }
    };

    const fetchBatches = async (courseId: string) => {
        try {
            const res = await api.get(`/ems/batches?course_id=${courseId}`);
            setBatches(res.data.data || []);
        } catch (error) {
            toast.error("Failed to load batches");
        }
    };

    const handleCourseChange = (v: string) => {
        setFormData({ ...formData, course_id: v, batch_id: "" });
        fetchBatches(v);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.post("/ems/live-classes", {
                ...formData,
                course_id: Number(formData.course_id),
                batch_id: Number(formData.batch_id),
                duration_minutes: Number(formData.duration_minutes)
            });

            if (response.data.success) {
                toast.success("Live class scheduled and sent for approval!");
                router.push("/ems/tutor/live-classes"); // Assuming this exists or redirect dashboard
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to schedule live class");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 rounded-2xl hover:bg-white shadow-sm transition-all group"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Schedule
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase mb-2">Request Live Session Approval</h1>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card className="border-0 shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                                            <Layout className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-tight text-gray-900">Live Session Details</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1" htmlFor="course">Course</Label>
                                            <Select value={formData.course_id} onValueChange={handleCourseChange}>
                                                <SelectTrigger id="course" className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                                                    <SelectValue placeholder="Select Course" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-gray-100 font-bold">
                                                    {courses.map(course => (
                                                        <SelectItem key={course.id} value={course.id.toString()}>{course.course_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1" htmlFor="batch">Target Batch</Label>
                                            <Select
                                                value={formData.batch_id}
                                                onValueChange={(v) => setFormData({ ...formData, batch_id: v })}
                                                disabled={!formData.course_id}
                                            >
                                                <SelectTrigger id="batch" className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                                                    <SelectValue placeholder="Select Batch" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-gray-100 font-bold">
                                                    {batches.map(batch => (
                                                        <SelectItem key={batch.id} value={batch.id.toString()}>{batch.batch_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Session Topic</Label>
                                        <Input
                                            placeholder="e.g. Introduction to Advanced React Patterns"
                                            className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Agenda / Description</Label>
                                        <Textarea
                                            placeholder="What will students learn in this session?"
                                            className="rounded-2xl border-gray-100 bg-gray-50/50 font-medium px-6 py-4 min-h-[120px]"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                            <Clock className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-tight text-gray-900">Schedule & Platform</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Date</Label>
                                            <Input
                                                type="date"
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6"
                                                value={formData.scheduled_date}
                                                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Start Time</Label>
                                            <Input
                                                type="time"
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6"
                                                value={formData.scheduled_time}
                                                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Duration (Minutes)</Label>
                                            <Input
                                                type="number"
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6"
                                                value={formData.duration_minutes}
                                                onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Platform</Label>
                                            <Select value={formData.provider} onValueChange={(v) => setFormData({ ...formData, provider: v })}>
                                                <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-gray-100 font-bold">
                                                    <SelectItem value="ZOOM">Zoom Meetings</SelectItem>
                                                    <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                                                    <SelectItem value="MS_TEAMS">Microsoft Teams</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Meeting Link</Label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                placeholder="https://zoom.us/j/..."
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold pl-14"
                                                value={formData.meeting_link}
                                                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 rounded-[1.5rem] bg-gray-900 hover:bg-black text-white font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Schedule for Approval"
                                )}
                            </Button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-gray-900 text-white overflow-hidden">
                            <CardContent className="p-8">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                    <Clock className="h-7 w-7 text-rose-400" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4">Scheduling Flow</h3>
                                <div className="space-y-4 text-gray-400 font-medium text-sm leading-relaxed">
                                    <p className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <span>All live classes must be approved by the Academic Manager.</span>
                                    </p>
                                    <p className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <span>Once approved, students in the target batch will receive notifications.</span>
                                    </p>
                                    <p className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <span>The link will be visible on the student dashboard 15 mins before start.</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                <Info className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase text-[10px] tracking-widest text-blue-600 mb-1">Live Class Tip</h4>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Record your sessions and upload them as course materials later for students who might miss the live experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateLiveClassPage;
