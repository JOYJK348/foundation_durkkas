"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Clock,
    CalendarCheck,
    CalendarX,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    MapPin,
    Sun,
    Moon
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function EmployeeDashboard() {
    const { user } = useAuthStore();
    const [isCheckedIn, setIsCheckedIn] = useState(false); // Mock state for now

    // Client-side time state to prevent hydration mismatch
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    React.useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // Derived values
    const hour = currentTime ? currentTime.getHours() : 12; // Default to 12 if loading
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    const timeStr = currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const dateStr = currentTime ? currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }) : '';

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
            {/* 1. Header & Greeting */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {currentTime ? `${greeting}, ${user?.display_name?.split(' ')[0]}!` : <span className="animate-pulse bg-slate-200 h-8 w-48 block rounded-lg" />}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">Here's your daily roundup.</p>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-2xl font-black text-slate-900 min-w-[100px] text-right">
                        {timeStr}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[150px] text-right">
                        {dateStr}
                    </p>
                </div>
            </div>

            {/* 2. Attendance Status Card (Hero) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Clock size={120} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isCheckedIn ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`} />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance Status</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {isCheckedIn ? "You are Checked In" : "You are currently Away"}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">
                            {isCheckedIn
                                ? "Great! Don't forget to check out when you leave."
                                : "Mark your attendance to start your workday."
                            }
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsCheckedIn(!isCheckedIn)}
                            className={`px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3 ${isCheckedIn
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                }`}
                        >
                            {isCheckedIn ? <Moon size={20} /> : <Sun size={20} />}
                            {isCheckedIn ? "Check Out" : "Check In Now"}
                        </button>
                    </div>
                </div>

                {/* Today's Log (Mini) */}
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-sm">
                    <div className="flex gap-8">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">In Time</p>
                            <p className="font-bold text-slate-900">{isCheckedIn ? "09:00 AM" : "--:--"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Out Time</p>
                            <p className="font-bold text-slate-900">--:--</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Hrs</p>
                            <p className="font-bold text-slate-900">{isCheckedIn ? "4h 30m" : "0h 0m"}</p>
                        </div>
                    </div>
                    <Link href="/employee/attendance" className="text-indigo-600 text-xs font-bold hover:underline">
                        View History
                    </Link>
                </div>
            </div>

            {/* 3. Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/employee/leaves/new" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 text-center group">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarCheck size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Apply Leave</span>
                </Link>

                <Link href="/employee/attendance" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 text-center group">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarX size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-600">Holidays</span>
                </Link>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm opacity-50 flex flex-col items-center gap-3 text-center">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                        <AlertCircle size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Report Issue</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm opacity-50 flex flex-col items-center gap-3 text-center">
                    <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                        <MapPin size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Site Visit</span>
                </div>
            </div>

            {/* 4. Notifications Preview */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Recent Updates</h3>
                    <Link href="/employee/notifications" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
                </div>
                <div className="divide-y divide-slate-50">
                    <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Leave Approved</p>
                            <p className="text-xs text-slate-500 mt-0.5">Your casual leave request for Jan 25 has been approved.</p>
                            <p className="text-[10px] font-bold text-slate-300 mt-1">2 hours ago</p>
                        </div>
                    </div>

                    <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                            <AlertCircle size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">System Maintenance</p>
                            <p className="text-xs text-slate-500 mt-0.5">ERP will be down for maintenance on Sunday 12 AM - 4 AM.</p>
                            <p className="text-[10px] font-bold text-slate-300 mt-1">Yesterday</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
