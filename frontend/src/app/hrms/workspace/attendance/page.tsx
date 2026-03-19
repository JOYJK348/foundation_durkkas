"use client";

import React, { useState } from "react";
import {
    CalendarCheck,
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    Building,
    BarChart3
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function WorkspaceAttendance() {
    const [activeTab, setActiveTab] = useState<"LIVE" | "MONTHLY">("LIVE");

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-100">
                            <CalendarCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Attendance</h1>
                            <p className="text-sm text-slate-500 font-medium">Monitoring daily presence and shift compliance across entire workforce</p>
                        </div>
                    </div>
                </div>

                {/* KPI Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Strength", value: "245", sub: "Across 5 Branches", color: "bg-slate-900", icon: Building },
                        { label: "Today Present", value: "212", sub: "86% Occupancy", color: "bg-emerald-600", icon: CheckCircle2 },
                        { label: "Late Arrivals", value: "18", sub: "Action Required", color: "bg-amber-600", icon: Clock },
                        { label: "Total Absent", value: "15", sub: "Past 24 Hours", color: "bg-rose-600", icon: XCircle },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm space-y-4 group hover:shadow-xl transition-all">
                            <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-[10px] font-bold text-slate-300 mt-1">{stat.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View Toggles */}
                <div className="flex bg-slate-100 p-2 rounded-[24px] w-fit">
                    {[
                        { id: "LIVE", label: "Real-time Register", icon: Activity },
                        { id: "MONTHLY", label: "Analytics & Trends", icon: BarChart3 }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-8 py-3.5 rounded-[18px] flex items-center gap-3 text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                                    ? "bg-white text-blue-600 shadow-md"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center min-h-[400px] text-center">
                    {activeTab === "LIVE" ? (
                        <>
                            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <Search className="w-12 h-12 text-blue-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Branch Scoped Monitoring</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">Use the select filters to view live attendance records for a specific branch or date.</p>
                            <div className="mt-8 flex gap-3">
                                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Select Branch</button>
                                <button className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100">Pick Date</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <BarChart3 className="w-24 h-24 text-slate-200 mb-6" />
                            <h3 className="text-2xl font-black text-slate-900">Attendance Trends (Proprietary)</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">Analyzing historical presence to detect productivity patterns and absenteeism spikes.</p>
                            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Avg. Monthly Punctuality</p>
                                <h4 className="text-4xl font-black text-emerald-600 mt-2">94.2%</h4>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// Dummy icon for import
function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
