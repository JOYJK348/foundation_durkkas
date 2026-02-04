"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowLeft,
    ClipboardCheck,
    Clock,
    Play,
    CheckCircle2,
    AlertCircle,
    Loader2,
    HelpCircle,
    Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

export default function AssessmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        fetchQuizDetails();
    }, [params.id]);

    const fetchQuizDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/students/my-quizzes`);
            if (response.data.success) {
                const found = response.data.data.find((q: any) => q.id.toString() === params.id);
                setQuiz(found);
            }
        } catch (error: any) {
            toast.error("Failed to load assessment details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <TopNavbar />
                <div className="flex flex-col items-center justify-center py-40 text-gray-500">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
                    <p>Loading assessment...</p>
                </div>
                <BottomNav />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Assessment Not Found</h2>
                <Button onClick={() => router.push('/ems/student/assessments')} className="mt-6 bg-blue-600">Back to Assessments</Button>
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

                <AnimatePresence mode="wait">
                    {!isStarted ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                        >
                            <Card className="border-0 shadow-2xl overflow-hidden rounded-[32px]">
                                <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-10 text-white text-center">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                                        <ClipboardCheck className="h-10 w-10 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-black mb-3">{quiz.quiz_title}</h1>
                                    <p className="text-blue-100 max-w-lg mx-auto leading-relaxed">
                                        {quiz.quiz_description || "Demonstrate your understanding and master the subject concepts."}
                                    </p>
                                </div>

                                <CardContent className="p-10">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                                        <div className="bg-gray-50 p-6 rounded-3xl text-center border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Limit</p>
                                            <p className="text-xl font-bold text-gray-900">{quiz.duration_minutes}m</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl text-center border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pass Mark</p>
                                            <p className="text-xl font-bold text-gray-900">{quiz.passing_marks || "40%"}</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl text-center border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Questions</p>
                                            <p className="text-xl font-bold text-gray-900">{quiz.total_questions || 20}</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl text-center border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Remaining</p>
                                            <p className="text-xl font-bold text-gray-900">{quiz.attempts_remaining}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Award className="h-5 w-5 text-amber-500" />
                                            Instructions
                                        </h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                "Ensure stable internet connection",
                                                "Once started, timer cannot be paused",
                                                "Do not refresh the page during quiz",
                                                "Multiple attempts allowed if remaining"
                                            ].map((text, i) => (
                                                <li key={i} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl text-sm text-blue-800 border border-blue-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    {text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button
                                            onClick={() => setIsStarted(true)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 h-16 rounded-2xl text-lg font-bold shadow-lg shadow-blue-200"
                                            disabled={quiz.attempts_remaining <= 0}
                                        >
                                            <Play className="h-5 w-5 mr-2 fill-current" />
                                            Start Assessment
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-16 rounded-2xl px-10 border-gray-200 text-gray-500 font-bold"
                                            onClick={() => router.back()}
                                        >
                                            Maybe Later
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] shadow-2xl p-10 text-center"
                        >
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                                <HelpCircle className="h-12 w-12 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-black mb-4">Quiz Interface Active</h2>
                            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                                The automated quiz system is initializing. Please wait while we fetch your questions from the vault.
                            </p>
                            <div className="flex justify-center gap-3 mb-10">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-3 h-3 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                            <Button variant="ghost" className="text-gray-400 hover:bg-transparent" onClick={() => setIsStarted(false)}>
                                Stop Initialization
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <BottomNav />
        </div>
    );
}
