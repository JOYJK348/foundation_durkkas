"use client";

import { useState, useEffect } from "react";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
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
    is_active: boolean;
    created_at: string;
    courses?: {
        course_name: string;
        course_code: string;
    };
}

export default function TutorQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchQuizzes();
    }, []);

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

    const filteredQuizzes = quizzes.filter((quiz) =>
        quiz.quiz_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

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
                    <Link href="/ems/tutor/quizzes/create">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Quiz
                        </Button>
                    </Link>
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
                            <Link href="/ems/tutor/quizzes/create">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Quiz
                                </Button>
                            </Link>
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
                                            <Link href={`/ems/tutor/quizzes/${quiz.id}`} className="flex-1">
                                                <Button size="sm" variant="outline" className="w-full">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700"
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

            <TutorBottomNav />
        </div>
    );
}
