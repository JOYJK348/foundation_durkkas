"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Save, ArrowLeft, Loader2, Mail, Phone,
    Building, Calendar, User, Shield,
    CheckCircle2, AlertCircle, Copy, Zap,
    LayoutGrid, ChevronRight, UserCog, MapPin, Briefcase, XCircle,
    UserCircle, Building2, Layers, Key, Hash
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function OnboardEmployeePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const userLevel = user?.role?.level || 0;

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [successData, setSuccessData] = useState<any>(null);
    const [emailChecking, setEmailChecking] = useState(false);
    const [emailError, setEmailError] = useState("");

    // Reference Data
    const [branches, setBranches] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [enabledModules, setEnabledModules] = useState<string[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        employee_code: "",
        branch_id: "",
        department_id: "",
        designation_id: "",
        employment_type: "FULL_TIME",
        date_of_joining: new Date().toISOString().split('T')[0],
        address_line1: "",
        city: "",
        state: "",
        country: "India",
        postal_code: "",
        role_id: ""
    });

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (userLevel > 0) loadOnboardingContext();
    }, [userLevel]);

    const loadOnboardingContext = async () => {
        try {
            setFetchingData(true);
            const [companiesData, brs, des, dep, rls, perms] = await Promise.all([
                platformService.getCompanies(),
                platformService.getBranches(),
                platformService.getDesignations(),
                platformService.getDepartments(),
                platformService.getRoles(),
                platformService.getPermissions()
            ]);

            const currentCompany = companiesData[0];
            setCompany(currentCompany);

            let activeModules: string[] = [];
            if (currentCompany?.enabled_modules) {
                if (Array.isArray(currentCompany.enabled_modules)) {
                    activeModules = currentCompany.enabled_modules;
                } else if (typeof currentCompany.enabled_modules === 'string') {
                    try { activeModules = JSON.parse(currentCompany.enabled_modules); } catch (e) { }
                }
            }
            setEnabledModules(activeModules);

            setBranches(brs || []);
            setDesignations(des || []);
            setDepartments(dep || []);

            const availableRoles = (rls || []).filter((r: any) => {
                if (userLevel === 5) return true;
                return r.level < userLevel;
            });
            setRoles(availableRoles);
            setPermissions(perms || []);

            try {
                const nextCodeData = await platformService.getNextEmployeeCode();
                if (nextCodeData?.code) {
                    setFormData(prev => ({ ...prev, employee_code: nextCodeData.code }));
                }
            } catch (err) {
                console.warn('Could not fetch next employee code');
            }

        } catch (error) {
            toast.error("Failed to load reference data");
        } finally {
            setFetchingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'email') setEmailError("");
    };

    const checkEmailDuplicate = async (email: string) => {
        if (!email || !email.includes('@')) return;
        setEmailChecking(true);
        try {
            const users = await platformService.getUsers();
            const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
            if (existingUser) setEmailError("Email address is already linked to another account.");
            else setEmailError("");
        } catch (error) {
            console.error("Email check failed", error);
        } finally {
            setEmailChecking(false);
        }
    };

    const togglePermission = (id: string) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const toggleModule = (moduleName: string, modulePerms: any[]) => {
        const ids = modulePerms.map(p => p.id);
        const allSelected = ids.every(id => selectedPermissions.includes(id));
        if (allSelected) setSelectedPermissions(prev => prev.filter(id => !ids.includes(id)));
        else setSelectedPermissions(prev => [...prev, ...ids.filter(id => !selectedPermissions.includes(id))]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (emailError) {
            toast.error("Please resolve critical errors before submission.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                employee: { ...formData, middle_name: formData.middle_name || null },
                role_id: formData.role_id,
                permission_ids: selectedPermissions
            };
            const result = await platformService.onboardEmployee(payload);
            setSuccessData(result);
            toast.success("Talent successfully onboarded to the platform");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Onboarding operation failed");
        } finally {
            setLoading(false);
        }
    };

    const filterPermissionsByModules = () => {
        if (enabledModules.length === 0) return permissions;
        return permissions.filter((p: any) => {
            const resource = p.resource?.toUpperCase() || 'CORE';
            if (resource === 'CORE' || resource === 'GENERAL') return true;
            return enabledModules.some(mod =>
                resource.includes(mod.toUpperCase()) || mod.toUpperCase().includes(resource)
            );
        });
    };

    const groupedPermissions = filterPermissionsByModules().reduce((acc: any, p: any) => {
        const resource = p.resource || 'General';
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(p);
        return acc;
    }, {});

    if (fetchingData) {
        return (
            <DashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (successData) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto py-12 px-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 text-center text-white">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">Onboarding Complete</h2>
                            <p className="text-emerald-100/80 mt-2 font-medium">Authentication vault updated successfully</p>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Key size={80} className="text-slate-900" />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Secure Login Pipeline</p>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Identity Endpoint</p>
                                            <p className="text-xl font-black text-slate-900 select-all">{successData.user.email}</p>
                                        </div>
                                        <div className="pt-6 border-t border-slate-200/60">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Temporary Access Key</p>
                                            <div className="flex items-center justify-center gap-3">
                                                <code className="text-2xl font-black font-mono text-blue-600 bg-white border-2 border-dashed border-blue-200 px-6 py-2 rounded-2xl">
                                                    {successData.user.temporary_password}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(successData.user.temporary_password);
                                                        toast.success("Credential copied to clipboard");
                                                    }}
                                                    className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all"
                                                >
                                                    <Copy size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    href="/workspace/employees"
                                    className="py-4 px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 text-center transition-all flex items-center justify-center gap-2"
                                >
                                    Directory
                                    <ArrowLeft size={16} className="rotate-180" />
                                </Link>
                                <button
                                    onClick={() => {
                                        setSuccessData(null);
                                        setFormData({
                                            ...formData,
                                            email: '', first_name: '', middle_name: '', last_name: '',
                                            phone: '', date_of_birth: '', gender: '', address_line1: '',
                                            city: '', state: '', postal_code: ''
                                        });
                                        setSelectedPermissions([]);
                                        loadOnboardingContext();
                                    }}
                                    className="py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 text-center transition-all"
                                >
                                    Add Another
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-24 px-4">
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex gap-4">
                        <Link
                            href="/workspace/employees"
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm h-fit"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Talent Acquisition</h1>
                            <p className="text-slate-500 font-medium mt-1">Onboard new organizational assets to your workspace</p>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Global Onboarding Active</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Primary Configuration */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Core Identity */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
                                    <UserCircle size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900">Core Identity</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                                    <input
                                        required name="first_name" value={formData.first_name} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        placeholder="e.g., Jonathan"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                                    <input
                                        required name="last_name" value={formData.last_name} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        placeholder="e.g., Wick"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corporate Email (ID)</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required type="email" name="email" value={formData.email} onChange={handleChange}
                                            onBlur={(e) => checkEmailDuplicate(e.target.value)}
                                            className={`w-full bg-slate-50/50 border ${emailError ? 'border-rose-200 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-200 focus:ring-blue-500/10 focus:border-blue-500'} rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold transition-all outline-none`}
                                            placeholder="j.wick@continental.com"
                                        />
                                        {emailChecking && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
                                    </div>
                                    {emailError && <p className="text-[10px] font-bold text-rose-500 mt-1 pl-1 flex items-center gap-1"><XCircle size={12} /> {emailError}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Contact Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required name="phone" value={formData.phone} onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender Orientation</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['MALE', 'FEMALE', 'OTHER'].map(g => (
                                            <button
                                                key={g} type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                                                className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${formData.gender === g ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Deployment Details */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                                <div className="p-2 bg-violet-600 text-white rounded-xl shadow-sm">
                                    <Building2 size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900">Workspace Deployment</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Branch</label>
                                    <select
                                        required name="branch_id" value={formData.branch_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, branch_id: e.target.value, department_id: '' }))}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Branch...</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Department</label>
                                    <select
                                        required name="department_id" value={formData.department_id} onChange={handleChange}
                                        disabled={!formData.branch_id}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="">{formData.branch_id ? 'Select Department...' : 'Awaiting Branch Select'}</option>
                                        {departments.filter(d => !d.branch_id || d.branch_id.toString() === formData.branch_id.toString()).map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank / Designation</label>
                                    <select
                                        required name="designation_id" value={formData.designation_id} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Designation...</option>
                                        {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset ID Number</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required name="employee_code" value={formData.employee_code} onChange={handleChange}
                                            className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3 px-11 text-sm font-black text-blue-600 focus:border-blue-500 transition-all outline-none uppercase font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joining Date</label>
                                    <input
                                        required type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agreement Category</label>
                                    <select
                                        name="employment_type" value={formData.employment_type} onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="FULL_TIME">Standard Full-Time</option>
                                        <option value="PART_TIME">Standard Part-Time</option>
                                        <option value="CONTRACT">Project Contract</option>
                                        <option value="INTERN">Academia Internship</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Logic & Permissions */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
                                    <LayoutGrid size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900">Operational Micro-Permissions</h3>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.keys(groupedPermissions).map((resource) => {
                                        const modPerms = groupedPermissions[resource];
                                        const allSelected = modPerms.every((p: any) => selectedPermissions.includes(p.id));
                                        return (
                                            <div key={resource} className={`p-5 rounded-2xl border transition-all ${allSelected ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{resource}</h4>
                                                    <button type="button" onClick={() => toggleModule(resource, modPerms)} className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${allSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                        {allSelected ? 'DESELECT' : 'SELECT ALL'}
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {modPerms.map((p: any) => (
                                                        <label key={p.id} className="flex items-center gap-3 cursor-pointer group select-none">
                                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedPermissions.includes(p.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 group-hover:border-emerald-300'}`}>
                                                                {selectedPermissions.includes(p.id) && <CheckCircle2 size={12} className="stroke-[3]" />}
                                                            </div>
                                                            <input type="checkbox" className="hidden" checked={selectedPermissions.includes(p.id)} onChange={() => togglePermission(p.id)} />
                                                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{p.display_name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Configuration */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* System Access Card */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 sticky top-10 border border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl backdrop-blur-md border border-emerald-500/20">
                                    <Shield size={24} />
                                </div>
                                <h3 className="text-xl font-black tracking-tight">Access Control</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Primary System Role</label>
                                    <select
                                        required name="role_id" value={formData.role_id} onChange={handleChange}
                                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:border-emerald-500 transition-all outline-none cursor-pointer appearance-none"
                                    >
                                        <option value="">Choose Role...</option>
                                        {roles.map(r => <option key={r.id} value={r.id} className="bg-slate-900">{r.display_name}</option>)}
                                    </select>
                                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                        <div className="flex gap-3">
                                            <Zap size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                                Onboarding will trigger an automated secure password generation sequence.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-800 space-y-4">
                                    <div className="group flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-all">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Delivery</span>
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    </div>
                                    <div className="group flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-all">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vault Integration</span>
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={loading || !!emailError}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 active:scale-[0.98] text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                                    Onboard Talent
                                </button>
                            </div>
                        </div>

                        {/* Summary Widget */}
                        <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                <h4 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest">Submission Protocol</h4>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    'Unique organizational email validation enforced',
                                    'Auto-registration in selected branch cluster',
                                    'Implicit grant of HRMS Base access',
                                    'Activity logs will track this creation'
                                ].map((note, i) => (
                                    <li key={i} className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-1.5 flex-shrink-0" />
                                        <span className="text-xs font-bold text-indigo-700/80 leading-snug tracking-tight">{note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
