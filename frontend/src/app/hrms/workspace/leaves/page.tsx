"use client";

import React, { useState } from "react";
import {
    MailCheck,
    Search,
    Filter,
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    Building,
    ChevronRight,
    Loader2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";

export default function WorkspaceLeaves() {
    const [filter, setFilter] = useState("PENDING");

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-rose-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-rose-100">
                            <MailCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Leave Inbox</h1>
                            <p className="text-sm text-slate-500 font-medium">Global oversight of absence requests and branch-level approvals</p>
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Pending Today", value: "12", sub: "Manual Review", color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Approved (Week)", value: "45", sub: "Operational Impact Low", color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Staff on Leave", value: "8", sub: "Active Right Now", color: "text-indigo-600", bg: "bg-indigo-50" },
                    ].map((stat) => (
                        <div key={stat.label} className={`${stat.bg} p-8 rounded-[40px] border border-transparent hover:border-slate-100 transition-all group`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-4xl font-black ${stat.color} tracking-tight`}>{stat.value}</h3>
                                <div className="p-2 bg-white/50 rounded-xl shadow-sm">
                                    <Clock className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Filter & List Area */}
                <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
                            {["PENDING", "APPROVED", "REJECTED"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${filter === f ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="Find request..." className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-bold" />
                            </div>
                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-600 transition-all">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-300">
                        <MailCheck className="w-20 h-20 mb-6 text-rose-100" />
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Workspace Insights Only</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2 font-medium">As a Company Admin, you monitor approvals made by Branch Admins. You can override if "Access Control" is enabled.</p>
                        <button className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            View All Active Requests
                        </button>
                    </div>
                </div>

                {/* Policy CTA */}
                <div className="bg-slate-900 rounded-[40px] p-10 text-white flex items-center justify-between shadow-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative">
                        <h3 className="text-2xl font-black tracking-tight mb-2">Leave Governance</h3>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm">Manage allowance, half-day policies, and global holiday calendars for the entire company.</p>
                    </div>
                    <Link href="/workspace/settings" className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2 group shadow-xl">
                        Update Policy
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
