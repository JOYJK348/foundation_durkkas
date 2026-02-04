"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    BookOpen,
    ChevronDown,
    ChevronRight,
    FileText,
    PlayCircle,
    Loader2,
    Lock,
    CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Material {
    id: number;
    material_name: string;
    material_type: string;
    file_url: string;
}

interface Lesson {
    id: number;
    lesson_name: string;
    lesson_number: string;
    is_locked: boolean;
    course_materials: Material[];
}

interface Module {
    id: number;
    module_name: string;
    module_number: number;
    lessons: Lesson[];
}

interface CourseDetails {
    id: number;
    course_name: string;
    course_code: string;
    course_description: string;
    course_modules: Module[];
}

export default function StudentCourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<number[]>([]);

    useEffect(() => {
        fetchCourseDetails();
    }, [params.id]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/courses/${params.id}`);
            if (response.data.success) {
                setCourse(response.data.data);
                // Expand the first module by default
                if (response.data.data.course_modules?.length > 0) {
                    setExpandedModules([response.data.data.course_modules[0].id]);
                }
            }
        } catch (error: any) {
            console.error("Error fetching course details:", error);
            if (error.response?.status === 403) {
                toast.error("Not enrolled or content locked");
            } else {
                toast.error("Failed to load course materials");
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (id: number) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <TopNavbar />
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-500 font-medium">Unlocking your learning material...</p>
                </div>
                <BottomNav />
            </div>
        );
    }

    if (!course) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Lock className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Access Restricted</h2>
            <p className="text-gray-500 text-center mt-2">This course is either not available or you are not enrolled.</p>
            <Button onClick={() => router.push('/ems/student/courses')} className="mt-6 bg-blue-600">Back to Courses</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 hover:bg-white text-gray-500"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100">
                            <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{course.course_name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">{course.course_code}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-500">Curriculum controlled by Tutor</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 ml-1">Learning Curriculum</h2>

                    {(!course.course_modules || course.course_modules.length === 0) ? (
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-12 text-center text-gray-500">
                                <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No items have been published for this course yet.</p>
                                <p className="text-xs mt-2">Check back later when your tutor releases the first section.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {course.course_modules.map((module) => (
                                <div key={module.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    {/* Module Header */}
                                    <div
                                        className={`p-5 flex items-center justify-between cursor-pointer group hover:bg-gray-50 transition-colors ${expandedModules.includes(module.id) ? 'border-b border-gray-50' : ''}`}
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                                                {module.module_number}
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-lg">{module.module_name}</h3>
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">{module.lessons?.length || 0} Lessons</span>
                                    </div>

                                    {/* Lessons list */}
                                    <AnimatePresence>
                                        {expandedModules.includes(module.id) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-2 space-y-2">
                                                    {module.lessons?.map((lesson) => (
                                                        <div key={lesson.id} className={`p-4 rounded-xl transition-all ${lesson.is_locked ? 'bg-gray-100/30 grayscale-[50%]' : 'bg-gray-50/50 hover:bg-gray-50'}`}>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-bold text-blue-400 w-8">{lesson.lesson_number}</span>
                                                                    <PlayCircle className={`h-5 w-5 ${lesson.is_locked ? 'text-gray-400' : 'text-blue-600'}`} />
                                                                    <span className={`font-semibold ${lesson.is_locked ? 'text-gray-400' : 'text-gray-800'}`}>{lesson.lesson_name}</span>
                                                                </div>
                                                                {lesson.is_locked ? <Lock className="h-4 w-4 text-gray-400" /> : <CheckCircle className="h-4 w-4 text-gray-300" />}
                                                            </div>

                                                            {!lesson.is_locked && (
                                                                <div className="pl-8 space-y-2 border-l-2 border-gray-100 mt-2">
                                                                    {lesson.course_materials?.map(mat => (
                                                                        <div key={mat.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                                                            <div className="flex items-center gap-3">
                                                                                <FileText className="h-4 w-4 text-blue-500" />
                                                                                <span className="text-sm font-medium text-gray-700">{mat.material_name}</span>
                                                                            </div>
                                                                            <Button size="sm" variant="ghost" className="h-8 text-blue-600 font-bold text-[10px] uppercase tracking-tighter hover:bg-blue-50">
                                                                                Download
                                                                            </Button>
                                                                        </div>
                                                                    ))}

                                                                    {(!lesson.course_materials || lesson.course_materials.length === 0) && (
                                                                        <p className="text-[10px] text-gray-400 italic">No files attached to this lesson.</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {lesson.is_locked && (
                                                                <p className="pl-11 text-[10px] text-gray-400 font-medium">✨ Enroll in the course to unlock this content</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
