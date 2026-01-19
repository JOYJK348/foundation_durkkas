"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Users, MapPin, Save, ArrowLeft,
    Loader2, Mail, Phone, Briefcase, Calendar,
    User, HardDrive, ShieldCheck, Trash2,
    ChevronRight, Building, Edit3, AlertTriangle,
    X, CheckCircle, UserCircle, Building2, Layers,
    ShieldAlert, Fingerprint, Clock, Activity,
    MoreVertical, Info
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function EditEmployeePage() {
    const { user } = useAuthStore();
    const userLevel = user?.role?.level || 0;

    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");

    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        employee_code: "",
        branch_id: "",
        department_id: "",
        designation_id: "",
        employment_type: "FULL_TIME",
        date_of_joining: "",
        is_active: true
    });

    useEffect(() => {
        if (params.id) {
            loadData(params.id as string);
        }
    }, [params.id]);

    const loadData = async (id: string) => {
        try {
            setLoading(true);
            const [employee, branchesList, departmentsList, designationsList] = await Promise.all([
                platformService.getEmployee(id),
                platformService.getBranches(),
                platformService.getDepartments(),
                platformService.getDesignations()
            ]);

            setBranches(branchesList || []);
            setDepartments(departmentsList || []);
            setDesignations(designationsList || []);

            setFormData({
                first_name: employee.first_name || "",
                last_name: employee.last_name || "",
                email: employee.email || "",
                phone: employee.phone || "",
                employee_code: employee.employee_code || "",
                branch_id: employee.branch_id || "",
                department_id: employee.department_id || "",
                designation_id: employee.designation_id || "",
                employment_type: employee.employment_type || "FULL_TIME",
                date_of_joining: employee.date_of_joining || "",
                is_active: employee.is_active ?? true
            });
        } catch (error) {
            toast.error("Failed to load employee record");
            router.push("/workspace/employees");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await platformService.updateEmployee(params.id as string, formData);
            toast.success("Identity updated successfully");
            router.push("/workspace/employees");
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteReason.trim()) {
            toast.error("Valid reason required for termination");
            return;
        }

        setDeleting(true);
        try {
            await platformService.deleteEmployee(params.id as string, deleteReason);
            toast.success("Resource successfully terminated from active roster");
            router.push("/workspace/employees");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Termination sequence failed");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-24 px-4">
                {/* Header with quick actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex items-start gap-5">
                        <Link
                            href="/workspace/employees"
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Governance</h1>
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    Active Record
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium">Managing identity: <span className="text-blue-600 font-black uppercase tracking-tight">{formData.first_name} {formData.last_name}</span></p>
                        </div>
                    </div>

                    {userLevel >= 4 && (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                            >
                                <MoreVertical size={20} />
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-black text-[11px] uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                            >
                                <ShieldAlert size={16} />
                                Terminate
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Deep Config */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Identity Matrix */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
                                    <Fingerprint size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900">Identity Matrix</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal First Name</label>
                                    <input
                                        name="first_name" value={formData.first_name} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Last Name</label>
                                    <input
                                        name="last_name" value={formData.last_name} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authenticated Email (Primary ID)</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors" />
                                        <input
                                            name="email" type="email" value={formData.email} onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Contact Terminal</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            name="phone" value={formData.phone} onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Employment Scope */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                                <div className="p-2 bg-violet-600 text-white rounded-xl shadow-sm">
                                    <Building2 size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900">Employment Scope</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Branch</label>
                                    <select
                                        name="branch_id" value={formData.branch_id} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Choose Unit...</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department Cluster</label>
                                    <select
                                        name="department_id" value={formData.department_id} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose Cluster...</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Designation</label>
                                    <select
                                        name="designation_id" value={formData.designation_id} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement Type</label>
                                    <select
                                        name="employment_type" value={formData.employment_type} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="FULL_TIME">Standard Full-Time</option>
                                        <option value="PART_TIME">Standard Part-Time</option>
                                        <option value="CONTRACT">Contract Basis</option>
                                        <option value="INTERN">Academic Intern</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corporate Hash (ID)</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                                        <input
                                            name="employee_code" value={formData.employee_code} onChange={handleChange}
                                            className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-black text-blue-600 focus:border-blue-500 transition-all outline-none uppercase font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Induction Date</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Performance & Control */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Control Terminal */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 sticky top-10 border border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl backdrop-blur-md border border-blue-500/20">
                                    <Activity size={24} />
                                </div>
                                <h3 className="text-xl font-black tracking-tight">Governance</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-4">
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Audit Status</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-emerald-400">Verified Identity</span>
                                            <CheckCircle size={16} className="text-emerald-500" />
                                        </div>
                                    </div>

                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Access Protocol</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-amber-400">Enterprise Role</span>
                                            <ShieldCheck size={16} className="text-amber-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center px-4">Executive Authorization Required</p>
                                    <button
                                        type="submit" disabled={saving}
                                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 active:scale-[0.98] text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                                        Sync Identity
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Integration Note */}
                        <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                                <Info size={16} className="text-blue-500" />
                                <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Platform Sync</h4>
                            </div>
                            <p className="text-xs font-bold text-blue-700/80 leading-relaxed italic">
                                Identity updates are propagated across all active modules (Payroll, CRM, LMS) in real-time.
                            </p>
                        </div>
                    </div>
                </form>

                {/* Modern Termination Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in transition-all">
                        <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col items-center text-center">
                            <div className="bg-rose-600 w-full p-12 text-white flex flex-col items-center">
                                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6">
                                    <ShieldAlert size={40} />
                                </div>
                                <h3 className="text-3xl font-black tracking-tight">Termination Protocol</h3>
                                <p className="text-rose-100 mt-2 font-medium">Decommissioning talent record</p>
                            </div>

                            <div className="p-12 w-full space-y-8">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formal Reason Required</p>
                                    <textarea
                                        value={deleteReason}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                        placeholder="Enter the formal reason for decommissioning this resource..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none resize-none"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => { setShowDeleteModal(false); setDeleteReason(""); }}
                                        className="py-5 px-6 bg-slate-100 text-slate-600 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                        disabled={deleting}
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting || !deleteReason.trim()}
                                        className="py-5 px-6 bg-rose-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-rose-200 transition-all hover:bg-rose-500"
                                    >
                                        {deleting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                        Execute
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
