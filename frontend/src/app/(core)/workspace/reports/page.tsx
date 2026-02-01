"use client";

import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
    Building2,
    Users,
    Search,
    FileSpreadsheet,
    File as FileIcon,
    ShieldCheck,
    History,
    Star,
    Eye,
    X,
    LayoutDashboard,
    Loader2,
    Download,
    Filter,
    Presentation
} from "lucide-react";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { crmService } from "@/services/crmService";
import { useFeatureAccess } from "@/contexts/FeatureAccessContext";

// Type definitions
interface Branch { id: string; name: string; code: string; city: string; state: string; }
interface Department { id: string; name: string; branch_id: string; }
interface Employee { id: string; employee_code: string; first_name: string; last_name: string; email: string; phone: string; branch_id: string; department_id: string; is_active: boolean; }
interface AuditLog { id: string; action: string; table_name: string; performed_by: string; created_at: string; }
interface CRMLead { id: string; name: string; email: string; type: string; date: string; }

type ReportType = 'TEAM' | 'BRANCHES' | 'ACTIVITY' | 'LEADS';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportType>('TEAM');

    // Data State
    const [branches, setBranches] = useState<Branch[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [crmLeads, setCrmLeads] = useState<CRMLead[]>([]);
    const [detailRecord, setDetailRecord] = useState<{ title: string, data: any } | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const { hasModule } = useFeatureAccess();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { loadAllData(); }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [br, emp, dept, logs] = await Promise.all([
                platformService.getBranches(),
                platformService.getEmployees(),
                platformService.getDepartments(),
                platformService.getAuditLogs()
            ]);
            setBranches(br || []);
            setEmployees(emp || []);
            setDepartments(dept || []);
            setAuditLogs(logs || []);

            if (hasModule('CRM')) {
                const leads = await crmService.getRecentLeads();
                setCrmLeads(leads || []);
            }
        } catch (error) {
            toast.error("Failed to load records");
        } finally {
            setLoading(false);
        }
    };

    // Filtered Views
    const filteredEmployees = useMemo(() => employees.filter(e =>
        (e.first_name + e.last_name + e.employee_code).toLowerCase().includes(searchTerm.toLowerCase())
    ), [employees, searchTerm]);

    const filteredAudit = useMemo(() => auditLogs.filter(l =>
        (l.action + l.performed_by).toLowerCase().includes(searchTerm.toLowerCase())
    ), [auditLogs, searchTerm]);

    const filteredCRM = useMemo(() => crmLeads.filter(l =>
        (l.name + l.email).toLowerCase().includes(searchTerm.toLowerCase())
    ), [crmLeads, searchTerm]);

    // 📥 Professional Export: Excel
    const exportExcel = () => {
        let exportData: any[] = [];
        let sheetName = activeTab.charAt(0) + activeTab.slice(1).toLowerCase();

        if (activeTab === 'TEAM') {
            exportData = filteredEmployees.map(e => ({
                "ID": e.employee_code,
                "Full Name": `${e.first_name} ${e.last_name}`,
                "Email Address": e.email,
                "Contact Number": e.phone || "N/A",
                "Branch": branches.find(b => b.id === e.branch_id)?.name || "N/A",
                "Department": departments.find(d => d.id === e.department_id)?.name || "N/A",
                "Account Status": e.is_active ? "Active" : "Inactive"
            }));
        } else if (activeTab === 'BRANCHES') {
            exportData = branches.map(b => ({
                "Branch Code": b.code,
                "Branch Name": b.name,
                "Location": `${b.city}, ${b.state}`,
                "Staff Count": employees.filter(e => e.branch_id === b.id).length
            }));
        } else if (activeTab === 'ACTIVITY') {
            exportData = filteredAudit.map(l => ({
                "Timestamp": new Date(l.created_at).toLocaleString(),
                "Action Performed": l.action,
                "Target Resource": l.table_name,
                "Operator": l.performed_by
            }));
        } else if (activeTab === 'LEADS') {
            exportData = filteredCRM.map(l => ({
                "Lead Name": l.name,
                "Email": l.email,
                "Channel Type": l.type,
                "Inbound Date": new Date(l.date).toLocaleDateString()
            }));
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Company Records");
        XLSX.writeFile(wb, `Durkkas_${sheetName}_Report_${new Date().getTime()}.xlsx`);
        toast.success(`${sheetName} spreadsheet generated`);
    };

    // 📥 Professional Export: PDF
    const exportPDF = () => {
        const doc = new jsPDF() as any;
        const timestamp = new Date().toLocaleString();

        // Header Branding
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text("DURKKAS FOUNDATION", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Official ${activeTab} Intelligence Report`, 14, 28);
        doc.text(`Generated: ${timestamp}`, 14, 33);
        doc.line(14, 38, 196, 38);

        let head: string[][] = [];
        let body: any[] = [];

        if (activeTab === 'TEAM') {
            head = [["CODE", "FULL NAME", "DEPARTMENT", "STATUS"]];
            body = filteredEmployees.map(e => [
                e.employee_code,
                `${e.first_name} ${e.last_name}`,
                departments.find(d => d.id === e.department_id)?.name || "N/A",
                e.is_active ? "ACTIVE" : "INACTIVE"
            ]);
        } else if (activeTab === 'BRANCHES') {
            head = [["CODE", "BRANCH NAME", "LOCATION", "STAFF"]];
            body = branches.map(b => [
                b.code,
                b.name,
                `${b.city}, ${b.state}`,
                employees.filter(e => e.branch_id === b.id).length.toString()
            ]);
        } else if (activeTab === 'ACTIVITY') {
            head = [["TIMESTAMP", "ACTION", "RESOURCE", "OPERATOR"]];
            body = filteredAudit.map(l => [
                new Date(l.created_at).toLocaleString(),
                l.action,
                l.table_name,
                l.performed_by
            ]);
        } else if (activeTab === 'LEADS') {
            head = [["LEAD NAME", "EMAIL", "CHANNEL", "DATE"]];
            body = filteredCRM.map(l => [
                l.name,
                l.email,
                l.type,
                new Date(l.date).toLocaleDateString()
            ]);
        }

        autoTable(doc, {
            head: head,
            body: body,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 45 }
        });

        doc.save(`Durkkas_${activeTab}_Report_${Date.now()}.pdf`);
        toast.success("Professional PDF Intelligence generated");
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-12">

                {/* 1. Header & Quick Stats */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Ledger</h1>
                        <p className="text-slate-500 text-sm font-medium">Enterprise data summary and official register exports.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowPreview(true)} className="h-11 px-6 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 hover:-translate-y-0.5 active:scale-95">
                            <Presentation className="w-4 h-4 text-blue-400" /> Preview Reports
                        </button>
                        <button onClick={exportExcel} className="h-11 px-5 bg-emerald-50 text-emerald-700 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-100 transition-all border border-emerald-100">
                            <FileSpreadsheet className="w-4 h-4" /> Excel
                        </button>
                        <button onClick={exportPDF} className="h-11 px-5 bg-blue-50 text-blue-700 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-all border border-blue-100">
                            <FileIcon className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>

                {/* 2. Top Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Staff", value: employees.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Active Units", value: branches.length, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: "Activity Logs", value: auditLogs.length, icon: History, color: "text-amber-600", bg: "bg-amber-50" },
                        ...(hasModule('CRM') ? [{ label: "CRM Leads", value: crmLeads.length, icon: Star, color: "text-emerald-600", bg: "bg-emerald-50" }] : [])
                    ].map(card => (
                        <div key={card.label} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 transition-all hover:shadow-lg">
                            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-900">{card.value}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Main Filter & Tab Bar */}
                <div className="bg-white p-4 rounded-[32px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit overflow-x-auto no-scrollbar">
                        {[
                            { id: 'TEAM', label: 'Team', icon: Users },
                            { id: 'BRANCHES', label: 'Branches', icon: Building2 },
                            { id: 'ACTIVITY', label: 'History', icon: History },
                            ...(hasModule('CRM') ? [{ id: 'LEADS', label: 'Leads', icon: Star }] : [])
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                        />
                    </div>
                </div>

                {/* 4. Data View */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase">Loading Records...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5">
                                            {activeTab === 'TEAM' ? 'Team Member' : activeTab === 'LEADS' ? 'Lead Name' : activeTab === 'BRANCHES' ? 'Branch' : 'Activity'}
                                        </th>
                                        <th className="px-6 py-5">
                                            {activeTab === 'TEAM' ? 'Department' : activeTab === 'LEADS' ? 'Email' : activeTab === 'BRANCHES' ? 'Code/City' : 'User'}
                                        </th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {activeTab === 'TEAM' && filteredEmployees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs">{emp.first_name[0]}</div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">{emp.first_name} {emp.last_name}</div>
                                                        <div className="text-[10px] font-medium text-slate-400">{emp.employee_code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-xs font-medium text-slate-600">{branches.find(b => b.id === emp.branch_id)?.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">{departments.find(d => d.id === emp.department_id)?.name}</div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => setDetailRecord({ title: 'Staff Detail', data: emp })} className="p-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {activeTab === 'BRANCHES' && branches.map(br => (
                                        <tr key={br.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-900 text-sm">{br.name}</td>
                                            <td className="px-6 py-5">
                                                <div className="text-xs font-bold text-blue-600">{br.code}</div>
                                                <div className="text-[10px] text-slate-400">{br.city}, {br.state}</div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => setDetailRecord({ title: 'Branch Detail', data: br })} className="p-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {activeTab === 'ACTIVITY' && filteredAudit.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-lg w-fit">{log.action}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">{new Date(log.created_at).toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-bold text-slate-900">{log.performed_by}</td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => setDetailRecord({ title: 'Log Detail', data: log })} className="p-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {activeTab === 'LEADS' && filteredCRM.map(lead => (
                                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-bold text-slate-900">{lead.name}</div>
                                                <div className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full w-fit mt-1">{lead.type}</div>
                                            </td>
                                            <td className="px-6 py-5 text-xs text-slate-500">{lead.email}</td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => setDetailRecord({ title: 'Lead Detail', data: lead })} className="p-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Detail Modal */}
            {detailRecord && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{detailRecord.title}</h3>
                            <button onClick={() => setDetailRecord(null)} className="w-10 h-10 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl flex items-center justify-center transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[60vh] space-y-3">
                            {Object.entries(detailRecord.data).map(([key, value]) => {
                                if (typeof value === 'object' || key.includes('_id')) return null;
                                return (
                                    <div key={key} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                                        <span className="text-xs font-bold text-slate-900">{String(value || 'N/A')}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                            <button onClick={() => setDetailRecord(null)} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <Star className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{activeTab} PREVIEW</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Report Snapshot</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPreview(false)} className="w-10 h-10 bg-white text-slate-400 hover:text-slate-900 rounded-xl flex items-center justify-center border border-slate-100 transition-all font-mono">
                                X
                            </button>
                        </div>

                        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            <div className="p-7 bg-blue-50/50 rounded-[32px] border border-blue-100/50 text-center">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Total Records</span>
                                <h4 className="text-4xl font-black text-slate-900">
                                    {activeTab === 'TEAM' ? filteredEmployees.length : activeTab === 'LEADS' ? filteredCRM.length : activeTab === 'BRANCHES' ? branches.length : filteredAudit.length}
                                </h4>
                            </div>
                            <div className="p-7 bg-emerald-50/50 rounded-[32px] border border-emerald-100/50 text-center">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Integrity Status</span>
                                <h4 className="text-4xl font-black text-slate-900">Valid</h4>
                            </div>
                            <div className="p-7 bg-slate-50 rounded-[32px] border border-slate-100 text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Generated On</span>
                                <h4 className="text-lg font-black text-slate-900">{new Date().toLocaleDateString()}</h4>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowPreview(false); exportPDF(); }}
                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                            >
                                Download Official PDF
                            </button>
                            <button onClick={() => setShowPreview(false)} className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </DashboardLayout>
    );
}
