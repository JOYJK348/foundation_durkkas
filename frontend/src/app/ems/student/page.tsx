"use client";

import React, { useEffect } from 'react';
import { LucideGraduationCap, LucideClock, LucideCheckCircle, LucideVideo } from 'lucide-react';
import { useEmsStore } from '@/store/useEmsStore';

export default function StudentDashboard() {
    const { profile, enrollments, loading, fetchProfile, fetchEnrollments } = useEmsStore();

    useEffect(() => {
        const initDashboard = async () => {
            const studentProfile = await fetchProfile();
            if (studentProfile?.id) {
                fetchEnrollments(studentProfile.id);
            }
        };
        initDashboard();
    }, [fetchProfile, fetchEnrollments]);

    if (loading && !profile) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    const activeEnrollments = enrollments.filter(e => e.enrollment_status === 'ACTIVE');
    const totalLessons = enrollments.reduce((acc, curr) => acc + (curr.total_lessons || 0), 0);
    const completedLessons = enrollments.reduce((acc, curr) => acc + (curr.lessons_completed || 0), 0);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Education Overview</h1>
                <p className="text-slate-500">Track your learning progress and upcoming classes.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<LucideGraduationCap className="text-blue-600" />}
                    label="Enrolled Courses"
                    value={enrollments.length.toString()}
                    color="bg-blue-50"
                />
                <StatCard
                    icon={<LucideClock className="text-amber-600" />}
                    label="Activity Status"
                    value={profile?.status || "Active"}
                    color="bg-amber-50"
                />
                <StatCard
                    icon={<LucideCheckCircle className="text-emerald-600" />}
                    label="Completed Lessons"
                    value={`${completedLessons}/${totalLessons}`}
                    color="bg-emerald-50"
                />
                <StatCard
                    icon={<LucideVideo className="text-rose-600" />}
                    label="Next Live Class"
                    value="None Scheduled"
                    color="bg-rose-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Courses */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">My Active Courses</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {activeEnrollments.length > 0 ? activeEnrollments.map((enr) => (
                            <div key={enr.id} className="premium-glass p-6 rounded-xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-semibold">{enr.course_name || 'Web Development'}</h4>
                                    <p className="text-sm text-slate-500">Progress: {enr.completion_percentage}%</p>
                                    <div className="w-64 h-2 bg-slate-100 rounded-full mt-4">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${enr.completion_percentage}%` }}
                                        />
                                    </div>
                                </div>
                                <button className="btn-premium btn-primary">Continue Learning</button>
                            </div>
                        )) : (
                            <div className="p-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-500">You are not enrolled in any active courses yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Classes - Placeholder for now */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Upcoming Live Classes</h3>
                    <div className="space-y-4">
                        <div className="bg-white border border-slate-200 p-8 rounded-xl text-center">
                            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <LucideVideo className="text-slate-400" size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-600">No classes scheduled for today.</p>
                            <p className="text-xs text-slate-400 mt-1">Check back later for updates.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}
