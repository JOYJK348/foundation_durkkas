"use client";

import React from "react";
import Link from "next/link";
import {
    Users,
    CalendarCheck,
    MailCheck,
    CreditCard,
    ArrowUpRight,
    LayoutDashboard,
    Zap
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const HRMS_MODULES = [
    {
        title: "Employee Directory",
        description: "Manage staff records, contracts, and talent governance.",
        icon: Users,
        href: "/hrms/workspace/employees",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        stats: "245 Active Staff"
    },
    {
        title: "Attendance Feed",
        description: "Monitor daily presence, shifts, and real-time logs.",
        icon: CalendarCheck,
        href: "/hrms/workspace/attendance",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        stats: "86% Present Today"
    },
    {
        title: "Leave Inbox",
        description: "Track absence requests and approval workflows.",
        icon: MailCheck,
        href: "/hrms/workspace/leaves",
        color: "text-rose-600",
        bgColor: "bg-rose-50",
        stats: "12 Pending Approvals"
    },
    {
        title: "Payroll Ledger",
        description: "Automated salary processing and financial compliance.",
        icon: CreditCard,
        href: "/hrms/workspace/payroll",
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        stats: "Coming Soon",
        disabled: true
    }
];

export default function HRMSWorkspaceDashboard() {
    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-100">
                            <LayoutDashboard className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Talent Dashboard</h1>
                            <p className="text-sm text-slate-500 font-medium">Enterprise Human Resource & Operations Management</p>
                        </div>
                    </div>
                </div>

                {/* Module Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {HRMS_MODULES.map((module) => (
                        <Link
                            key={module.title}
                            href={module.disabled ? "#" : module.href}
                            className={`group relative bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:border-blue-100 ${module.disabled ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className={`w-16 h-16 ${module.bgColor} ${module.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <module.icon className="w-8 h-8" />
                                </div>
                                {!module.disabled && (
                                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-2">{module.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-6">
                                {module.description}
                            </p>

                            <div className="flex items-center gap-2">
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${module.bgColor} ${module.color}`}>
                                    {module.stats}
                                </div>
                                {module.disabled && (
                                    <div className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Zap size={10} />
                                        In Sandbox
                                    </div>
                                )}
                            </div>

                            {/* Decorative background element */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${module.bgColor} opacity-0 group-hover:opacity-20 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity animate-pulse`} />
                        </Link>
                    ))}
                </div>

                {/* Footer Insight */}
                <div className="bg-slate-900 rounded-[48px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative">
                        <h3 className="text-2xl font-black tracking-tight mb-2">Talent Intelligence</h3>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-lg">
                            Durkkas HRMS integrates biometric attendance, document vaulting, and automated payroll to ensure zero-friction workforce management.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Health</p>
                            <p className="text-xl font-bold text-emerald-400">98.2% Active</p>
                        </div>
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                            <Zap className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
