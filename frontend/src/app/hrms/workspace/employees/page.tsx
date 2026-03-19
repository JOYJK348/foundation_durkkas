"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Building2,
    ArrowRight,
    Loader2,
    CheckCircle2,
    XCircle,
    Download,
    Mail,
    Phone,
    Briefcase,
    MapPin,
    Hash,
    ChevronDown,
    Building,
    UserCircle,
    Globe,
    Layers,
    UserPlus,
    Clock,
    UserCheck,
    UserMinus
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

interface Branch {
    id: string;
    name: string;
    code: string;
    city?: string;
}

interface Employee {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    employee_code: string;
    branch_id: string;
    branch_name?: string;
    designation_name?: string;
    department_name?: string;
    status: "ACTIVE" | "INACTIVE";
    profile_picture?: string;
}

export default function WorkspaceEmployees() {
    const { user } = useAuthStore();
    const userLevel = user?.role?.level || 0;

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
    const [showBranchFilter, setShowBranchFilter] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [employeesData, branchesData, designationsData, departmentsData] = await Promise.all([
                platformService.getEmployees(),
                platformService.getBranches(),
                platformService.getDesignations(),
                platformService.getDepartments()
            ]);

            setBranches(branchesData || []);

            const mapped = (employeesData || []).map((e: any) => ({
                ...e,
                branch_name: branchesData?.find((b: any) => b.id === e.branch_id)?.name || "Unassigned",
                designation_name: designationsData?.find((d: any) => d.id === e.designation_id)?.title || "Staff",
                department_name: departmentsData?.find((d: any) => d.id === e.department_id)?.name || "General",
                status: "ACTIVE"
            }));
            setEmployees(mapped);
        } catch (error) {
            toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    const filtered = employees.filter(e => {
        const fullName = `${e.first_name || ''} ${e.last_name || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            (e.employee_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesBranch = false;
        if (selectedBranchId === "ALL") {
            matchesBranch = true;
        } else if (selectedBranchId === "UNASSIGNED") {
            matchesBranch = !e.branch_id || !branches.find(b => b.id === e.branch_id);
        } else {
            matchesBranch = e.branch_id === selectedBranchId;
        }

        return matchesSearch && matchesBranch;
    });

    const activeBranch = selectedBranchId === "UNASSIGNED"
        ? { name: "Unassigned", city: "Corporate" }
        : branches.find(b => b.id === selectedBranchId);

    const stats = {
        total: employees.length,
        active: employees.filter(e => e.status === "ACTIVE").length,
        unassigned: employees.filter(e => !e.branch_id || !branches.find(b => b.id === e.branch_id)).length
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-12 px-4 md:px-0">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Manage your team and organizational talent</p>
                    </div>
                    {userLevel >= 4 && (
                        <Link
                            href="/hrms/workspace/employees/new"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all hover:shadow-xl active:scale-95"
                        >
                            <UserPlus className="w-5 h-5" />
                            Hire New Staff
                        </Link>
                    )}
                </div>

                {/* KPI Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Strength</p>
                                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Status</p>
                                <p className="text-2xl font-black text-slate-900">{stats.active}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <UserMinus className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unassigned</p>
                                <p className="text-2xl font-black text-slate-900">{stats.unassigned}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, code, or email..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative w-full md:w-64">
                        <button
                            onClick={() => setShowBranchFilter(!showBranchFilter)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span className="truncate">
                                    {selectedBranchId === "ALL" ? "All Locations" : activeBranch?.name}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showBranchFilter ? 'rotate-180' : ''}`} />
                        </button>

                        {showBranchFilter && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-72 overflow-y-auto p-2">
                                <button
                                    onClick={() => { setSelectedBranchId("ALL"); setShowBranchFilter(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${selectedBranchId === "ALL" ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                    All Locations
                                </button>
                                <button
                                    onClick={() => { setSelectedBranchId("UNASSIGNED"); setShowBranchFilter(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${selectedBranchId === "UNASSIGNED" ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                    Unassigned Staff
                                </button>
                                <div className="h-px bg-slate-100 my-2" />
                                {branches.map(branch => (
                                    <button
                                        key={branch.id}
                                        onClick={() => { setSelectedBranchId(branch.id); setShowBranchFilter(false); }}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${selectedBranchId === branch.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        {branch.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm shadow-sm group">
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        Export
                    </button>
                </div>

                {/* Directory Content */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                            <p className="text-sm font-bold text-slate-500">Retrieving talent database...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No matching records</h3>
                            <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
                                We couldn't find any employees matching your current search criteria.
                            </p>
                            {!searchTerm && (
                                <Link
                                    href="/hrms/workspace/employees/new"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add First Member
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Deployment</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Position</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((e) => (
                                        <tr key={e.id} className="group hover:bg-slate-50/50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-xl flex items-center justify-center font-black text-base shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                                                        {e.profile_picture ? (
                                                            <img src={e.profile_picture} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{e.first_name?.[0]}{e.last_name?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                                            {e.first_name} {e.last_name}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded leading-none">
                                                                {e.employee_code}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-slate-400 italic">
                                                                {e.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Building className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-[11px] font-bold uppercase tracking-tight">{e.branch_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Layers className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-medium">{e.department_name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100/50 w-fit">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">{e.designation_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/hrms/workspace/employees/${e.id}`}
                                                    className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all"
                                                >
                                                    <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Mobile View Summary */}
                {!loading && filtered.length > 0 && (
                    <div className="md:hidden pt-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            End of results ({filtered.length} total)
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
