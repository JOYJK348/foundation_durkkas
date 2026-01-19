"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, MapPin, Users, ChevronDown, ChevronRight, Loader2, FileText, Download } from "lucide-react";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Company {
    id: string;
    name: string;
    code: string;
    email: string;
    country: string;
    subscription_plan: string;
}

interface Branch {
    id: string;
    name: string;
    code: string;
    company_id: string;
    city: string;
    state: string;
    country: string;
}

interface Employee {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_id: string;
    branch_id: string;
    department_id: string;
}

interface Department {
    id: string;
    name: string;
    code: string;
    company_id: string;
    branch_id: string;
}

interface OrganizationalReport {
    company: Company;
    branches: {
        branch: Branch;
        employees: Employee[];
        departments: Department[];
    }[];
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<OrganizationalReport[]>([]);
    const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
    const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
    const [quickView, setQuickView] = useState<{ type: 'COMPANY' | 'BRANCH', data: any } | null>(null);

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        try {
            setLoading(true);
            const [companies, branches, employees, departments] = await Promise.all([
                platformService.getCompanies(),
                platformService.getBranches(),
                platformService.getEmployees(),
                platformService.getDepartments()
            ]);

            // Build hierarchical structure
            const organizationalReports: OrganizationalReport[] = companies.map((company: Company) => {
                const companyBranches = branches.filter((b: Branch) => b.company_id === company.id);

                return {
                    company,
                    branches: companyBranches.map((branch: Branch) => ({
                        branch,
                        employees: employees.filter((e: Employee) => e.branch_id === branch.id),
                        departments: departments.filter((d: Department) => d.branch_id === branch.id)
                    }))
                };
            });

            setReports(organizationalReports);
            // Default expand first company if exists
            if (organizationalReports.length > 0) {
                setExpandedCompanies(new Set([organizationalReports[0].company.id]));
            }
        } catch (error) {
            console.error("Failed to load report data", error);
            toast.error("Failed to load organizational report");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (reports.length === 0) return;

        const excelData: any[] = [];

        reports.forEach(report => {
            report.branches.forEach(branchData => {
                if (branchData.employees.length === 0) {
                    excelData.push({
                        "Company Name": report.company.name,
                        "Company Code": report.company.code,
                        "Branch Name": branchData.branch.name,
                        "Branch Code": branchData.branch.code,
                        "City": branchData.branch.city,
                        "Employee Name": "No Employees",
                        "Employee Code": "-",
                        "Email": "-",
                        "Phone": "-"
                    });
                } else {
                    branchData.employees.forEach(employee => {
                        excelData.push({
                            "Company Name": report.company.name,
                            "Company Code": report.company.code,
                            "Branch Name": branchData.branch.name,
                            "Branch Code": branchData.branch.code,
                            "City": branchData.branch.city,
                            "Employee Name": `${employee.first_name} ${employee.last_name}`,
                            "Employee Code": employee.employee_code,
                            "Email": employee.email,
                            "Phone": employee.phone || "-"
                        });
                    });
                }
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Workforce Audit");

        // Auto-size columns
        const maxWidths = excelData.reduce((acc: any, row) => {
            Object.keys(row).forEach((key, i) => {
                const val = String(row[key]);
                acc[i] = Math.max(acc[i] || 0, val.length + 2);
            });
            return acc;
        }, []);
        worksheet["!cols"] = maxWidths.map((w: number) => ({ w }));

        XLSX.writeFile(workbook, `Organizational_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Workforce Audit Report downloaded successfully");
    };

    const toggleCompany = (companyId: string) => {
        const newExpanded = new Set(expandedCompanies);
        if (newExpanded.has(companyId)) {
            newExpanded.delete(companyId);
        } else {
            newExpanded.add(companyId);
        }
        setExpandedCompanies(newExpanded);
    };

    const toggleBranch = (branchId: string) => {
        const newExpanded = new Set(expandedBranches);
        if (newExpanded.has(branchId)) {
            newExpanded.delete(branchId);
        } else {
            newExpanded.add(branchId);
        }
        setExpandedBranches(newExpanded);
    };

    const getTotalEmployees = () => {
        return reports.reduce((total, report) =>
            total + report.branches.reduce((branchTotal, b) => branchTotal + b.employees.length, 0), 0
        );
    };

    const getTotalBranches = () => {
        return reports.reduce((total, report) => total + report.branches.length, 0);
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-10 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-slate-200">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Intelligence</h1>
                            <p className="text-sm text-slate-500 font-medium">Strategic organizational audit and distributed asset reporting</p>
                        </div>
                    </div>
                    <button
                        onClick={exportToExcel}
                        disabled={loading || reports.length === 0}
                        className="flex items-center gap-3 px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                    >
                        <Download className="w-4 h-4" />
                        Generate Workforce Audit
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Active Units", value: getTotalBranches(), sub: "Operational Branches", color: "text-blue-600", bg: "bg-blue-50", icon: MapPin },
                        { label: "Total Talent", value: getTotalEmployees(), sub: "Assigned Workforce", color: "text-purple-600", bg: "bg-purple-50", icon: Users },
                        { label: "Tax Entities", value: reports.length, sub: "Registered Companies", color: "text-emerald-600", bg: "bg-emerald-50", icon: Building2 },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <p className="text-[10px] font-bold text-slate-300 mt-2">{stat.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Organizational Hierarchy */}
                <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Distributed Asset Matrix</h2>
                            <p className="text-xs text-slate-400 font-medium mt-1">Hierarchical visualization of organizational structure</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-rose-400" />
                        </div>
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-6">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Distributed Data...</p>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-24 space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <FileText className="w-10 h-10 text-slate-200" />
                                </div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No structural data identified</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reports.map((report) => (
                                    <div key={report.company.id} className="bg-slate-50/50 rounded-[40px] border border-slate-100 overflow-hidden">
                                        {/* Company Header */}
                                        <div
                                            onClick={() => toggleCompany(report.company.id)}
                                            className="flex items-center justify-between p-8 hover:bg-white cursor-pointer transition-all role-button"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`p-4 rounded-[20px] transition-all ${expandedCompanies.has(report.company.id) ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{report.company.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{report.company.code}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{report.company.country}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setQuickView({ type: 'COMPANY', data: report }); }}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                                >
                                                    View Network
                                                </button>
                                                {expandedCompanies.has(report.company.id) ? (
                                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Branches */}
                                        {expandedCompanies.has(report.company.id) && (
                                            <div className="p-8 pt-0 space-y-4">
                                                {report.branches.map((branchData) => (
                                                    <div key={branchData.branch.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                                        {/* Branch Header */}
                                                        <div
                                                            onClick={(e) => { e.stopPropagation(); toggleBranch(branchData.branch.id); }}
                                                            className="flex items-center justify-between p-6 cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-[15px] flex items-center justify-center">
                                                                    <MapPin className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-black text-slate-900 tracking-tight">{branchData.branch.name}</h4>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                                        {branchData.branch.city} • {branchData.branch.state}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setQuickView({ type: 'BRANCH', data: branchData }); }}
                                                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                                                >
                                                                    Analyze Unit
                                                                </button>
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedBranches.has(branchData.branch.id) ? 'bg-slate-100 rotate-180' : 'bg-slate-50'}`}>
                                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Employees List */}
                                                        {expandedBranches.has(branchData.branch.id) && (
                                                            <div className="px-6 pb-6 space-y-3">
                                                                {branchData.employees.length === 0 ? (
                                                                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Context Empty: No Staff Registered</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        {branchData.employees.map((employee) => (
                                                                            <div key={employee.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className="w-10 h-10 bg-white text-slate-700 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                                                        {employee.first_name.charAt(0)}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-xs font-black text-slate-900 tracking-tight">
                                                                                            {employee.first_name} {employee.last_name}
                                                                                        </p>
                                                                                        <p className="text-[9px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors">{employee.email}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <span className="text-[9px] font-black font-mono text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100 group-hover:text-slate-900 group-hover:border-blue-200 transition-all">
                                                                                    {employee.employee_code}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Quick Portfolio Modal */}
            {quickView && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col border border-slate-100">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                        {quickView.type === 'COMPANY' ? `${quickView.data.company.name} Network` : `${quickView.data.branch.name} Portfolio`}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instant Organizational Audit</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setQuickView(null)}
                                className="w-12 h-12 bg-white text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all border border-slate-100 shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8">
                            {quickView.type === 'COMPANY' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {quickView.data.branches.map((b: any) => (
                                        <div key={b.branch.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-slate-900">{b.branch.name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{b.branch.city}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white/60 p-4 rounded-2xl border border-white space-y-2">
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Core Personnel</p>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {b.employees.length === 0 ? (
                                                        <span className="text-[10px] text-slate-400 italic">No assigned staff</span>
                                                    ) : b.employees.map((e: any, i: number) => (
                                                        <span key={e.id} className="text-[11px] font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                                            {e.first_name} {e.last_name}{i < b.employees.length - 1 ? ',' : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-emerald-50 p-6 rounded-[28px] border border-emerald-100/50">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Unit Staff</p>
                                            <p className="text-2xl font-black text-emerald-900">{quickView.data.employees.length}</p>
                                        </div>
                                        <div className="bg-blue-50 p-6 rounded-[28px] border border-blue-100/50">
                                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Departments</p>
                                            <p className="text-2xl font-black text-blue-900">{quickView.data.departments.length}</p>
                                        </div>
                                        <div className="bg-slate-900 p-6 rounded-[28px] text-white">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Code</p>
                                            <p className="text-xl font-mono font-black">{quickView.data.branch.code}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 border border-slate-100 rounded-[32px] p-8">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Personnel Register</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {quickView.data.employees.map((e: any) => (
                                                <div key={e.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-black">
                                                        {e.first_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900">{e.first_name} {e.last_name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{e.employee_code}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
