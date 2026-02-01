"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    ChevronRight,
    PlayCircle,
    FileText,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    ArrowLeft,
    Plus,
    MoreVertical,
    Eye,
    EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Lesson {
    id: number;
    lesson_title: string;
    lesson_type: string;
    duration_minutes: number;
    is_published: boolean;
}

interface Module {
    id: number;
    module_name: string;
    is_published: boolean;
    lessons: Lesson[];
}

interface CourseDetails {
    id: number;
    course_name: string;
    course_code: string;
    course_description: string;
    thumbnail_url: string;
    is_published: boolean;
    course_modules: Module[];
    _count?: {
        student_enrollments: number;
    };
}

export default function CourseManagementPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("curriculum");

    useEffect(() => {
        if (params.id) {
            fetchCourseDetails();
        }
    }, [params.id]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/courses/${params.id}`);
            if (response.data.success) {
                setCourse(response.data.data);
            }
        } catch (error: any) {
            console.error("Error fetching course:", error);
            toast.error("Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (type: 'module' | 'lesson', id: number, currentStatus: boolean) => {
        try {
            const response = await api.patch(`/ems/courses/content/${type}/${id}/visibility`, {
                is_published: !currentStatus
            });
            if (response.data.success) {
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} ${!currentStatus ? 'published' : 'unpublished'}`);
                fetchCourseDetails(); // Refresh
            }
        } catch (error) {
            toast.error("Failed to update visibility");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <TopNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
                <TutorBottomNav />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col text-center py-20">
                <TopNavbar />
                <AlertCircle className="h-20 w-20 text-red-300 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Course Not Found</h1>
                <Button onClick={() => router.back()} variant="ghost" className="mt-4 mx-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
                <TutorBottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            {/* Sticky Course Header */}
            <div className="bg-white border-b sticky top-[64px] z-30 px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                                    {course.course_code}
                                </span>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {course.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{course.course_name}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="hidden sm:flex">
                            Preview as Student
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Content
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto mt-4 flex gap-6 overflow-x-auto no-scrollbar">
                    {["curriculum", "students", "assignments"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === "curriculum" && (
                        <motion.div
                            key="curriculum"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {course.course_modules.length === 0 ? (
                                <Card className="p-12 text-center border-dashed border-2 bg-gray-50/50">
                                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold">Your curriculum is empty</h3>
                                    <p className="text-gray-500 mb-6">Start by creating your first module and lessons.</p>
                                    <Button className="bg-blue-600">Create First Module</Button>
                                </Card>
                            ) : (
                                course.course_modules.map((module, mIdx) => (
                                    <Card key={module.id} className="border-0 shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                                    {mIdx + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{module.module_name}</h3>
                                                    <p className="text-xs text-gray-500">{module.lessons.length} Lessons</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={module.is_published ? "text-green-600" : "text-orange-500"}
                                                    onClick={() => togglePublish('module', module.id, module.is_published)}
                                                >
                                                    {module.is_published ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                                                    {module.is_published ? 'Live' : 'Hidden'}
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="divide-y">
                                            {module.lessons.map((lesson, lIdx) => (
                                                <div key={lesson.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                            {lIdx + 1}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-semibold text-gray-800">{lesson.lesson_title}</h4>
                                                                {!lesson.is_published && <span className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded uppercase font-bold">Draft</span>}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">
                                                                <Clock className="h-2 w-2" />
                                                                {lesson.duration_minutes}m • {lesson.lesson_type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                                            <PlayCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="w-full py-3 px-6 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2">
                                                <Plus className="h-3 w-3" />
                                                Add Lesson to this Module
                                            </button>
                                        </div>
                                    </Card>
                                ))
                            )}
                            <Button variant="outline" className="w-full py-8 border-dashed border-2 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all">
                                <Plus className="h-5 w-5 mr-2" />
                                Add New Module
                            </Button>
                        </motion.div>
                    )}

                    {activeTab === "students" && (
                        <motion.div
                            key="students"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold">Assigned Student Tracking Coming Soon</h3>
                            <p className="text-gray-500">Student enrollment and progress tracking for this course.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <TutorBottomNav />
        </div>
    );
}
