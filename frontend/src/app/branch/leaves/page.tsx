"use client";

import React, { useState } from "react";
import {
    MailCheck,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    Search,
    Filter,
    UserCircle2,
    MessageSquare,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";

interface LeaveRequest {
    id: string;
    employeeName: string;
    employeeCode: string;
    type: string;
    fromDate: string;
    toDate: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestDate: string;
}

const INITIAL_LEAVES: LeaveRequest[] = [
    {
        id: "1",
        employeeName: "Arun Kumar",
        employeeCode: "EMP001",
        type: "Sick Leave",
        fromDate: "Jan 12, 2026",
        toDate: "Jan 14, 2026",
        reason: "Severe fever and body pain. Doctor advised rest.",
        status: "PENDING",
        requestDate: "10 mins ago"
    },
    {
        id: "2",
        employeeName: "Priya Das",
        employeeCode: "EMP005",
        type: "Casual Leave",
        fromDate: "Jan 15, 2026",
        toDate: "Jan 15, 2026",
        reason: "Family function in hometown.",
        status: "PENDING",
        requestDate: "2 hours ago"
    },
    {
        id: "3",
        employeeName: "John Smith",
        employeeCode: "EMP012",
        type: "Annual Leave",
        fromDate: "Feb 01, 2026",
        toDate: "Feb 07, 2026",
        reason: "Personal vacation.",
        status: "APPROVED",
        requestDate: "Yesterday"
    },
    {
        id: "4",
        employeeName: "Meera Nair",
        employeeCode: "EMP008",
        type: "Emergency Leave",
        fromDate: "Jan 05, 2026",
        toDate: "Jan 06, 2026",
        reason: "Medical emergency in family.",
        status: "REJECTED",
        requestDate: "3 days ago"
    }
];

export default function BranchLeaves() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

    const handleAction = (id: string, status: "APPROVED" | "REJECTED") => {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
        toast.success(`Leave request ${status.toLowerCase()} successfully`);
    };

    const filteredLeaves = leaves.filter(l => filter === "ALL" || l.status === filter);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <MailCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leave Management</h1>
                            <p className="text-sm text-slate-500 font-medium">Review and respond to branch leave requests</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${filter === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inbox List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {filteredLeaves.length === 0 ? (
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-20 text-center flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                    <MailCheck className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">No requests in this category</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Everything looks clear for now!</p>
                                </div>
                            </div>
                        ) : filteredLeaves.map((request) => (
                            <div key={request.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all group overflow-hidden relative">
                                {/* Border indicator */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${request.status === "PENDING" ? "bg-amber-400" :
                                        request.status === "APPROVED" ? "bg-emerald-500" : "bg-rose-500"
                                    }`}></div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-700">
                                                    {request.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 text-sm leading-tight">{request.employeeName}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{request.employeeCode} • {request.type}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{request.requestDate}</span>
                                        </div>

                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                            <div className="flex items-center gap-6 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span className="text-xs font-black text-slate-700">{request.fromDate}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300" />
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span className="text-xs font-black text-slate-700">{request.toDate}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                                                "{request.reason}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="md:w-48 flex flex-col justify-center gap-3">
                                        {request.status === "PENDING" ? (
                                            <>
                                                <button
                                                    onClick={() => handleAction(request.id, "APPROVED")}
                                                    className="w-full py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-lg shadow-emerald-100 transition-all border border-transparent flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(request.id, "REJECTED")}
                                                    className="w-full py-3 bg-white text-rose-500 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <div className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${request.status === "APPROVED"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-rose-50 text-rose-600"
                                                }`}>
                                                {request.status === "APPROVED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {request.status}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Insights</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <ArrowUpRight className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Requests</p>
                                            <p className="text-xl font-black text-slate-900">{leaves.filter(l => l.status === "PENDING").length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Approved This Week</p>
                                            <p className="text-xl font-black text-emerald-700">12</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-800 to-indigo-900 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col items-center text-center">
                            <MessageSquare className="w-12 h-12 text-indigo-300/50 mb-4" />
                            <h3 className="text-lg font-bold mb-2">Leave Policies</h3>
                            <p className="text-xs text-indigo-200/80 leading-relaxed font-medium mb-6">Ensure your branch follows the company standard leave guidelines. View policy handbook.</p>
                            <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
                                Download Policy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
