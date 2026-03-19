"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    BookOpen,
    ChevronDown,
    ChevronRight,
    Eye,
    EyeOff,
    FileText,
    PlayCircle,
    Plus,
    Lock,
    Unlock,
    Loader2,
    CheckCircle2,
    Layers,
    FilePlus,
    Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Material {
    id: number;
    material_name: string;
    material_type: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'ENROLLED';
    file_url: string;
    handbook_type: string;
    target_audience: string;
}

interface Lesson {
    id: number;
    lesson_name: string;
    lesson_number: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'ENROLLED';
    course_materials: Material[];
}

interface Module {
    id: number;
    module_name: string;
    module_number: number;
    visibility: 'PUBLIC' | 'PRIVATE' | 'ENROLLED';
    course_materials?: Material[];
    lessons: Lesson[];
}

interface CourseDetails {
    id: number;
    course_name: string;
    course_code: string;
    course_description: string;
    course_materials?: Material[];
    course_modules: Module[];
}

type CreatorType = 'module' | 'lesson' | 'material';

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<number[]>([]);
    const [expandedLessons, setExpandedLessons] = useState<number[]>([]);
    const [toggling, setToggling] = useState<string | null>(null);

    // Unified Creator State
    const [creatorConfig, setCreatorConfig] = useState<{
        isOpen: boolean;
        activeTab: CreatorType;
        selectedModuleId?: number;
        selectedLessonId?: number;
        moduleTitle?: string;
        lessonTitle?: string;
    }>({ isOpen: false, activeTab: 'module' });

    // Forms
    const [formData, setFormData] = useState({
        module: { name: "", description: "", visibility: "ENROLLED" as const },
        lesson: { name: "", description: "", type: "VIDEO", visibility: "ENROLLED" as const },
        material: {
            name: "",
            type: "DOCUMENT",
            url: "",
            visibility: "ENROLLED" as const,
            handbook_type: "STUDENT_HANDBOOK",
            target_audience: "STUDENTS"
        }
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
    }, [params.id]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/courses/${params.id}`);
            if (response.data.success) {
                setCourse(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching course details:", error);
            toast.error("Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    const openCreator = (type: CreatorType, moduleId?: number, lessonId?: number, modTitle?: string, lesTitle?: string) => {
        setCreatorConfig({
            isOpen: true,
            activeTab: type,
            selectedModuleId: moduleId,
            selectedLessonId: lessonId,
            moduleTitle: modTitle,
            lessonTitle: lesTitle
        });
    };

    const handleCreateModule = async () => {
        if (!formData.module.name) return toast.error("Module name is required");
        try {
            setSubmitting(true);
            const response = await api.post("/ems/modules", {
                course_id: parseInt(params.id as string),
                module_name: formData.module.name,
                module_description: formData.module.description,
                visibility: formData.module.visibility
            });

            if (response.data.success) {
                toast.success("Module created");
                const newModuleId = response.data.data.id;
                await fetchCourseDetails();

                // Switch to Lesson tab for convenience
                setCreatorConfig(prev => ({
                    ...prev,
                    activeTab: 'lesson',
                    selectedModuleId: newModuleId,
                    moduleTitle: formData.module.name
                }));
                setFormData(prev => ({ ...prev, module: { name: "", description: "", visibility: "ENROLLED" } }));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create module");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateLesson = async () => {
        if (!formData.lesson.name) return toast.error("Lesson name is required");
        if (!creatorConfig.selectedModuleId) return toast.error("Please select a module first");

        try {
            setSubmitting(true);
            const response = await api.post("/ems/lessons", {
                course_id: parseInt(params.id as string),
                module_id: creatorConfig.selectedModuleId,
                lesson_name: formData.lesson.name,
                lesson_description: formData.lesson.description,
                lesson_type: formData.lesson.type,
                visibility: formData.lesson.visibility
            });

            if (response.data.success) {
                toast.success("Lesson added");
                const newLessonId = response.data.data.id;
                await fetchCourseDetails();

                // Switch to Material tab for convenience
                setCreatorConfig(prev => ({
                    ...prev,
                    activeTab: 'material',
                    selectedLessonId: newLessonId,
                    lessonTitle: formData.lesson.name
                }));
                setFormData(prev => ({ ...prev, lesson: { name: "", description: "", type: "VIDEO", visibility: "ENROLLED" } }));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add lesson");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateMaterial = async () => {
        if (!formData.material.name || !formData.material.url) return toast.error("Name and URL are required");
        if (!creatorConfig.selectedLessonId) return toast.error("Please select a lesson first");

        try {
            setSubmitting(true);
            const response = await api.post("/ems/materials", {
                course_id: parseInt(params.id as string),
                module_id: creatorConfig.selectedModuleId,
                lesson_id: creatorConfig.selectedLessonId,
                material_name: formData.material.name,
                material_type: formData.material.type,
                file_url: formData.material.url,
                visibility: formData.material.visibility,
                handbook_type: formData.material.handbook_type,
                target_audience: formData.material.target_audience
            });

            if (response.data.success) {
                toast.success("Material attached");
                await fetchCourseDetails();

                // Allow adding more materials or finish
                setFormData(prev => ({
                    ...prev,
                    material: {
                        name: "",
                        type: "DOCUMENT",
                        url: "",
                        visibility: "ENROLLED",
                        handbook_type: "STUDENT_HANDBOOK",
                        target_audience: "STUDENTS"
                    }
                }));
                toast.info("You can add another material or close the window.", { duration: 5000 });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error?.message || "Failed to attach material";
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleVisibility = async (type: 'module' | 'lesson' | 'material', id: number, currentVisibility: string) => {
        const toggleKey = `${type}-${id}`;

        // Cycle visibility: PUBLIC -> ENROLLED -> PRIVATE -> PUBLIC
        const cycle: Record<string, 'PUBLIC' | 'PRIVATE' | 'ENROLLED'> = {
            'PUBLIC': 'ENROLLED',
            'ENROLLED': 'PRIVATE',
            'PRIVATE': 'PUBLIC'
        };
        const nextVisibility = cycle[currentVisibility] || 'PRIVATE';

        try {
            setToggling(toggleKey);
            const response = await api.patch(`/ems/courses/content/${type}/${id}/visibility`, {
                visibility: nextVisibility
            });

            if (response.data.success) {
                toast.success(`Visibility updated to ${nextVisibility}`);
                await fetchCourseDetails();
            }
        } catch (error) {
            console.error("Error toggling visibility:", error);
            toast.error("Failed to update visibility");
        } finally {
            setToggling(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!course) return <div>Course not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerTopNavbar />

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 hover:bg-purple-50 text-purple-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Courses
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{course.course_name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {course.course_code}
                                </span>
                                <span className="text-gray-400 text-sm">•</span>
                                <span className="text-gray-500 text-sm">{course.course_modules?.length || 0} Modules</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-gray-800">Course Curriculum</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                    onClick={() => openCreator('material')}
                                >
                                    <FilePlus className="h-4 w-4 mr-2" />
                                    Add Course Material
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-100"
                                    onClick={() => openCreator('module')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Module
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Course Level Materials */}
                            {course.course_materials && course.course_materials.length > 0 && (
                                <div className="p-4 bg-purple-50/10 border-b border-gray-100">
                                    <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-3 flex items-center gap-2">
                                        <BookOpen className="h-3 w-3" />
                                        Main Course Handbooks & Resources
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {course.course_materials.map(mat => (
                                            <div key={mat.id} className="flex items-center gap-2 bg-white border border-purple-100 px-3 py-1.5 rounded-xl shadow-sm group">
                                                <FileText className={`h-3.5 w-3.5 ${mat.handbook_type === 'TUTOR_HANDBOOK' ? 'text-amber-500' : 'text-blue-500'}`} />
                                                <span className="text-xs font-bold text-gray-700">{mat.material_name}</span>
                                                <span className="text-[10px] font-black text-gray-300 uppercase px-1.5 bg-gray-50 rounded-md">
                                                    {mat.handbook_type === 'TUTOR_HANDBOOK' ? 'TUTOR' : 'STUDENT'}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 rounded-lg hover:bg-purple-50"
                                                    onClick={() => handleToggleVisibility('material', mat.id, mat.visibility)}
                                                >
                                                    {mat.visibility === 'PRIVATE' ? <EyeOff className="h-3 w-3 text-gray-300" /> : <Eye className="h-3 w-3 text-purple-400" />}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {!course.course_modules || course.course_modules.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Layers className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-gray-900 font-semibold mb-1">Start Building your Course</h3>
                                    <p className="text-gray-500 text-sm mb-6">Create modules, add lessons, and upload materials to get started.</p>
                                    <Button
                                        variant="outline"
                                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                        onClick={() => openCreator('module')}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Module
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {course.course_modules.map((module) => (
                                        <div key={module.id} className="bg-white">
                                            {/* Module Row */}
                                            <div
                                                className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors ${expandedModules.includes(module.id) ? 'bg-purple-50/20' : ''}`}
                                                onClick={() => setExpandedModules(prev => prev.includes(module.id) ? prev.filter(id => id !== module.id) : [...prev, module.id])}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {expandedModules.includes(module.id) ?
                                                        <ChevronDown className="h-5 w-5 text-purple-400" /> :
                                                        <ChevronRight className="h-5 w-5 text-gray-300" />
                                                    }
                                                    <span className="font-bold text-gray-800 flex items-center gap-2">
                                                        {module.module_name}
                                                        {module.visibility === 'PRIVATE' && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50 rounded-lg"
                                                        title="Add Material to Module"
                                                        onClick={() => openCreator('material', module.id, undefined, module.module_name)}
                                                    >
                                                        <FilePlus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className={`h-8 gap-2 px-3 text-xs font-bold transition-all ${module.visibility === 'PUBLIC' ? 'text-blue-600 hover:bg-blue-50' :
                                                            module.visibility === 'ENROLLED' ? 'text-green-600 hover:bg-green-50' :
                                                                'text-gray-400 hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => handleToggleVisibility('module', module.id, module.visibility)}
                                                        disabled={toggling === `module-${module.id}`}
                                                    >
                                                        {toggling === `module-${module.id}` ?
                                                            <Loader2 className="h-3 w-3 animate-spin" /> :
                                                            module.visibility === 'PUBLIC' ? <Eye className="h-3 w-3" /> :
                                                                module.visibility === 'ENROLLED' ? <Unlock className="h-3 w-3" /> :
                                                                    <Lock className="h-3 w-3" />
                                                        }
                                                        {module.visibility}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Module Materials */}
                                            {expandedModules.includes(module.id) && module.course_materials && module.course_materials.length > 0 && (
                                                <div className="px-10 py-2 bg-gray-50/50 flex flex-wrap gap-2 border-b border-gray-50">
                                                    {module.course_materials.map(mat => (
                                                        <div key={mat.id} className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1 rounded-xl group/mat shadow-sm text-[11px] font-bold text-gray-600">
                                                            <FileText className={`h-3 w-3 ${mat.handbook_type === 'TUTOR_HANDBOOK' ? 'text-amber-500' : 'text-blue-500'}`} />
                                                            <span>{mat.material_name}</span>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-5 w-5 p-0"
                                                                onClick={() => handleToggleVisibility('material', mat.id, mat.visibility)}
                                                            >
                                                                {mat.visibility === 'PRIVATE' ? <EyeOff className="h-2.5 w-2.5 text-gray-300" /> : <Eye className="h-2.5 w-2.5 text-purple-400" />}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Lessons List */}
                                            <AnimatePresence>
                                                {expandedModules.includes(module.id) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden border-t border-gray-50 bg-gray-50/30"
                                                    >
                                                        <div className="pl-6 divide-y divide-gray-50">
                                                            {module.lessons?.map((lesson) => (
                                                                <div key={lesson.id} className="group">
                                                                    <div
                                                                        className="p-3 flex items-center justify-between hover:bg-white transition-colors cursor-pointer"
                                                                        onClick={() => setExpandedLessons(prev => prev.includes(lesson.id) ? prev.filter(id => id !== lesson.id) : [...prev, lesson.id])}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-xs font-bold text-purple-400 w-8">{lesson.lesson_number}</span>
                                                                            <PlayCircle className={`h-4 w-4 ${lesson.visibility !== 'PRIVATE' ? 'text-purple-500' : 'text-gray-300'}`} />
                                                                            <span className="text-sm font-medium text-gray-700">{lesson.lesson_name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className={`h-7 px-2 text-[10px] uppercase font-bold tracking-wider ${lesson.visibility === 'PUBLIC' ? 'text-blue-600 hover:bg-blue-50' :
                                                                                    lesson.visibility === 'ENROLLED' ? 'text-green-600 hover:bg-green-50' :
                                                                                        'text-gray-400 hover:bg-gray-100'
                                                                                    }`}
                                                                                onClick={() => handleToggleVisibility('lesson', lesson.id, lesson.visibility)}
                                                                                disabled={toggling === `lesson-${lesson.id}`}
                                                                            >
                                                                                {lesson.visibility === 'PRIVATE' ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                                                                                {lesson.visibility}
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Materials List */}
                                                                    <AnimatePresence>
                                                                        {expandedLessons.includes(lesson.id) && (
                                                                            <motion.div
                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                animate={{ height: "auto", opacity: 1 }}
                                                                                exit={{ height: 0, opacity: 0 }}
                                                                                className="overflow-hidden bg-white/50"
                                                                            >
                                                                                <div className="pl-10 space-y-1 pb-2 pt-1">
                                                                                    {lesson.course_materials?.map(mat => (
                                                                                        <div key={mat.id} className="flex items-center justify-between p-2 pr-4 rounded-lg hover:bg-white text-xs text-gray-600 group/mat">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <FileText className="h-3.5 w-3.5 text-blue-500" />
                                                                                                <span>{mat.material_name}</span>
                                                                                            </div>
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                className={`h-6 px-1 transition-opacity ${mat.visibility === 'PUBLIC' ? 'text-blue-500' : mat.visibility === 'ENROLLED' ? 'text-green-500' : 'text-gray-300'}`}
                                                                                                onClick={() => handleToggleVisibility('material', mat.id, mat.visibility)}
                                                                                            >
                                                                                                {mat.visibility === 'PRIVATE' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                                                            </Button>
                                                                                        </div>
                                                                                    ))}
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        className="h-8 text-[11px] text-purple-600 hover:text-purple-700 hover:bg-purple-50 w-full justify-start pl-2 font-medium"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            openCreator('material', module.id, lesson.id, module.module_name, lesson.lesson_name);
                                                                                        }}
                                                                                    >
                                                                                        <Plus className="h-3 w-3 mr-2" />
                                                                                        Add Material to "{lesson.lesson_name}"
                                                                                    </Button>
                                                                                </div>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                variant="ghost"
                                                                className="p-3 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50/50 w-full justify-start pl-3 font-semibold"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openCreator('lesson', module.id, undefined, module.module_name);
                                                                }}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add Lesson to "{module.module_name}"
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Unified Smart Creator Modal */}
            <Dialog open={creatorConfig.isOpen} onOpenChange={(val) => setCreatorConfig(prev => ({ ...prev, isOpen: val }))}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
                    {/* Header with Step indicator */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white text-center">
                        <div className="flex justify-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${creatorConfig.activeTab === 'module' ? 'bg-white text-purple-600 border-white scale-110' : 'border-purple-300 text-purple-100 opacity-60'}`}>
                                <Layers className="h-5 w-5" />
                            </div>
                            <div className="w-8 h-px bg-purple-300 self-center opacity-40" />
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${creatorConfig.activeTab === 'lesson' ? 'bg-white text-purple-600 border-white scale-110' : 'border-purple-300 text-purple-100 opacity-60'}`}>
                                <Video className="h-5 w-5" />
                            </div>
                            <div className="w-8 h-px bg-purple-300 self-center opacity-40" />
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${creatorConfig.activeTab === 'material' ? 'bg-white text-purple-600 border-white scale-110' : 'border-purple-300 text-purple-100 opacity-60'}`}>
                                <FilePlus className="h-5 w-5" />
                            </div>
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            {creatorConfig.activeTab === 'module' && "Create Course Module"}
                            {creatorConfig.activeTab === 'lesson' && "Add New Lesson"}
                            {creatorConfig.activeTab === 'material' && "Attach Material"}
                        </DialogTitle>
                        <DialogDescription className="text-purple-100 mt-1 opacity-90">
                            {creatorConfig.activeTab === 'lesson' && `Inside: ${creatorConfig.moduleTitle}`}
                            {creatorConfig.activeTab === 'material' && `Inside: ${creatorConfig.lessonTitle}`}
                            {creatorConfig.activeTab === 'module' && "Group your lessons into logical sections"}
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-5 bg-white">
                        {/* Tab Content: MODULE */}
                        {creatorConfig.activeTab === 'module' && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Module Name</Label>
                                    <Input
                                        value={formData.module.name}
                                        onChange={e => setFormData({ ...formData, module: { ...formData.module, name: e.target.value } })}
                                        placeholder="e.g., Fundamentals of Design"
                                        className="h-11 bg-gray-50 border-gray-100 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Description (Optional)</Label>
                                    <Textarea
                                        value={formData.module.description}
                                        onChange={e => setFormData({ ...formData, module: { ...formData.module, description: e.target.value } })}
                                        placeholder="Briefly state what will be covered..."
                                        className="bg-gray-50 border-gray-100 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Initial Visibility</Label>
                                    <select
                                        className="w-full h-11 px-3 rounded-md border border-gray-100 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                        value={formData.module.visibility}
                                        onChange={e => setFormData({ ...formData, module: { ...formData.module, visibility: e.target.value as any } })}
                                    >
                                        <option value="PRIVATE">Private (Draft)</option>
                                        <option value="ENROLLED">Enrolled Only (Paid)</option>
                                        <option value="PUBLIC">Public (Free Preview)</option>
                                    </select>
                                </div>
                                <Button className="w-full h-11 bg-purple-600 hover:bg-purple-700 font-bold text-white shadow-lg shadow-purple-100" onClick={handleCreateModule} disabled={submitting}>
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Create Module & Next
                                </Button>
                            </motion.div>
                        )}

                        {/* Tab Content: LESSON */}
                        {creatorConfig.activeTab === 'lesson' && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Lesson Name</Label>
                                    <Input
                                        value={formData.lesson.name}
                                        onChange={e => setFormData({ ...formData, lesson: { ...formData.lesson, name: e.target.value } })}
                                        placeholder="e.g., Intro to Layering"
                                        className="h-11 bg-gray-50 border-gray-100 focus:bg-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-bold">Lesson Type</Label>
                                        <select
                                            className="w-full h-11 px-3 rounded-md border border-gray-100 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                            value={formData.lesson.type}
                                            onChange={e => setFormData({ ...formData, lesson: { ...formData.lesson, type: e.target.value } })}
                                        >
                                            <option value="VIDEO">Video</option>
                                            <option value="TEXT">Article</option>
                                            <option value="QUIZ">Quiz</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-bold">In Module</Label>
                                        <div className="h-11 px-3 rounded-md border border-gray-100 bg-gray-100/50 flex items-center text-sm text-gray-500 font-medium truncate">
                                            {creatorConfig.moduleTitle}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Visibility</Label>
                                    <select
                                        className="w-full h-11 px-3 rounded-md border border-gray-100 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                        value={formData.lesson.visibility}
                                        onChange={e => setFormData({ ...formData, lesson: { ...formData.lesson, visibility: e.target.value as any } })}
                                    >
                                        <option value="PRIVATE">Private (Draft)</option>
                                        <option value="ENROLLED">Enrolled Only (Paid)</option>
                                        <option value="PUBLIC">Public (Free Preview)</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button variant="ghost" className="flex-1 h-11 text-gray-400 font-bold" onClick={() => setCreatorConfig(prev => ({ ...prev, isOpen: false }))}>
                                        Done
                                    </Button>
                                    <Button className="flex-[2] h-11 bg-purple-600 hover:bg-purple-700 font-bold text-white shadow-lg shadow-purple-100" onClick={handleCreateLesson} disabled={submitting}>
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                        Add Lesson & Next
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Tab Content: MATERIAL */}
                        {creatorConfig.activeTab === 'material' && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Material Title</Label>
                                    <Input
                                        value={formData.material.name}
                                        onChange={e => setFormData({ ...formData, material: { ...formData.material, name: e.target.value } })}
                                        placeholder="e.g., Color Palette PDF"
                                        className="h-11 bg-gray-50 border-gray-100 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Resource Link (S3/Drive)</Label>
                                    <Input
                                        value={formData.material.url}
                                        onChange={e => setFormData({ ...formData, material: { ...formData.material, url: e.target.value } })}
                                        placeholder="https://..."
                                        className="h-11 bg-gray-50 border-gray-100 focus:bg-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-bold">Category</Label>
                                        <select
                                            className="w-full h-11 px-3 rounded-md border border-gray-100 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                            value={formData.material.handbook_type}
                                            onChange={e => setFormData({ ...formData, material: { ...formData.material, handbook_type: e.target.value } })}
                                        >
                                            <option value="STUDENT_HANDBOOK">Student Handbook</option>
                                            <option value="TUTOR_HANDBOOK">Tutor Handbook</option>
                                            <option value="GENERAL_RESOURCE">General Resource</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-bold">Audience</Label>
                                        <select
                                            className="w-full h-11 px-3 rounded-md border border-gray-100 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                            value={formData.material.target_audience}
                                            onChange={e => setFormData({ ...formData, material: { ...formData.material, target_audience: e.target.value } })}
                                        >
                                            <option value="STUDENTS">Students Only</option>
                                            <option value="TUTORS">Tutors Only</option>
                                            <option value="BOTH">Everyone</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Visibility Status</Label>
                                    <select
                                        className="w-full h-11 px-3 rounded-md border border-gray-100 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                        value={formData.material.visibility}
                                        onChange={e => setFormData({ ...formData, material: { ...formData.material, visibility: e.target.value as any } })}
                                    >
                                        <option value="PRIVATE">Private (Draft)</option>
                                        <option value="ENROLLED">Enrolled Only (Paid)</option>
                                        <option value="PUBLIC">Public (Free Preview)</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" className="flex-1 h-11 border-purple-200 text-purple-600 font-bold" onClick={() => setCreatorConfig(prev => ({ ...prev, isOpen: false }))}>
                                        I'm Finished
                                    </Button>
                                    <Button className="flex-[2] h-11 bg-purple-600 hover:bg-purple-700 font-bold text-white shadow-lg shadow-purple-100" onClick={handleCreateMaterial} disabled={submitting}>
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                        Attach & Stay
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AcademicManagerBottomNav />
        </div>
    );
}
