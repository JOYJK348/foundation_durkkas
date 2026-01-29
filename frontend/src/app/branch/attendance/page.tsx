"use client";

import React, { useState, useEffect } from "react";
import {
    CalendarCheck,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    Users,
    Search,
    Download,
    Filter,
    Loader2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface Employee {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    department_id: string;
    designations?: { title: string };
}

interface AttendanceRecord {
    employeeId: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
    timeIn?: string;
}

export default function BranchAttendance() {
    const [viewMode, setViewMode] = useState<"DAILY" | "MONTHLY">("DAILY");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const { user } = useAuthStore();
    const userRole = (user as any)?.roles?.[0] || {};
    const userLevel = userRole.level ?? 0;
    const isEmployee = userLevel === 0;

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await platformService.getEmployees();
            setEmployees(data || []);

            // Initialize dummy attendance for demo
            const dummy: Record<string, AttendanceRecord> = {};
            data?.forEach((emp: Employee) => {
                dummy[emp.id] = {
                    employeeId: emp.id,
                    status: Math.random() > 0.1 ? "PRESENT" : "ABSENT",
                    timeIn: "09:00 AM"
                };
            });
            setAttendance(dummy);
        } catch (error) {
            toast.error("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (empId: string, status: "PRESENT" | "ABSENT") => {
        setAttendance(prev => ({
            ...prev,
            [empId]: { ...prev[empId], status }
        }));
        toast.info(`Status updated for ${employees.find(e => e.id === empId)?.first_name}`);
    };

    const filteredEmployees = employees.filter(emp =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {isEmployee ? "My Attendance" : "Attendance Manager"}
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                {isEmployee ? "View your personal attendance logs" : "Daily log and monthly tracking"}
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        <button
                            onClick={() => setViewMode("DAILY")}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === "DAILY" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Daily Register
                        </button>
                        <button
                            onClick={() => setViewMode("MONTHLY")}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === "MONTHLY" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Monthly Summary
                        </button>
                    </div>
                </div>

                {isEmployee ? (
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 text-center flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <Clock className="w-12 h-12" />
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Personal Attendance Log</h2>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                You have <span className="text-emerald-600 font-bold">100% attendance</span> this week.
                                Your regular shift is <span className="text-slate-900 font-bold">09:00 AM - 06:00 PM</span>.
                            </p>
                        </div>
                        <div className="w-full max-w-lg space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black text-slate-900">Jan {25 - i}, 2026</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">In: 08:55 AM • Out: 06:05 PM</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Present</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : viewMode === "DAILY" ? (
                    <>
                        {/* Daily Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2 relative bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-indigo-500 ml-3" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="border-none focus:ring-0 text-sm font-black text-slate-700 w-full"
                                />
                            </div>
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Quick Search Employee..."
                                    className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Attendance Tape List */}
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daily Register</h2>
                                <div className="flex gap-4 items-center">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        {Object.values(attendance).filter(a => a.status === "PRESENT").length} Present
                                    </span>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        {Object.values(attendance).filter(a => a.status === "ABSENT").length} Absent
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 space-y-2">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <p className="font-bold">Syncing Register...</p>
                                    </div>
                                ) : filteredEmployees.map((emp) => (
                                    <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 rounded-3xl border border-transparent hover:border-slate-100 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center font-black text-slate-900 text-sm shadow-sm">
                                                {emp.first_name[0]}{emp.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm leading-tight">{emp.first_name} {emp.last_name}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5 tracking-tighter">{emp.designations?.title || "Staff"} • {emp.employee_code}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStatusChange(emp.id, "PRESENT")}
                                                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${attendance[emp.id]?.status === "PRESENT"
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                                                    : "bg-white text-slate-400 border border-slate-100 hover:border-emerald-200 hover:text-emerald-500"
                                                    }`}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Present
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(emp.id, "ABSENT")}
                                                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${attendance[emp.id]?.status === "ABSENT"
                                                    ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
                                                    : "bg-white text-slate-400 border border-slate-100 hover:border-rose-200 hover:text-rose-500"
                                                    }`}
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                Absent
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                                <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100">
                                    Finalize Today's Attendance
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 text-center flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                            <Calendar className="w-12 h-12" />
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Monthly Insights Coming Soon</h2>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">We are building a powerful calendar view to track trends, late arrivals, and leave patterns for your branch.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest">Preview Mode</button>
                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest">Enable Notifications</button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
