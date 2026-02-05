"use client";

import { useState, useEffect } from "react";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    BookOpen,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Clock,
    CheckCircle2,
    Loader2,
    Hammer,
    X,
    Target,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Quiz {
    id: number;
    quiz_title: string;
    quiz_description: string;
    course_id: number;
    total_marks: number;
    pass_marks: number;
    duration_minutes: number;
    max_attempts?: number;
    is_active: boolean;
    created_at: string;
    courses?: {
        course_name: string;
        course_code: string;
    };
}

export default function TutorQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        quiz_title: "",
        quiz_description: "",
        course_id: "",
        total_marks: 100,
        duration_minutes: 60,
        max_attempts: 3,
        passing_marks: 40,
    });

    useEffect(() => {
        fetchQuizzes();
        fetchCourses();
    }, []);

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

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/quizzes");
            if (response.data.success) {
                setQuizzes(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Error fetching quizzes:", error);
            toast.error(error.response?.data?.message || "Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        try {
            const response = await api.delete(`/ems/quizzes/${id}`);
            if (response.data.success) {
                toast.success("Quiz deleted successfully");
                fetchQuizzes();
            }
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast.error("Failed to delete quiz");
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const payload = {
                ...formData,
                course_id: parseInt(formData.course_id),
            };

            const response = editingQuiz
                ? await api.patch(`/ems/quizzes/${editingQuiz.id}`, payload)
                : await api.post("/ems/quizzes", payload);

            if (response.data.success) {
                toast.success(editingQuiz ? "Quiz updated successfully" : "Quiz created successfully");
                setShowModal(false);
                setEditingQuiz(null);
                resetForm();
                fetchQuizzes();
            }
        } catch (error: any) {
            console.error("Error saving quiz:", error);
            toast.error(error.response?.data?.message || "Failed to save quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setEditingQuiz(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (quiz: Quiz) => {
        setEditingQuiz(quiz);
        setFormData({
            quiz_title: quiz.quiz_title,
            quiz_description: quiz.quiz_description,
            course_id: quiz.course_id.toString(),
            total_marks: quiz.total_marks,
            duration_minutes: quiz.duration_minutes,
            max_attempts: quiz.max_attempts || 3,
            passing_marks: quiz.pass_marks || 40,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            quiz_title: "",
            quiz_description: "",
            course_id: "",
            total_marks: 100,
            duration_minutes: 60,
            max_attempts: 3,
            passing_marks: 40,
        });
    };

    const filteredQuizzes = quizzes.filter((quiz) =>
        quiz.quiz_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            My Quizzes
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Create and manage course assessments
                        </p>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Quiz
                    </Button>
                </div>

                {/* Search */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search quizzes..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quizzes Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600">Loading quizzes...</span>
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <BookOpen className="h-20 w-20 text-blue-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Quizzes Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first quiz to assess student learning
                            </p>
                            <Button
                                onClick={openCreateModal}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Quiz
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <BookOpen className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {quiz.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg mt-3 line-clamp-2">
                                            {quiz.quiz_title}
                                        </CardTitle>
                                        {quiz.courses && (
                                            <p className="text-sm text-blue-600 font-medium">
                                                {quiz.courses.course_name}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {quiz.quiz_description || "No description"}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Total Marks</p>
                                                    <p className="font-semibold">{quiz.total_marks}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-orange-500" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Duration</p>
                                                    <p className="font-semibold">{quiz.duration_minutes}m</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="grid grid-cols-3 gap-2 w-full">
                                                <Link href={`/ems/tutor/quizzes/view?id=${quiz.id}`} className="w-full">
                                                    <Button size="sm" variant="outline" className="w-full">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link href={`/ems/tutor/quizzes/builder?id=${quiz.id}`} className="w-full">
                                                    <Button size="sm" variant="outline" className="w-full bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
                                                        <Hammer className="h-4 w-4 mr-1" />
                                                        Build
                                                    </Button>
                                                </Link>
                                                <Link href={`/ems/tutor/quizzes/${quiz.id}/results`} className="w-full">
                                                    <Button size="sm" variant="outline" className="w-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Results
                                                    </Button>
                                                </Link>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => openEditModal(quiz)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDelete(quiz.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                            Quiz Title
                                        </label>
                                        <Input
                                            required
                                            placeholder="e.g. Midterm Assessment"
                                            value={formData.quiz_title}
                                            onChange={(e) => setFormData({ ...formData, quiz_title: e.target.value })}
                                            className="h-12 border-gray-200 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                            Description
                                        </label>
                                        <Textarea
                                            placeholder="What is this quiz about?"
                                            value={formData.quiz_description}
                                            onChange={(e) => setFormData({ ...formData, quiz_description: e.target.value })}
                                            className="border-gray-200 focus:border-blue-500"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                            Assigned Course
                                        </label>
                                        <select
                                            required
                                            value={formData.course_id}
                                            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                            className="w-full h-12 rounded-lg border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="">Select a course</option>
                                            {courses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.course_name} ({course.course_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                                Total Marks
                                            </label>
                                            <div className="relative">
                                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={formData.total_marks}
                                                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                                                    className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                                Passing Marks
                                            </label>
                                            <Input
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.passing_marks}
                                                onChange={(e) => setFormData({ ...formData, passing_marks: parseInt(e.target.value) })}
                                                className="h-12 border-gray-200 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                                Duration (min)
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={formData.duration_minutes}
                                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                                    className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                                Max Attempts
                                            </label>
                                            <Input
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.max_attempts}
                                                onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                                                className="h-12 border-gray-200 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 h-12"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            editingQuiz ? "Update Quiz" : "Create Quiz"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TutorBottomNav />
        </div>
    );
}
