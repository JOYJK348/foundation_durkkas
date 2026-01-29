"use client";

import React from 'react';
import {
    Users,
    BookOpen,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    UserPlus,
    GraduationCap
} from 'lucide-react';

export default function LMSDashboard() {
    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-primary rounded-3xl p-8 text-white shadow-2xl shadow-primary/20">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Academy Performance</h1>
                    <p className="opacity-80 max-w-lg">Everything seems to be on track! You have 24 new admissions this week and courses are 85% occupied.</p>
                    <div className="flex gap-4 mt-6">
                        <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-lg">
                            View Reports
                        </button>
                        <button className="bg-primary/20 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
                            Announcement
                        </button>
                    </div>
                </div>
                {/* Abstract Background Element */}
                <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]" />
                <GraduationCap size={160} className="absolute right-8 bottom-[-20%] text-white/10 rotate-12" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStat
                    icon={<Users size={24} />}
                    label="Total Students"
                    value="1,280"
                    trend="+12%"
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <DashboardStat
                    icon={<BookOpen size={24} />}
                    label="Active Courses"
                    value="42"
                    trend="+3"
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <DashboardStat
                    icon={<Calendar size={24} />}
                    label="Live Batches"
                    value="18"
                    trend="Steady"
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <DashboardStat
                    icon={<TrendingUp size={24} />}
                    label="Revenue (MTD)"
                    value="₹4.2L"
                    trend="+18%"
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Admissions */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900">Recent Student Admissions</h3>
                        <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        S{i}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Student {i}</h4>
                                        <p className="text-xs text-slate-500">React Fullstack Development</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">₹15,000</p>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Paid</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <QuickActionButton
                            icon={<UserPlus size={20} />}
                            label="New Admission"
                            desc="Admit a new student"
                        />
                        <QuickActionButton
                            icon={<BookOpen size={20} />}
                            label="Launch Course"
                            desc="Create course module"
                        />
                        <QuickActionButton
                            icon={<Calendar size={20} />}
                            label="Schedule Batch"
                            desc="Assign tutor to batch"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardStat({ icon, label, value, trend, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl ${bg} ${color}`}>
                    {icon}
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
            </div>
        </div>
    );
}

function QuickActionButton({ icon, label, desc }: any) {
    return (
        <button className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-3xl text-left hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group w-full">
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-900">{label}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{desc}</p>
            </div>
        </button>
    );
}
