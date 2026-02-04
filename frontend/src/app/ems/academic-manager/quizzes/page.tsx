"use client";

import { useState, useEffect } from "react";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    ClipboardCheck,
    Plus,
    Search,
    Clock,
    Target,
    ArrowLeft,
    X,
    Edit,
    Trash2,
    Eye,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Quiz {
    id: number;
    quiz_title: string;
    quiz_description: string;
    course_id: number;
    total_marks: number;
    duration_minutes: number;
    max_attempts: number;
    status: string;
    question_count?: number;
    courses?: {
        course_name: string;
    };
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_code: string;
}

interface Batch {
    id: number;
    batch_name: string;
    batch_code: string;
}

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        quiz_title: "",
        quiz_description: "",
        course_id: "",
        total_marks: 100,
        duration_minutes: 60,
        max_attempts: 3,
        passing_marks: 40,
        start_datetime: "",
        end_datetime: "",
        assignment_type: 'ALL', // ALL, BATCH, STUDENT
        selected_batch_id: "",
        selected_student_id: "",
    });

    useEffect(() => {
        fetchQuizzes();
        fetchCourses();
    }, []);

    useEffect(() => {
        if (formData.course_id) {
            fetchBatches(formData.course_id);
            fetchStudents(formData.course_id);
        }
    }, [formData.course_id]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/quizzes");
            if (response.data.success) {
                setQuizzes(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

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

    const fetchBatches = async (courseId: string) => {
        try {
            const response = await api.get(`/ems/batches?course_id=${courseId}`);
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const fetchStudents = async (courseId: string) => {
        try {
            const response = await api.get(`/ems/students?course_id=${courseId}`);
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const assignments = [];
            if (formData.assignment_type === 'BATCH' && formData.selected_batch_id) {
                assignments.push({ batch_id: parseInt(formData.selected_batch_id) });
            } else if (formData.assignment_type === 'STUDENT' && formData.selected_student_id) {
                assignments.push({ student_id: parseInt(formData.selected_student_id) });
            }

            // Separate quiz data from assignment data
            const { assignment_type, selected_batch_id, selected_student_id, ...quizData } = formData;

            const response = await api.post("/ems/quizzes", {
                ...quizData,
                course_id: parseInt(formData.course_id),
                assignments: assignments.length > 0 ? assignments : undefined
            });

            if (response.data.success) {
                setShowCreateForm(false);
                fetchQuizzes();
                setFormData({
                    quiz_title: "",
                    quiz_description: "",
                    course_id: "",
                    total_marks: 100,
                    duration_minutes: 60,
                    max_attempts: 3,
                    passing_marks: 40,
                    start_datetime: "",
                    end_datetime: "",
                    assignment_type: 'ALL',
                    selected_batch_id: "",
                    selected_student_id: "",
                });
            }
        } catch (error) {
            console.error("Error creating quiz:", error);
        }
    };

    const filteredQuizzes = quizzes.filter((quiz) =>
        quiz.quiz_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Quizzes & Assessments
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Create and manage quizzes for your courses
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Quiz
                    </Button>
                </div>

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

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading quizzes...</p>
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <ClipboardCheck className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Quizzes Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first quiz to assess student learning
                            </p>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-purple-600 hover:bg-purple-700"
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
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <ClipboardCheck className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.status === 'PUBLISHED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {quiz.status}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                            {quiz.quiz_title}
                                        </h3>
                                        <p className="text-sm text-purple-600 font-medium mb-3">
                                            {quiz.courses?.course_name || 'No course'}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {quiz.quiz_description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">{quiz.duration_minutes} min</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">{quiz.total_marks} marks</span>
                                            </div>
                                            <div className="col-span-2 text-gray-600">
                                                {quiz.question_count || 0} questions • {quiz.max_attempts} attempts
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <Link href={`/ems/academic-manager/quizzes/builder?id=${quiz.id}`}>
                                                <Button size="sm" variant="outline" className="w-full">
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Build
                                                </Button>
                                            </Link>
                                            <Link href={`/ems/academic-manager/quizzes/${quiz.id}/results`}>
                                                <Button size="sm" variant="outline" className="w-full">
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    Results
                                                </Button>
                                            </Link>
                                            <Link href={`/ems/academic-manager/quizzes/view?id=${quiz.id}`}>
                                                <Button size="sm" variant="outline" className="w-full">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Review
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="outline" className="w-full text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Quiz Modal */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowCreateForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Create New Quiz
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateQuiz} className="p-6 space-y-6">
                                <div>
                                    <Label htmlFor="quiz_title">Quiz Title *</Label>
                                    <Input
                                        id="quiz_title"
                                        required
                                        placeholder="e.g., JavaScript Fundamentals Quiz"
                                        value={formData.quiz_title}
                                        onChange={(e) => setFormData({ ...formData, quiz_title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="quiz_description">Description</Label>
                                    <Textarea
                                        id="quiz_description"
                                        rows={3}
                                        placeholder="Describe what this quiz covers..."
                                        value={formData.quiz_description}
                                        onChange={(e) => setFormData({ ...formData, quiz_description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="course_id">Select Course *</Label>
                                    <select
                                        id="course_id"
                                        required
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={formData.course_id}
                                        onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                    >
                                        <option value="">Choose a course...</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_name} ({course.course_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div>
                                        <Label>Assign To</Label>
                                        <div className="flex gap-4 mt-2">
                                            {['ALL', 'BATCH', 'STUDENT'].map((type) => (
                                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="assignment_type"
                                                        value={type}
                                                        checked={formData.assignment_type === type}
                                                        onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value })}
                                                        className="text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                                        {type === 'ALL' ? 'All Students' : type.toLowerCase()}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.assignment_type === 'BATCH' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <Label htmlFor="batch_id">Select Batch *</Label>
                                            <select
                                                id="batch_id"
                                                required
                                                className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                                                value={formData.selected_batch_id}
                                                onChange={(e) => setFormData({ ...formData, selected_batch_id: e.target.value })}
                                            >
                                                <option value="">Choose a batch...</option>
                                                {batches.map((batch) => (
                                                    <option key={batch.id} value={batch.id}>
                                                        {batch.batch_name} ({batch.batch_code})
                                                    </option>
                                                ))}
                                            </select>
                                        </motion.div>
                                    )}

                                    {formData.assignment_type === 'STUDENT' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <Label htmlFor="student_id">Select Student *</Label>
                                            <select
                                                id="student_id"
                                                required
                                                className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                                                value={formData.selected_student_id}
                                                onChange={(e) => setFormData({ ...formData, selected_student_id: e.target.value })}
                                            >
                                                <option value="">Choose a student...</option>
                                                {students.map((student) => (
                                                    <option key={student.id} value={student.id}>
                                                        {student.first_name} {student.last_name} ({student.student_code})
                                                    </option>
                                                ))}
                                            </select>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="total_marks">Total Marks *</Label>
                                        <Input
                                            id="total_marks"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.total_marks}
                                            onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="passing_marks">Passing Marks *</Label>
                                        <Input
                                            id="passing_marks"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.passing_marks}
                                            onChange={(e) => setFormData({ ...formData, passing_marks: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="duration_minutes">Duration (Minutes) *</Label>
                                        <Input
                                            id="duration_minutes"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.duration_minutes}
                                            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="max_attempts">Max Attempts *</Label>
                                        <Input
                                            id="max_attempts"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.max_attempts}
                                            onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="start_datetime">Start Date & Time</Label>
                                        <Input
                                            id="start_datetime"
                                            type="datetime-local"
                                            value={formData.start_datetime}
                                            onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">When quiz becomes available</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="end_datetime">End Date & Time</Label>
                                        <Input
                                            id="end_datetime"
                                            type="datetime-local"
                                            value={formData.end_datetime}
                                            onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">When quiz closes</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        💡 After creating the quiz, you can add questions from the quiz details page.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Create Quiz
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AcademicManagerBottomNav />
        </div>
    );
}
