"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Video,
    FileText,
    Users,
    TrendingUp,
    BookOpen,
    Calendar,
    Award,
    Clock,
    ArrowRight,
    Play,
    CheckCircle2,
    BookText,
    Layers,
    Target,
    Bell,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function TutorDashboard() {
    const [stats, setStats] = useState({
        upcomingClasses: 0,
        pendingGrading: 0,
        totalCourses: 0,
        totalQuizzes: 0,
        totalAssignments: 0,
        resourceLibrary: 0
    });
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
    const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
    const [recentResults, setRecentResults] = useState<any[]>([]);
    const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashRes, materialsRes, recentRes] = await Promise.all([
                api.get("/ems/tutor/dashboard"),
                api.get("/ems/materials"),
                api.get("/ems/quizzes/recent-attempts")
            ]);

            if (dashRes.data.success) {
                const data = dashRes.data.data;
                setUpcomingClasses(data.upcoming_classes || []);
                setAssignedCourses(data.courses || []);
                setPendingAssignments(data.pending_assignments || []);
                setStats({
                    upcomingClasses: data.upcoming_classes?.length || 0,
                    pendingGrading: data.pending_grading_count || 0,
                    totalCourses: data.total_courses || 0,
                    totalQuizzes: data.total_quizzes || 0,
                    totalAssignments: data.total_assignments || 0,
                    resourceLibrary: materialsRes.data.data?.length || 0,
                });
                setRecentQuizzes(data.recent_quizzes || []);
                setRecentActivities(data.recent_activities || []);
                setRecentResults(recentRes.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "My Courses", value: stats.totalCourses.toString(), icon: BookOpen, color: "blue", href: "/ems/tutor/courses" },
        { label: "Pending Grading", value: stats.pendingGrading.toString(), icon: FileText, color: "green", href: "/ems/tutor/grading" },
        { label: "Live Classes", value: stats.upcomingClasses.toString(), icon: Video, color: "purple", href: "/ems/tutor/live-classes" },
        { label: "Assignments", value: stats.totalAssignments.toString(), icon: FileText, color: "orange", href: "/ems/tutor/assignments" },
        { label: "Quizzes", value: stats.totalQuizzes.toString(), icon: BookOpen, color: "red", href: "/ems/tutor/quizzes" },
        { label: "Resource Library", value: stats.resourceLibrary.toString(), icon: Layers, color: "cyan", href: "/ems/tutor/materials" },
    ];

    const quickActions = [
        { label: "Create Batch", icon: Layers, href: "/ems/tutor/batches/create", color: "blue" },
        { label: "Live Schedule", icon: Video, href: "/ems/tutor/live-classes/create", color: "rose" },
        { label: "New Assignment", icon: FileText, href: "/ems/tutor/assignments/create", color: "green" },
        { label: "New Quiz", icon: BookOpen, href: "/ems/tutor/quizzes", color: "purple" },
        { label: "Attend Portal", icon: Calendar, href: "/ems/tutor/attendance", color: "orange" },
        { label: "Students", icon: Users, href: "/ems/tutor/students", color: "red" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Welcome Back, Tutor!
                    </h1>
                    <p className="text-gray-600">Here's what's happening in your courses today.</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={stat.href}>
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white group h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                                stat.color === 'green' ? 'bg-green-50 text-green-600' :
                                                    stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                                        stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                                            stat.color === 'red' ? 'bg-red-50 text-red-600' :
                                                                'bg-cyan-50 text-cyan-600'
                                                }`}>
                                                <stat.icon className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Courses & Modules */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Assigned Courses & Modules Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Assigned Courses & Modules</h2>
                                <Link href="/ems/tutor/courses">
                                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                                        View All Courses
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loading ? (
                                    Array(2).fill(0).map((_, i) => (
                                        <Card key={i} className="border-0 shadow-md animate-pulse">
                                            <CardContent className="h-32 p-6"></CardContent>
                                        </Card>
                                    ))
                                ) : assignedCourses.length === 0 ? (
                                    <Card className="border-0 shadow-md col-span-2">
                                        <CardContent className="p-12 text-center text-gray-500">
                                            <BookText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            No courses currently assigned to you.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    assignedCourses.map((course) => (
                                        <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-all border-l-4 border-l-blue-600">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                                                            {course.course_code}
                                                        </span>
                                                        <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{course.course_name}</h3>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {course.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                            <Layers className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Modules</p>
                                                            <p className="text-sm font-bold">{course.modules_count || 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                            <BookText className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Lessons</p>
                                                            <p className="text-sm font-bold">{course.total_lessons || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link href={`/ems/tutor/courses/${course.id}`} className="mt-4 block">
                                                    <Button variant="outline" className="w-full h-9 text-xs">Manage Course Content</Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Recent Student Performances Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center justify-between mb-4 mt-8">
                                <h2 className="text-2xl font-bold text-gray-900">Recent Student Performances</h2>
                                <Link href="/ems/tutor/quizzes">
                                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                                        View All
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            <Card className="border-0 shadow-lg overflow-hidden">
                                <CardContent className="p-0">
                                    {loading ? (
                                        <div className="p-12 text-center text-gray-400">Loading student marks...</div>
                                    ) : recentResults.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500 italic">No recent quiz attempts found.</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Quiz</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Score</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {recentResults.map((result: any) => (
                                                        <tr key={result.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-gray-900 leading-none">
                                                                    {result.students.first_name} {result.students.last_name}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 mt-1">{result.students.student_code}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-gray-700 line-clamp-1">{result.quizzes.quiz_title}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-gray-900">{result.marks_obtained}</span>
                                                                    <span className="text-xs text-gray-400">/ {result.total_marks}</span>
                                                                </div>
                                                                <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${result.is_passed ? 'bg-green-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${result.percentage}%` }}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {result.is_passed ? (
                                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Pass</span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Fail</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Pending Assignment Gradings Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <div className="flex items-center justify-between mb-4 mt-8">
                                <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">Pending Assignment Gradings</h2>
                                <Link href="/ems/tutor/grading">
                                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                                        View All
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {loading ? (
                                    Array(2).fill(0).map((_, i) => (
                                        <Card key={i} className="border-0 shadow-md animate-pulse h-24"></Card>
                                    ))
                                ) : pendingAssignments.length === 0 ? (
                                    <Card className="border-0 shadow-md col-span-2">
                                        <CardContent className="p-8 text-center text-gray-500 italic">
                                            No pending assignments for grading.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    pendingAssignments.map((assignment: any) => (
                                        assignment.assignment_submissions.map((sub: any) => (
                                            <Card key={`${assignment.id}-${sub.id}`} className="border-0 shadow-md hover:shadow-lg transition-all border-l-4 border-l-emerald-500 bg-white">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <FileText className="h-3 w-3 text-emerald-600" />
                                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{assignment.assignment_title}</span>
                                                            </div>
                                                            <h3 className="font-bold text-gray-900 line-clamp-1">
                                                                {sub.students.first_name} {sub.students.last_name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold">{sub.students.student_code}</p>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                <p className="text-[10px] text-gray-400">
                                                                    Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Link href={`/ems/tutor/grading/${sub.id}`}>
                                                            <Button size="sm" className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase">
                                                                Grade Now
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )).flat()
                                )}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                            </div>
                            <div className="space-y-3">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <Card key={i} className="border-0 shadow-sm animate-pulse h-20"></Card>
                                    ))
                                ) : recentActivities.length === 0 ? (
                                    <div className="p-8 text-center bg-white rounded-xl text-gray-400 italic shadow-sm">
                                        No recent activities.
                                    </div>
                                ) : (
                                    recentActivities.map((activity: any) => (
                                        <Card key={activity.id} className="border-0 shadow-md hover:shadow-lg transition-all border-l-4 border-l-blue-500 bg-white">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                                                            activity.type === 'ERROR' ? 'bg-red-100 text-red-600' :
                                                                'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {activity.module === 'assignments' ? <FileText className="h-5 w-5" /> :
                                                                activity.module === 'live_classes' ? <Video className="h-5 w-5" /> :
                                                                    <Bell className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                                            <p className="text-sm text-gray-600 line-clamp-1">{activity.message}</p>
                                                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(activity.created_at).toLocaleString('en-IN', {
                                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {activity.action_url && (
                                                        <Link href={activity.action_url}>
                                                            <Button size="sm" variant="ghost" className="text-blue-600">
                                                                View
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Schedule & Quick Actions */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Upcoming Classes */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Live Schedule</h2>
                                <Link href="/ems/tutor/live-classes">
                                    <Button variant="ghost" size="sm" className="text-blue-600">Full View</Button>
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {upcomingClasses.length === 0 ? (
                                    <Card className="border-0 shadow-md">
                                        <CardContent className="p-8 text-center text-gray-500 italic">
                                            No classes scheduled today.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    upcomingClasses.slice(0, 3).map((cls) => (
                                        <Card key={cls.id} className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden group">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                                                            <span className="text-xs font-bold text-blue-600 uppercase tabular-nums">
                                                                {cls.start_time}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-bold text-gray-900 line-clamp-1">{cls.class_title}</h3>
                                                        <p className="text-xs text-gray-500 mt-1">{cls.courses?.course_name}</p>
                                                    </div>
                                                    <Link href={`/ems/tutor/live-classes/${cls.id}`}>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-blue-50 text-blue-600">
                                                            <Play className="h-4 w-4 fill-current" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Recent Quizzes Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="flex items-center justify-between mb-4 mt-8">
                                <h2 className="text-xl font-bold text-gray-900">New/Recent Quizzes</h2>
                                <Link href="/ems/tutor/quizzes">
                                    <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {recentQuizzes.length === 0 ? (
                                    <Card className="border-0 shadow-md">
                                        <CardContent className="p-8 text-center text-gray-500 italic">
                                            No recent quizzes found.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    recentQuizzes.map((quiz) => {
                                        const createdDate = new Date(quiz.created_at);
                                        const formattedDate = createdDate.toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        });
                                        const formattedTime = createdDate.toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        });

                                        return (
                                            <Card key={quiz.id} className="border-0 shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h3 className="font-bold text-gray-900 line-clamp-1">{quiz.quiz_title}</h3>
                                                                    <p className="text-xs text-blue-600 font-semibold">{quiz.courses?.course_name}</p>
                                                                </div>
                                                                <Link href={`/ems/tutor/quizzes/view?id=${quiz.id}`}>
                                                                    <Button size="sm" variant="ghost" className="h-8 px-3 text-blue-600 hover:bg-blue-50">
                                                                        <ArrowRight className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <Target className="h-3 w-3" />
                                                                    <span>{quiz.total_marks} Marks</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>{quiz.duration_minutes} Min</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>Created: {formattedDate} at {formattedTime}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Quick Tools</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action, index) => (
                                    <Link key={index} href={action.href}>
                                        <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                            <CardContent className="p-3 text-center">
                                                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <action.icon className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <p className="text-[11px] font-bold text-gray-700 uppercase">{action.label}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <TutorBottomNav />
        </div>
    );
}
