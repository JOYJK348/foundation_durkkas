"use client";

import React, { useState, useEffect } from "react";
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Filter,
    Search,
    MoreVertical,
    Check,
    X,
    FileText,
    BookOpen,
    ClipboardList,
    GraduationCap,
    Layout,
    Users,
    Video,
    CalendarCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ApprovalsPage = () => {
    const [loading, setLoading] = useState(true);
    const [pendingData, setPendingData] = useState<any>({
        courses: [],
        lessons: [],
        materials: [],
        assignments: [],
        quizzes: [],
        batches: [],
        live_classes: [],
        attendance_sessions: []
    });
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [rejectModal, setRejectModal] = useState<{ open: boolean, type: string, id: number, reason: string }>({
        open: false,
        type: "",
        id: 0,
        reason: ""
    });

    useEffect(() => {
        fetchPendingItems();
    }, []);

    const fetchPendingItems = async () => {
        try {
            setLoading(true);
            const res = await api.get("/ems/approvals");
            setPendingData(res.data.data);
        } catch (error) {
            console.error("Failed to fetch pending items", error);
            toast.error("Failed to load approval requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type: string, id: number, action: "APPROVE" | "REJECT", reason?: string) => {
        try {
            await api.post("/ems/approvals", { type, id, action, reason });
            toast.success(`Item ${action.toLowerCase()}d successfully`);
            fetchPendingItems();
            if (action === "REJECT") setRejectModal({ ...rejectModal, open: false, reason: "" });
        } catch (error) {
            toast.error(`Failed to ${action.toLowerCase()} item`);
        }
    };

    const getAllItems = () => {
        const items = [
            ...pendingData.courses.map((i: any) => ({ ...i, type: 'course', displayType: 'Course', icon: BookOpen })),
            ...pendingData.lessons.map((i: any) => ({ ...i, type: 'lesson', displayType: 'Lesson', icon: Layout })),
            ...pendingData.materials.map((i: any) => ({ ...i, type: 'material', displayType: 'Material', icon: FileText })),
            ...pendingData.assignments.map((i: any) => ({ ...i, type: 'assignment', displayType: 'Assignment', icon: ClipboardList })),
            ...pendingData.quizzes.map((i: any) => ({ ...i, type: 'quiz', displayType: 'Quiz', icon: GraduationCap })),
            ...pendingData.batches.map((i: any) => ({ ...i, type: 'batch', displayType: 'Batch', icon: Users })),
            ...pendingData.live_classes.map((i: any) => ({ ...i, type: 'live_class', displayType: 'Live Class', icon: Video })),
            ...pendingData.attendance_sessions.map((i: any) => ({ ...i, type: 'attendance_session', displayType: 'Attendance', icon: CalendarCheck }))
        ];

        return items.filter(item => {
            const matchesSearch = (item.course_name || item.lesson_name || item.material_name || item.assignment_title || item.quiz_title || item.batch_name || item.topic)
                ?.toLowerCase().includes(searchQuery.toLowerCase());

            if (activeTab === "all") return matchesSearch;
            return item.type === activeTab && matchesSearch;
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    };

    const items = getAllItems();

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase mb-2">Review Center</h1>
                    <p className="text-gray-500 font-medium">Approve or reject content submitted by tutors.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/30">
                        <Clock className="h-5 w-5" />
                        <span className="font-black text-sm uppercase tracking-widest">{items.length} Pending</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-wrap items-center gap-4">
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex-wrap">
                    {["all", "course", "lesson", "batch", "live_class", "attendance_session", "material", "assignment", "quiz"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? "bg-gray-900 text-white shadow-md"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by title or course..."
                        className="pl-11 rounded-2xl border-gray-200 focus:ring-blue-500 h-11 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm text-center">Loading Review Queue...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-32 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-12 w-12 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tighter">Everything Cleared!</h3>
                            <p className="text-gray-400 mt-2 font-medium max-w-xs">There are no pending items that require your review at this moment.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 py-6 px-8">Content Info</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Context</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Submission Date</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 text-right pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {items.map((item) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={`${item.type}-${item.id}`}
                                            className="group hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <TableCell className="py-6 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${item.type === 'course' ? 'bg-blue-50 text-blue-600' :
                                                        item.type === 'lesson' ? 'bg-indigo-50 text-indigo-600' :
                                                            item.type === 'batch' ? 'bg-emerald-50 text-emerald-600' :
                                                                item.type === 'live_class' ? 'bg-rose-50 text-rose-600' :
                                                                    item.type === 'attendance_session' ? 'bg-amber-50 text-amber-600' :
                                                                        item.type === 'material' ? 'bg-orange-50 text-orange-600' :
                                                                            'bg-purple-50 text-purple-600'
                                                        }`}>
                                                        <item.icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <Badge variant="outline" className="mb-1 rounded-md bg-white font-black text-[9px] uppercase tracking-tighter">
                                                            {item.displayType}
                                                        </Badge>
                                                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors capitalize">
                                                            {item.course_name || item.lesson_name || item.material_name || item.assignment_title || item.quiz_title || item.batch_name || item.topic || `Session ${item.id}`}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                                                        {item.course?.course_name || 'Main Content'}
                                                    </span>
                                                    {item.batch_name && (
                                                        <span className="text-[10px] text-gray-400 font-medium">Batch: {item.batch_name}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-medium text-gray-500">
                                                    {new Date(item.created_at).toLocaleDateString(undefined, {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleAction(item.type, item.id, "APPROVE")}
                                                        className="rounded-xl h-10 w-10 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setRejectModal({ open: true, type: item.type, id: item.id, reason: "" })}
                                                        className="rounded-xl h-10 w-10 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Reject Modal */}
            <Dialog
                open={rejectModal.open}
                onOpenChange={(open) => !open && setRejectModal({ ...rejectModal, open: false })}
            >
                <DialogContent className="sm:max-w-md rounded-[2rem] border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase text-gray-900 tracking-tight flex items-center gap-3">
                            <XCircle className="h-8 w-8 text-rose-500" />
                            Content Rejection
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium">
                            Please provide a brief explanation for rejecting this content. This feedback will be sent to the tutor.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for rejection (e.g., Update content hierarchy, Check video quality...)"
                            className="rounded-[1.5rem] border-gray-100 bg-gray-50/50 focus:ring-rose-500 min-h-[120px] font-medium"
                            value={rejectModal.reason}
                            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            className="rounded-2xl font-black uppercase text-xs tracking-widest text-gray-500 hover:bg-gray-100"
                            onClick={() => setRejectModal({ ...rejectModal, open: false })}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-xs tracking-widest px-8 shadow-lg shadow-rose-500/30"
                            disabled={!rejectModal.reason.trim()}
                            onClick={() => handleAction(rejectModal.type, rejectModal.id, "REJECT", rejectModal.reason)}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ApprovalsPage;
