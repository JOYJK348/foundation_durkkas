"use client";

import React from "react";
import {
    UserCircle2,
    Building,
    Mail,
    ShieldLock,
    Key,
    Camera,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Briefcase
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

export default function BranchUserProfile() {
    const { user } = useAuthStore();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-1">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.display_name}`}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <button className="absolute bottom-1 right-1 p-2 bg-slate-900 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.display_name || "Branch Administrator"}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                            {user?.primaryRole?.name || "Branch Admin"}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <UserCircle2 className="w-6 h-6 text-indigo-500" />
                            Account Profile
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Email Address</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 truncate max-w-[200px]">{user?.email}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Building className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Branch Access</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">Chennai Branch (My Branch)</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Briefcase className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Experience</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">2.5 Years</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <ShieldLock className="w-6 h-6 text-indigo-500" />
                            Security Controls
                        </h3>
                        <div className="flex-1 space-y-4">
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Update your login credentials at least every 90 days to maintain branch data security.</p>
                            <div className="h-px bg-slate-50"></div>
                            <div className="space-y-3">
                                <button className="w-full p-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-between group shadow-xl shadow-indigo-100">
                                    <div className="flex items-center gap-3">
                                        <Key className="w-4 h-4" />
                                        <span>Update Password</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                                <button className="w-full p-4 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-center">
                                    View Login Sessions
                                </button>
                            </div>
                        </div>
                        <div className="pt-4 flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Multi-Auth Enabled</span>
                        </div>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="bg-slate-50 rounded-[32px] p-6 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-lg mx-auto">
                        Limited Access Profile: Role-based permissions are managed by the Company Administrator. Contact them for identity changes.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
