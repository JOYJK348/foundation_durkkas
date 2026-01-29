"use client";

import React, { useEffect, useState } from 'react';
import {
    LucideGraduationCap,
    LucideClock,
    LucideCheckCircle,
    LucideVideo,
    LucideBookOpen,
    LucideFileText,
    LucideTrendingUp,
    LucideCalendar,
    LucideAward,
    LucideTarget,
    LucideActivity,
    LucideArrowRight,
    LucidePlay,
    LucideAlertCircle
} from 'lucide-react';
import { emsService } from '@/services/emsService';
import { toast } from 'sonner';

interface DashboardData {
    student: {
        id: number;
        student_code: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    total_enrollments: number;
    enrollments: Array<{
        id: number;
        course_id: number;
        course_name: string;
        enrollment_status: string;
        completion_percentage: number;
        total_lessons: number;
        lessons_completed: number;
        enrollment_date: string;
    }>;
    pending_assignments_count: number;
    pending_assignments: Array<{
        id: number;
        assignment_title: string;
        deadline: string;
        max_marks: number;
    }>;
    overall_progress: number;
}

export default function StudentDashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'courses' | 'assignments'>('overview');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await emsService.getStudentDashboard();
            if (response.success) {
                setDashboardData(response.data);
            } else {
                toast.error(response.message || 'Failed to load dashboard');
            }
        } catch (error: any) {
            console.error('Dashboard fetch error:', error);
            toast.error(error.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto" />
                    <p className="text-slate-500 font-medium">Loading your learning dashboard...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
                    <LucideAlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
                    <h3 className="text-xl font-bold text-slate-900">No Data Available</h3>
                    <p className="text-slate-500">Unable to load your dashboard. Please try again later.</p>
                    <button
                        onClick={fetchDashboardData}
                        className="btn-primary mt-4"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const activeEnrollments = dashboardData.enrollments.filter(e => e.enrollment_status === 'ACTIVE');
    const totalLessons = dashboardData.enrollments.reduce((acc, curr) => acc + (curr.total_lessons || 0), 0);
    const completedLessons = dashboardData.enrollments.reduce((acc, curr) => acc + (curr.lessons_completed || 0), 0);
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, {dashboardData.student.first_name}! 👋
                        </h1>
                        <p className="text-white/80 text-lg">
                            Ready to continue your learning journey?
                        </p>
                        <p className="text-white/60 text-sm mt-1">
                            Student ID: {dashboardData.student.student_code}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                            <div className="text-4xl font-black">{overallProgress}%</div>
                            <div className="text-xs text-white/70 mt-1 font-semibold">Overall Progress</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<LucideGraduationCap className="text-blue-600" />}
                    label="Enrolled Courses"
                    value={dashboardData.total_enrollments.toString()}
                    color="bg-blue-50"
                    trend="+2 this month"
                />
                <StatCard
                    icon={<LucideCheckCircle className="text-emerald-600" />}
                    label="Lessons Completed"
                    value={`${completedLessons}/${totalLessons}`}
                    color="bg-emerald-50"
                    trend={`${overallProgress}% complete`}
                />
                <StatCard
                    icon={<LucideFileText className="text-amber-600" />}
                    label="Pending Assignments"
                    value={dashboardData.pending_assignments_count.toString()}
                    color="bg-amber-50"
                    trend={dashboardData.pending_assignments_count > 0 ? "Action needed" : "All caught up!"}
                    urgent={dashboardData.pending_assignments_count > 0}
                />
                <StatCard
                    icon={<LucideVideo className="text-rose-600" />}
                    label="Live Classes"
                    value="0"
                    color="bg-rose-50"
                    trend="None scheduled"
                />
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200">
                <TabButton
                    active={selectedTab === 'overview'}
                    onClick={() => setSelectedTab('overview')}
                    icon={<LucideActivity className="w-4 h-4" />}
                >
                    Overview
                </TabButton>
                <TabButton
                    active={selectedTab === 'courses'}
                    onClick={() => setSelectedTab('courses')}
                    icon={<LucideBookOpen className="w-4 h-4" />}
                >
                    My Courses
                </TabButton>
                <TabButton
                    active={selectedTab === 'assignments'}
                    onClick={() => setSelectedTab('assignments')}
                    icon={<LucideFileText className="w-4 h-4" />}
                >
                    Assignments ({dashboardData.pending_assignments_count})
                </TabButton>
            </div>

            {/* Tab Content */}
            {selectedTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <LucideTrendingUp className="w-5 h-5 text-primary" />
                                Continue Learning
                            </h3>
                            <div className="grid gap-4">
                                {activeEnrollments.length > 0 ? activeEnrollments.slice(0, 3).map((enrollment) => (
                                    <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                                )) : (
                                    <EmptyState
                                        icon={<LucideBookOpen />}
                                        title="No active courses"
                                        description="Enroll in a course to start learning"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h4 className="font-bold text-slate-900 mb-4">Quick Actions</h4>
                            <div className="space-y-3">
                                <QuickActionButton icon={<LucideCalendar />} label="View Schedule" />
                                <QuickActionButton icon={<LucideAward />} label="My Certificates" />
                                <QuickActionButton icon={<LucideTarget />} label="Learning Goals" />
                            </div>
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <LucideClock className="w-5 h-5 text-amber-600" />
                                Upcoming Deadlines
                            </h4>
                            {dashboardData.pending_assignments.length > 0 ? (
                                <div className="space-y-3">
                                    {dashboardData.pending_assignments.slice(0, 3).map((assignment) => (
                                        <DeadlineItem key={assignment.id} assignment={assignment} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No upcoming deadlines</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeEnrollments.map((enrollment) => (
                        <CourseCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                    {activeEnrollments.length === 0 && (
                        <div className="col-span-full">
                            <EmptyState
                                icon={<LucideGraduationCap />}
                                title="No enrolled courses"
                                description="Browse the course catalog to get started"
                            />
                        </div>
                    )}
                </div>
            )}

            {selectedTab === 'assignments' && (
                <div className="space-y-4">
                    {dashboardData.pending_assignments.length > 0 ? (
                        dashboardData.pending_assignments.map((assignment) => (
                            <AssignmentCard key={assignment.id} assignment={assignment} />
                        ))
                    ) : (
                        <EmptyState
                            icon={<LucideCheckCircle />}
                            title="All caught up!"
                            description="You have no pending assignments"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: Stat Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StatCard({
    icon,
    label,
    value,
    color,
    trend,
    urgent = false
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    trend?: string;
    urgent?: boolean;
}) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {urgent && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg animate-pulse">
                        !
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-900 mb-2">{value}</p>
                {trend && (
                    <p className={`text-xs font-semibold ${urgent ? 'text-red-600' : 'text-emerald-600'}`}>
                        {trend}
                    </p>
                )}
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: Tab Button
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TabButton({
    active,
    onClick,
    children,
    icon
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 ${active
                    ? 'bg-white text-primary border-b-2 border-primary'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
        >
            {icon}
            {children}
        </button>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: Course Progress Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CourseProgressCard({ enrollment }: { enrollment: any }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {enrollment.course_name || 'Untitled Course'}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                        {enrollment.lessons_completed} of {enrollment.total_lessons} lessons completed
                    </p>
                </div>
                <button className="btn-primary btn-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <LucidePlay className="w-4 h-4" />
                    Continue
                </button>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.completion_percentage || 0}%` }}
                    />
                </div>
                <span className="absolute -top-6 right-0 text-xs font-bold text-primary">
                    {enrollment.completion_percentage || 0}%
                </span>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: Course Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CourseCard({ enrollment }: { enrollment: any }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
            <div className="h-40 bg-gradient-to-br from-primary to-primary/80 relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold">
                        {enrollment.enrollment_status}
                    </span>
                </div>
            </div>
            <div className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors">
                    {enrollment.course_name || 'Untitled Course'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                        <LucideBookOpen className="w-4 h-4" />
                        {enrollment.total_lessons} Lessons
                    </span>
                    <span className="flex items-center gap-1">
                        <LucideCheckCircle className="w-4 h-4" />
                        {enrollment.completion_percentage}%
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.completion_percentage || 0}%` }}
                    />
                </div>
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                    Continue Learning
                    <LucideArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: Assignment Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AssignmentCard({ assignment }: { assignment: any }) {
    const daysLeft = Math.ceil((new Date(assignment.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isUrgent = daysLeft <= 2;

    return (
        <div className={`bg-white p-6 rounded-2xl border-2 ${isUrgent ? 'border-red-200 bg-red-50/30' : 'border-slate-200'} hover:shadow-lg transition-all`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-slate-900">{assignment.assignment_title}</h4>
                        {isUrgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg animate-pulse">
                                URGENT
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <LucideClock className="w-4 h-4" />
                            Due in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                        </span>
                        <span className="flex items-center gap-1">
                            <LucideAward className="w-4 h-4" />
                            {assignment.max_marks} marks
                        </span>
                    </div>
                </div>
                <button className="btn-primary btn-sm">
                    Submit
                </button>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: Deadline Item
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DeadlineItem({ assignment }: { assignment: any }) {
    const deadline = new Date(assignment.deadline);
    const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200">
            <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900 line-clamp-1">
                    {assignment.assignment_title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                    {deadline.toLocaleDateString()}
                </p>
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${daysLeft <= 1 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                {daysLeft}d
            </span>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: Quick Action Button
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function QuickActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left">
            <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                {icon}
            </div>
            <span className="font-semibold text-sm text-slate-700 group-hover:text-primary transition-colors">
                {label}
            </span>
            <LucideArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </button>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: Empty State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                {icon}
            </div>
            <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
    );
}
