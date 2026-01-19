"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    Video,
    Users,
    HelpCircle,
    Clock,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function TutorDashboard() {
    const { user } = useAuthStore();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
    }, []);

    const greeting = currentTime && currentTime.getHours() < 12 ? 'Good Morning' : currentTime && currentTime.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {currentTime ? `${greeting}, Tutor ${user?.display_name?.split(' ')[0]}!` : "Welcome, Tutor!"}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">You have 3 classes scheduled for today.</p>
                </div>
                <Link href="/tutor/sessions/new" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    Scheule New Class
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <BookOpen size={24} />
                    </div>
                    <div className="text-3xl font-black text-slate-900">4</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Courses</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                        <Video size={24} />
                    </div>
                    <div className="text-3xl font-black text-slate-900">12</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sessions Due</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <div className="text-3xl font-black text-slate-900">145</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Students</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                        <HelpCircle size={24} />
                    </div>
                    <div className="text-3xl font-black text-slate-900">8</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Doubts</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Classes */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Video size={20} className="text-indigo-600" />
                            Upcoming Sessions
                        </h3>
                        <Link href="/tutor/sessions" className="text-indigo-600 text-xs font-bold hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col items-center bg-slate-100 rounded-xl p-2 min-w-[60px]">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Today</span>
                                    <span className="text-lg font-black text-slate-900">0{i}:00</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">PM</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">Advanced React Native Development</h4>
                                    <p className="text-sm text-slate-500 mt-1">Batch A - 45 Students</p>
                                    <div className="flex gap-2 mt-3">
                                        <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Start Session</button>
                                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">View Materials</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Doubts sidebar */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <HelpCircle size={20} className="text-amber-500" />
                            Recent Queries
                        </h3>
                    </div>
                    <div className="flex-1 p-4 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-700">ST</div>
                                    <span className="text-xs font-bold text-slate-700">Student Name</span>
                                    <span className="text-[10px] text-slate-400 ml-auto">20m ago</span>
                                </div>
                                <p className="text-sm font-medium text-slate-800 leading-tight">Can you explain the useEffect hook dependency array again?</p>
                                <button className="mt-3 text-xs font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                                    Reply <ArrowRight size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Link href="/tutor/doubts" className="p-4 bg-slate-50 text-center text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors border-t border-slate-100">
                        View all 8 doubts
                    </Link>
                </div>
            </div>
        </div>
    );
}
