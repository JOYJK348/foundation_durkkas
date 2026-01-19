"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    UserPlus,
    Mail,
    Phone,
    Briefcase,
    Building2,
    Calendar,
    BadgeCheck,
    Shield,
    CheckCircle2,
    Copy,
    ArrowLeft
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";

export default function NewEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<any>(null); // To show credentials

    // Form Data
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        branch_id: "",
        department_id: "",
        designation_id: "",
        employment_type: "PERMANENT",
        date_of_joining: new Date().toISOString().split('T')[0],
        role_id: "" // Important
    });

    // Reference Data
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);

    useEffect(() => {
        loadReferences();
    }, []);

    const loadReferences = async () => {
        try {
            const [bData, dData, desData, rData] = await Promise.all([
                platformService.getBranches(),
                platformService.getDepartments(),
                platformService.getDesignations(),
                platformService.getRoles()
            ]);
            setBranches(bData || []);
            setDepartments(dData || []);
            setDesignations(desData || []);

            // Filter roles suitable for employees (Level 0-2 usually)
            // Filter out Platform/Company Admin roles from selection list
            const validRoles = (rData || []).filter((r: any) => r.level < 4);
            setRoles(validRoles);

            // Set default branch if only one
            if (bData && bData.length === 1) {
                setFormData(prev => ({ ...prev, branch_id: bData[0].id }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load reference data");
        }
    };

    // Field-specific errors for highlighting
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({}); // Clear previous errors

        try {
            // Mapping for API
            const payload = {
                employee: {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                    employee_code: formData.employee_code,
                    branch_id: formData.branch_id,
                    department_id: formData.department_id,
                    designation_id: formData.designation_id,
                    employment_type: formData.employment_type,
                    date_of_joining: formData.date_of_joining
                },
                role_id: formData.role_id,
                permission_ids: [] // Optional granular perms
            };

            const response = await platformService.onboardEmployee(payload);
            setSuccessData(response); // Contains temporary password
            toast.success("Employee onboarding successful!");

        } catch (error: any) {
            console.error(error);

            // Parse error response for user-friendly display
            const errorData = error.response?.data?.error || {};
            const errorCode = errorData.code || '';
            const errorMessage = errorData.message || error.message || 'Onboarding failed';
            const errorField = errorData.field || '';

            // Handle specific error types
            if (errorCode === 'DUPLICATE_ENTRY') {
                // Set field-specific error for highlighting
                if (errorField) {
                    setFieldErrors({ [errorField]: errorMessage });
                }

                // Show appropriate toast based on field
                if (errorField === 'email') {
                    toast.error("Duplicate Email Detected", {
                        description: "This email address is already registered. Please use a different email.",
                        duration: 6000
                    });
                } else if (errorField === 'employee_code') {
                    toast.error("Duplicate Employee Code", {
                        description: "This employee code is already in use. Please generate a new one or enter a unique code.",
                        duration: 6000
                    });
                } else if (errorField === 'phone') {
                    toast.error("Duplicate Phone Number", {
                        description: "This phone number is already registered. Please use a different number.",
                        duration: 6000
                    });
                } else {
                    toast.error("Duplicate Entry", { description: errorMessage, duration: 6000 });
                }
            } else if (errorCode === 'VALIDATION_ERROR') {
                if (errorField) {
                    setFieldErrors({ [errorField]: errorMessage });
                }
                toast.error("Validation Error", { description: errorMessage, duration: 5000 });
            } else if (errorCode === 'INVALID_REFERENCE') {
                toast.error("Invalid Selection", { description: errorMessage, duration: 5000 });
            } else {
                // Generic error
                toast.error("Onboarding Failed", { description: errorMessage, duration: 5000 });
            }
        } finally {
            setLoading(false);
        }
    };

    if (successData) {
        return (
            <DashboardLayout>
                <div className="max-w-xl mx-auto py-20">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden text-center p-12">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Onboarding Complete!</h2>
                        <p className="text-slate-500 mt-2">The employee account has been created successfully.</p>

                        <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Access Credentials</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Email ID</label>
                                    <p className="text-lg font-bold text-slate-900">{successData.user.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Temporary Password</label>
                                    <div className="flex items-center gap-3">
                                        <p className="text-xl font-mono font-bold text-indigo-600 bg-white px-3 py-1 rounded border border-indigo-100">
                                            {successData.user.temporary_password}
                                        </p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(successData.user.temporary_password);
                                                toast("Password copied!");
                                            }}
                                            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-amber-600 mt-2 font-bold flex items-center gap-1">
                                        ⚠️ Provide this to the user immediately. It will not be shown again.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <Link href="/branch/employees" className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">
                                Back to Directory
                            </Link>
                            <button
                                onClick={() => { setSuccessData(null); setFormData({ ...formData, email: '', employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}` }); }}
                                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                            >
                                Onboard Another
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/branch/employees" className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Onboard New Talent</h1>
                        <p className="text-sm text-slate-500 font-medium">Create employee record and system access</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-10 shadow-sm space-y-8">

                    {/* 1. System Access (Tutor/Employee) - Prominent first step for User Request */}
                    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-indigo-900">System Role Assignment</h3>
                        </div>
                        <p className="text-sm text-indigo-700/80 mb-6 font-medium">
                            Select the primary role. This determines if they get the Employee Dashboard or Tutor Dashboard.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-800 ml-1 uppercase">System Role</label>
                                <select
                                    required
                                    className="w-full bg-white border-indigo-200 rounded-2xl p-4 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 transition-all"
                                    value={formData.role_id}
                                    onChange={e => setFormData({ ...formData, role_id: e.target.value })}
                                >
                                    <option value="">Select Access Level...</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.display_name} ({role.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center p-4 bg-white/50 rounded-2xl border border-indigo-100">
                                <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                                    ℹ️ <strong>TUTOR:</strong> Access to Academic Dashboard.<br />
                                    ℹ️ <strong>EMPLOYEE:</strong> Access to Attendance/Leave Dashboard.<br />
                                    ℹ️ <strong>BRANCH_ADMIN:</strong> Full Branch Access.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Personal Information */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                            <UserPlus className="w-5 h-5 text-slate-400" />
                            <h3 className="font-bold text-slate-900">Personal Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">First Name</label>
                                <input
                                    required
                                    type="text"
                                    className="input-premium w-full"
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">Last Name</label>
                                <input
                                    required
                                    type="text"
                                    className="input-premium w-full"
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={`text-xs font-bold ml-1 ${fieldErrors.email ? 'text-rose-600' : 'text-slate-500'}`}>Email (Official)</label>
                                <div className="relative">
                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.email ? 'text-rose-500' : 'text-slate-400'}`} />
                                    <input
                                        required
                                        type="email"
                                        className={`input-premium w-full pl-10 ${fieldErrors.email ? 'border-rose-400 bg-rose-50 focus:ring-rose-500/20' : ''}`}
                                        value={formData.email}
                                        onChange={e => { setFormData({ ...formData, email: e.target.value }); if (fieldErrors.email) setFieldErrors(prev => { const n = { ...prev }; delete n.email; return n; }); }}
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                                        ⚠️ {fieldErrors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        className="input-premium w-full pl-10"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Organizational Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                            <Briefcase className="w-5 h-5 text-slate-400" />
                            <h3 className="font-bold text-slate-900">Position Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">Branch</label>
                                <select
                                    required
                                    className="input-premium w-full"
                                    value={formData.branch_id}
                                    onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                                >
                                    <option value="">Select Branch...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">Department</label>
                                <select
                                    required
                                    className="input-premium w-full"
                                    value={formData.department_id}
                                    onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                                >
                                    <option value="">Select Dept...</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">Designation</label>
                                <select
                                    required
                                    className="input-premium w-full"
                                    value={formData.designation_id}
                                    onChange={e => setFormData({ ...formData, designation_id: e.target.value })}
                                >
                                    <option value="">Select Title...</option>
                                    {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className={`text-xs font-bold ml-1 ${fieldErrors.employee_code ? 'text-rose-600' : 'text-slate-500'}`}>Employee Code</label>
                                <div className="relative">
                                    <BadgeCheck className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.employee_code ? 'text-rose-500' : 'text-slate-400'}`} />
                                    <input
                                        required
                                        type="text"
                                        className={`input-premium w-full pl-10 font-mono ${fieldErrors.employee_code ? 'border-rose-400 bg-rose-50 focus:ring-rose-500/20' : ''}`}
                                        value={formData.employee_code}
                                        onChange={e => { setFormData({ ...formData, employee_code: e.target.value }); if (fieldErrors.employee_code) setFieldErrors(prev => { const n = { ...prev }; delete n.employee_code; return n; }); }}
                                    />
                                </div>
                                {fieldErrors.employee_code && (
                                    <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                                        ⚠️ {fieldErrors.employee_code}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">Date of Joining</label>
                                <input
                                    required
                                    type="date"
                                    className="input-premium w-full"
                                    value={formData.date_of_joining}
                                    onChange={e => setFormData({ ...formData, date_of_joining: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-6 flex justify-end gap-4 border-t border-slate-50">
                        <Link href="/branch/employees" className="px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1 flex items-center gap-2"
                        >
                            {loading ? "Processing..." : "Complete Onboarding"}
                        </button>
                    </div>

                </form>
            </div>
        </DashboardLayout>
    );
}
