"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    BadgeCheck,
    Loader2,
    Briefcase,
    UserCircle2,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Power,
    CheckCircle2,
    XCircle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";

interface Employee {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    department_id: string;
    designation_id: string;
    is_active: boolean;
    joining_date?: string;
    departments?: { name: string };
    designations?: { title: string };
}

export default function BranchEmployeeList() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const data = await platformService.getEmployees();
            setEmployees(data || []);
        } catch (error) {
            console.error("Failed to load employees", error);
            toast.error("Failed to fetch workforce data");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await platformService.updateEmployee(id, { is_active: !currentStatus });
            toast.success(`Employee ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            loadEmployees();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "ACTIVE" && emp.is_active) ||
            (statusFilter === "INACTIVE" && !emp.is_active);

        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Branch Workforce</h1>
                        <p className="text-sm text-slate-500 font-medium">Manage and monitor your team members</p>
                    </div>
                    <Link
                        href="/branch/employees/new"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-indigo-100 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Employee
                    </Link>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or employee ID..."
                            className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="bg-slate-50 border-none rounded-2xl py-2.5 px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500"
                            value={statusFilter}
                            onChange={(e: any) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active Only</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        <button className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="font-bold text-sm">Fetching team directory...</p>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                <Users className="w-10 h-10 text-slate-200" />
                            </div>
                            <div className="max-w-xs">
                                <p className="font-bold text-slate-900">No employees found</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Try adjusting your search filters or add a new team member to this branch.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-50">
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-5">General Info</th>
                                        <th className="px-6 py-5">Role & Identity</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-8 py-5 text-right w-20">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="group hover:bg-indigo-50/10 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-900 shadow-sm group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all">
                                                        {emp.first_name[0]}{emp.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-tight">
                                                            {emp.first_name} {emp.last_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Mail className="w-3 h-3 text-slate-300" />
                                                            <span className="text-[11px] font-bold text-slate-400">{emp.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
                                                            {emp.designations?.title || "Staff"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                            {emp.employee_code}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-300">• {emp.departments?.name || "Member"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${emp.is_active
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        : "bg-slate-100 text-slate-400 border border-slate-200"
                                                    }`}>
                                                    {emp.is_active ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/branch/employees/${emp.id}`}
                                                        className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 shadow-sm transition-all"
                                                        title="Edit Details"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => toggleStatus(emp.id, emp.is_active)}
                                                        className={`p-2 bg-white rounded-xl border border-slate-100 shadow-sm transition-all ${emp.is_active ? "text-slate-400 hover:text-rose-600" : "text-slate-400 hover:text-emerald-600"
                                                            }`}
                                                        title={emp.is_active ? "Deactivate" : "Activate"}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Dummy */}
                    <div className="bg-slate-50/50 px-8 py-4 flex items-center justify-between border-t border-slate-50">
                        <p className="text-xs font-bold text-slate-400">Showing {filteredEmployees.length} active members</p>
                        <div className="flex items-center gap-1">
                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors disabled:opacity-30" disabled>
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs">1</button>
                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors disabled:opacity-30" disabled>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
