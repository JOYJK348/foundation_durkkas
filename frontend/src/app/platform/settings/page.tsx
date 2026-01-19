"use client";

import React, { useState, useEffect } from "react";
import {
    Monitor,
    Lock,
    Clock,
    Smartphone,
    ShieldAlert,
    Save,
    ChevronRight,
    Info,
    LayoutDashboard,
    Globe,
    Loader2,
    ShieldCheck,
    Database,
    Zap,
    Settings,
    Activity,
    CreditCard,
    Key,
    UserCircle,
    Server,
    Fingerprint,
    Map,
    Navigation,
    Plus,
    Search,
    Edit3,
    Trash2,
    Flag,
    ActivitySquare,
    AlertTriangle,
    ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import ArchivesTab from "@/components/platform/ArchivesTab";

type MasterType = 'COUNTRIES' | 'STATES' | 'CITIES';

interface UsageStat {
    id: number;
    name: string;
    code: string;
    usersUsed: number;
    usersMax: number;
    branchesUsed: number;
    branchesMax: number;
    storageUsed: string;
    storageMax: string;
}

export default function PlatformSystemSettings() {
    const [activeTab, setActiveTab] = useState<"AUTH" | "PROTOCOLS" | "SECURITY" | "UTILIZATION" | "REGISTRY" | "RECOVERY">("AUTH");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Settings State
    const [settings, setSettings] = useState<Record<string, any>>({
        "auth.min_password_length": 8,
        "auth.password_expiry_days": 90,
        "auth.session_timeout_hrs": 12,
        "auth.max_concurrent_sessions": 3,
        "limits.max_branches_base": 2,
        "limits.max_staff_per_branch": 50,
        "security.ip_restriction": true,
        "security.device_fingerprinting": true,
        "security.2fa_mandatory": true,
        "security.audit_verbosity": false,
    });

    // Master Registry States
    const [masterTab, setMasterTab] = useState<MasterType>('COUNTRIES');
    const [masterData, setMasterData] = useState<any[]>([]);
    const [masterLoading, setMasterLoading] = useState(false);
    const [masterSearchTerm, setMasterSearchTerm] = useState("");
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [editingMasterItem, setEditingMasterItem] = useState<any>(null);
    const [masterFormData, setMasterFormData] = useState<any>({});

    // Utilization Stats
    const [usageStats, setUsageStats] = useState<UsageStat[]>([]);
    const [usageLoading, setUsageLoading] = useState(false);
    const [usageSearchTerm, setUsageSearchTerm] = useState("");

    // Validation States
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'REGISTRY') {
            loadMasterData();
        }
        if (activeTab === 'UTILIZATION') {
            loadUsageData();
        }
    }, [activeTab, masterTab]);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const data = await platformService.getGlobalSettings();
            if (data && data.length > 0) {
                const mapped: Record<string, any> = { ...settings };
                data.forEach((s: any) => {
                    let val = s.value;
                    if (val === 'true') val = true;
                    if (val === 'false') val = false;
                    if (!isNaN(val) && val !== '') val = Number(val);
                    mapped[s.key] = val;
                });
                setSettings(mapped);
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
            toast.error("Failed to load system settings");
        } finally {
            setIsLoading(false);
        }
    };

    const loadUsageData = async () => {
        try {
            setUsageLoading(true);
            const [companies, branches, employees] = await Promise.all([
                platformService.getCompanies(),
                platformService.getBranches(),
                platformService.getEmployees()
            ]);

            const mapped = companies.map((c: any) => {
                const companyEmployees = employees.filter((e: any) => e.company_id === c.id).length;
                const companyBranches = branches.filter((b: any) => b.company_id === c.id).length;

                return {
                    id: c.id,
                    name: c.name,
                    code: c.company_code || c.code,
                    usersUsed: companyEmployees,
                    usersMax: c.max_users || 10,
                    branchesUsed: companyBranches,
                    branchesMax: c.max_branches || 1,
                    storageUsed: "2.4 GB",
                    storageMax: "10 GB"
                };
            });
            setUsageStats(mapped);
        } catch (error) {
            toast.error("Failed to load usage data");
        } finally {
            setUsageLoading(false);
        }
    };

    const loadMasterData = async () => {
        try {
            setMasterLoading(true);
            let result = [];
            if (masterTab === 'COUNTRIES') result = await platformService.getCountries();
            else if (masterTab === 'STATES') result = await platformService.getStates();
            else if (masterTab === 'CITIES') result = await platformService.getCities();
            setMasterData(result || []);
        } catch (error) {
            toast.error(`Failed to sync ${masterTab.toLowerCase()} registry`);
        } finally {
            setMasterLoading(false);
        }
    };

    const validateSetting = (key: string, value: any): string | null => {
        // Password Length Validation
        if (key === 'auth.min_password_length') {
            if (value < 6) return 'Minimum password length must be at least 6 characters for security';
            if (value > 32) return 'Maximum password length cannot exceed 32 characters';
        }

        // Password Expiry Validation
        if (key === 'auth.password_expiry_days') {
            if (value < 30) return 'Password rotation cycle must be at least 30 days';
            if (value > 365) return 'Password rotation cycle cannot exceed 365 days';
        }

        // Session Timeout Validation
        if (key === 'auth.session_timeout_hrs') {
            if (value < 1) return 'Session timeout must be at least 1 hour';
            if (value > 72) return 'Session timeout cannot exceed 72 hours';
        }

        // Concurrent Sessions Validation
        if (key === 'auth.max_concurrent_sessions') {
            if (value < 1) return 'Must allow at least 1 concurrent session';
            if (value > 10) return 'Cannot exceed 10 concurrent sessions';
        }

        // Branch Limits Validation
        if (key === 'limits.max_branches_base') {
            if (value < 1) return 'Must allow at least 1 branch';
            if (value > 100) return 'Cannot exceed 100 branches for base tier';
        }

        // Staff Limits Validation
        if (key === 'limits.max_staff_per_branch') {
            if (value < 5) return 'Must allow at least 5 staff members per branch';
            if (value > 1000) return 'Cannot exceed 1000 staff per branch';
        }

        return null;
    };

    const handleChange = (key: string, value: any) => {
        const error = validateSetting(key, value);

        setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[key] = error;
            } else {
                delete newErrors[key];
            }
            return newErrors;
        });

        setSettings(prev => ({ ...prev, [key]: value }));
        setHasUnsavedChanges(true);
    };

    const handleSave = async () => {
        // Check for validation errors
        if (Object.keys(validationErrors).length > 0) {
            toast.error("Cannot save settings", {
                description: "Please fix all validation errors before saving."
            });
            return;
        }

        setIsSaving(true);
        try {
            const payload = Object.entries(settings).map(([key, value]) => ({
                key,
                value: String(value),
                group: key.split('.')[0].toUpperCase(),
                updated_at: new Date().toISOString()
            }));

            await platformService.syncGlobalSettings(payload);

            toast.success("System parameters updated", {
                description: "All settings have been synchronized across the infrastructure."
            });

            setHasUnsavedChanges(false);
        } catch (error: any) {
            toast.error("Synchronization Failed", {
                description: error.message || "Could not update system settings. Please try again."
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleMasterSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            toast.loading("Committing to global registry...", { id: 'master-save' });
            if (editingMasterItem) {
                if (masterTab === 'COUNTRIES') await platformService.updateCountry(editingMasterItem.id, masterFormData);
                else if (masterTab === 'STATES') await platformService.updateState(editingMasterItem.id, masterFormData);
                else if (masterTab === 'CITIES') await platformService.updateCity(editingMasterItem.id, masterFormData);
                toast.success("Entry updated successfully", { id: 'master-save' });
            } else {
                if (masterTab === 'COUNTRIES') await platformService.createCountry(masterFormData);
                else if (masterTab === 'STATES') await platformService.createState(masterFormData);
                else if (masterTab === 'CITIES') await platformService.createCity(masterFormData);
                toast.success("New entry cataloged", { id: 'master-save' });
            }
            setIsMasterModalOpen(false);
            loadMasterData();
        } catch (error) {
            toast.error("Failed to commit changes", { id: 'master-save' });
        }
    };

    const handleMasterDelete = async (id: any) => {
        if (!window.confirm("Are you certain? This will purge the entry from the global registry.")) return;
        try {
            toast.loading("Purging from registry...", { id: 'master-delete' });
            if (masterTab === 'COUNTRIES') await platformService.deleteCountry(id);
            else if (masterTab === 'STATES') await platformService.deleteState(id);
            else if (masterTab === 'CITIES') await platformService.deleteCity(id);
            toast.success("Entry purged successfully", { id: 'master-delete' });
            loadMasterData();
        } catch (error) {
            toast.error("Registry locks prevented deletion", { id: 'master-delete' });
        }
    };

    const filteredMasterData = masterData.filter((item: any) =>
        (item.name || "").toLowerCase().includes(masterSearchTerm.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(masterSearchTerm.toLowerCase())
    );

    const filteredUsageData = usageStats.filter(c =>
        (c.name || "").toLowerCase().includes(usageSearchTerm.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(usageSearchTerm.toLowerCase())
    );

    const UsageBar = ({ used, max, colorClass }: { used: number, max: number, colorClass: string }) => {
        const pct = Math.min((used / max) * 100, 100);
        const isNearLimit = pct > 80;

        return (
            <div className="w-full">
                <div className="flex justify-between text-[9px] font-bold uppercase mb-1.5 text-slate-400 tracking-wider">
                    <span>{used} Used</span>
                    <span>{max} Max</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-rose-500' : colorClass}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                {isNearLimit && (
                    <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-rose-500">
                        <AlertTriangle className="w-3 h-3" />
                        Near Limit
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-12 h-12 text-[#0066FF] animate-spin" />
                    <p className="text-sm font-semibold text-slate-500">Decrypting system blueprint...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Settings className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">System Architecture</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            System Blueprint
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Configure global parameters and security thresholds
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasUnsavedChanges && (
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-bold text-amber-700">Unsaved Changes</span>
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || Object.keys(validationErrors).length > 0}
                            className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#0066FF]/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
                            {isSaving ? "Syncing..." : "Save Parameters"}
                        </button>
                    </div>
                </div>

                {/* Warning Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-6 flex items-start gap-4">
                    <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-amber-900 text-sm md:text-base uppercase tracking-tight">Critical Access Zone</h4>
                        <p className="text-sm text-amber-800/80 font-medium mt-1 leading-normal">
                            Modifications here impact all active sessions and infrastructure clusters. Ensure a database snapshot exists before altering authentication or core limit thresholds.
                        </p>
                    </div>
                </div>

                {/* Tabs - Modern Minimalist */}
                <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit gap-1">
                    {[
                        { id: "AUTH", label: "Auth Protocol", icon: Key },
                        { id: "PROTOCOLS", label: "Global Limits", icon: Server },
                        { id: "SECURITY", label: "Network Security", icon: ShieldCheck },
                        { id: "UTILIZATION", label: "Utilization Monitor", icon: ActivitySquare },
                        { id: "REGISTRY", label: "Global Registry", icon: Database },
                        { id: "RECOVERY", label: "Recovery Center", icon: RotateCcw }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 md:px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                ? "bg-white text-[#0066FF] shadow-sm border border-slate-100"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                        >
                            <tab.icon className={`w-3.5 h-3.5 md:w-4 h-4 ${activeTab === tab.id ? "text-[#0066FF]" : "text-slate-400"}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Body */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-12">
                        {activeTab === "RECOVERY" && <ArchivesTab />}
                        {activeTab === "AUTH" && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                <Fingerprint className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Password Policy</h3>
                                                <p className="text-xs text-slate-400 font-medium tracking-tight">Complexity and rotation standards</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                {
                                                    label: "Minimum Length",
                                                    key: "auth.min_password_length",
                                                    min: 6,
                                                    max: 32,
                                                    helper: "Enforced when users create or reset passwords",
                                                    unit: "chars"
                                                },
                                                {
                                                    label: "Rotation Cycle",
                                                    key: "auth.password_expiry_days",
                                                    min: 30,
                                                    max: 365,
                                                    helper: "Users must change password after this period",
                                                    unit: "days"
                                                }
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-2">
                                                    <div className={`flex items-center justify-between p-4 bg-slate-50 rounded-xl border transition-all ${validationErrors[field.key]
                                                        ? 'border-rose-300 bg-rose-50/50'
                                                        : 'border-slate-100 hover:border-slate-200'
                                                        }`}>
                                                        <div className="flex-1">
                                                            <span className="text-sm font-semibold text-slate-900">{field.label}</span>
                                                            <p className="text-xs text-slate-500 mt-0.5">{field.helper}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min={field.min}
                                                                max={field.max}
                                                                value={settings[field.key]}
                                                                onChange={(e) => handleChange(field.key, Number(e.target.value))}
                                                                className={`w-20 text-right bg-white border rounded-lg py-2 px-3 font-bold focus:outline-none focus:ring-2 transition-all ${validationErrors[field.key]
                                                                    ? 'border-rose-300 text-rose-600 focus:ring-rose-500/20'
                                                                    : 'border-slate-200 text-[#0066FF] focus:ring-[#0066FF]/20'
                                                                    }`}
                                                            />
                                                            <span className="text-xs font-bold text-slate-400 uppercase w-12">{field.unit}</span>
                                                        </div>
                                                    </div>
                                                    {validationErrors[field.key] && (
                                                        <div className="flex items-start gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg">
                                                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                                            <p className="text-xs font-medium text-rose-700 leading-relaxed">{validationErrors[field.key]}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-violet-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Session Logic</h3>
                                                <p className="text-xs text-slate-400 font-medium tracking-tight">Active session duration and scaling</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                {
                                                    label: "Session Timeout",
                                                    key: "auth.session_timeout_hrs",
                                                    min: 1,
                                                    max: 72,
                                                    helper: "Auto-logout after inactivity period",
                                                    unit: "hours"
                                                },
                                                {
                                                    label: "Max Concurrent Logins",
                                                    key: "auth.max_concurrent_sessions",
                                                    min: 1,
                                                    max: 10,
                                                    helper: "Maximum simultaneous active sessions per user",
                                                    unit: "sessions"
                                                }
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-2">
                                                    <div className={`flex items-center justify-between p-4 bg-slate-50 rounded-xl border transition-all ${validationErrors[field.key]
                                                        ? 'border-rose-300 bg-rose-50/50'
                                                        : 'border-slate-100 hover:border-slate-200'
                                                        }`}>
                                                        <div className="flex-1">
                                                            <span className="text-sm font-semibold text-slate-900">{field.label}</span>
                                                            <p className="text-xs text-slate-500 mt-0.5">{field.helper}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min={field.min}
                                                                max={field.max}
                                                                value={settings[field.key]}
                                                                onChange={(e) => handleChange(field.key, Number(e.target.value))}
                                                                className={`w-20 text-right bg-white border rounded-lg py-2 px-3 font-bold focus:outline-none focus:ring-2 transition-all ${validationErrors[field.key]
                                                                    ? 'border-rose-300 text-rose-600 focus:ring-rose-500/20'
                                                                    : 'border-slate-200 text-[#0066FF] focus:ring-[#0066FF]/20'
                                                                    }`}
                                                            />
                                                            <span className="text-xs font-bold text-slate-400 uppercase w-16">{field.unit}</span>
                                                        </div>
                                                    </div>
                                                    {validationErrors[field.key] && (
                                                        <div className="flex items-start gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg">
                                                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                                            <p className="text-xs font-medium text-rose-700 leading-relaxed">{validationErrors[field.key]}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "PROTOCOLS" && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                                <Zap className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Tenant Defaults</h3>
                                                <p className="text-xs text-slate-400 font-medium tracking-tight">Baseline resource allocation</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                {
                                                    label: "Max Branches (Standard Tier)",
                                                    key: "limits.max_branches_base",
                                                    min: 1,
                                                    max: 100,
                                                    helper: "Default branch limit for standard subscription",
                                                    unit: "branches"
                                                },
                                                {
                                                    label: "Staff Pool Per Branch",
                                                    key: "limits.max_staff_per_branch",
                                                    min: 5,
                                                    max: 1000,
                                                    helper: "Maximum employees allowed per branch location",
                                                    unit: "staff"
                                                }
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-2">
                                                    <div className={`flex items-center justify-between p-4 bg-slate-50 rounded-xl border transition-all ${validationErrors[field.key]
                                                        ? 'border-rose-300 bg-rose-50/50'
                                                        : 'border-slate-100 hover:border-slate-200'
                                                        }`}>
                                                        <div className="flex-1">
                                                            <span className="text-sm font-semibold text-slate-900">{field.label}</span>
                                                            <p className="text-xs text-slate-500 mt-0.5">{field.helper}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min={field.min}
                                                                max={field.max}
                                                                value={settings[field.key]}
                                                                onChange={(e) => handleChange(field.key, Number(e.target.value))}
                                                                className={`w-20 text-right bg-white border rounded-lg py-2 px-3 font-bold focus:outline-none focus:ring-2 transition-all ${validationErrors[field.key]
                                                                    ? 'border-rose-300 text-rose-600 focus:ring-rose-500/20'
                                                                    : 'border-slate-200 text-[#0066FF] focus:ring-[#0066FF]/20'
                                                                    }`}
                                                            />
                                                            <span className="text-xs font-bold text-slate-400 uppercase w-16">{field.unit}</span>
                                                        </div>
                                                    </div>
                                                    {validationErrors[field.key] && (
                                                        <div className="flex items-start gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg">
                                                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                                            <p className="text-xs font-medium text-rose-700 leading-relaxed">{validationErrors[field.key]}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
                                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div className="space-y-2">
                                            <h4 className="text-blue-900 font-bold text-sm">Orchestration Note</h4>
                                            <p className="text-sm text-blue-700/80 font-medium leading-relaxed">
                                                These parameters define the default constraints for the 'Essential' cluster. Enterprise and custom negotiated tiers override these via the Contract Registry.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "SECURITY" && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    {[
                                        { key: "security.ip_restriction", label: "IP Restriction Enforcement", desc: "Toggle global IP whitelisting for Company Admins.", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
                                        { key: "security.device_fingerprinting", label: "Device Trust Registry", desc: "Audit and verify unique hardware IDs for all login attempts.", icon: Smartphone, color: "text-violet-600", bg: "bg-violet-50" },
                                        { key: "security.2fa_mandatory", label: "Mandatory Multi-Factor", desc: "Require 2FA for all Level 5 administrative accounts.", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                                        { key: "security.audit_verbosity", label: "High-Verbosity Auditing", desc: "Stream every internal API request to the log registry.", icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
                                    ].map((s) => (
                                        <div key={s.key} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-[#0066FF]/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                                                    <s.icon className={`w-6 h-6 ${s.color}`} />
                                                </div>
                                                <div className="min-w-0 pr-4">
                                                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{s.label}</h4>
                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">{s.desc}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleChange(s.key, !settings[s.key])}
                                                className={`w-14 h-7 rounded-full flex items-center px-1 shrink-0 transition-all duration-300 ${settings[s.key] ? "bg-[#0066FF]" : "bg-slate-300"}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${settings[s.key] ? "translate-x-7" : "translate-x-0"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "UTILIZATION" && (
                            <div className="space-y-8">
                                <div className="pb-4 border-b border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">Resource Utilization</h3>
                                    <p className="text-sm text-slate-500 font-medium">Infrastructure limits and consumption monitoring across all tenants</p>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search tenants..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                                        value={usageSearchTerm}
                                        onChange={(e) => setUsageSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                    {usageLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profiling Usage Data...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-6 py-4">Enterprise</th>
                                                        <th className="px-6 py-4">User Seats</th>
                                                        <th className="px-6 py-4">Branch Slots</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {filteredUsageData.map((stat) => (
                                                        <tr key={stat.id} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 border border-slate-100 group-hover:text-[#0066FF] group-hover:border-[#0066FF]/20 transition-all">
                                                                        {stat.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-900">{stat.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.code}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 min-w-[150px]">
                                                                <UsageBar used={stat.usersUsed} max={stat.usersMax} colorClass="bg-emerald-500" />
                                                            </td>
                                                            <td className="px-6 py-4 min-w-[150px]">
                                                                <UsageBar used={stat.branchesUsed} max={stat.branchesMax} colorClass="bg-[#0066FF]" />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    onClick={() => window.location.href = `/platform/core/companies/${stat.id}`}
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-[#0066FF] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                                                >
                                                                    Adjust <ArrowUpRight className="w-3 h-3" />
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
                        )}

                        {activeTab === "REGISTRY" && (
                            <div className="space-y-8">
                                <div className="pb-4 border-b border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">Global Registry</h3>
                                    <p className="text-sm text-slate-500 font-medium">Manage master data for geographical and administrative entities</p>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex bg-slate-50 p-1 rounded-xl">
                                        {[
                                            { id: 'COUNTRIES', label: 'Countries', icon: Globe },
                                            { id: 'STATES', label: 'States', icon: Map },
                                            { id: 'CITIES', label: 'Cities', icon: Navigation },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setMasterTab(tab.id as MasterType)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${masterTab === tab.id
                                                    ? 'bg-white text-[#0066FF] shadow-sm'
                                                    : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                            >
                                                <tab.icon className="w-4 h-4" />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => { setEditingMasterItem(null); setMasterFormData({}); setIsMasterModalOpen(true); }}
                                        className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Provision Entry
                                    </button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${masterTab.toLowerCase()} registry...`}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                                        value={masterSearchTerm}
                                        onChange={(e) => setMasterSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                    {masterLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Updating Viewport...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-6 py-4">Registry Identity</th>
                                                        <th className="px-6 py-4">Attributes</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {filteredMasterData.map((item) => (
                                                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-slate-400 border border-slate-100 group-hover:text-[#0066FF] group-hover:border-[#0066FF]/20 transition-all">
                                                                        {masterTab === 'COUNTRIES' ? <Flag className="w-5 h-5" /> : item.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.code || `ID: ${item.id}`}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {masterTab === 'COUNTRIES' && (
                                                                        <>
                                                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{item.currency_code}</span>
                                                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{item.phone_code}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <button
                                                                        onClick={() => { setEditingMasterItem(item); setMasterFormData(item); setIsMasterModalOpen(true); }}
                                                                        className="p-2 hover:bg-white text-slate-400 hover:text-[#0066FF] rounded-lg border border-transparent hover:border-slate-100 shadow-sm transition-all"
                                                                    >
                                                                        <Edit3 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleMasterDelete(item.id)}
                                                                        className="p-2 hover:bg-white text-slate-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-slate-100 shadow-sm transition-all"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {isMasterModalOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMasterModalOpen(false)} />
                                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                                                    {editingMasterItem ? 'Regulate Registry' : 'Provision Entry'}
                                                </h3>
                                                <button onClick={() => setIsMasterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <form onSubmit={handleMasterSave} className="p-6 space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                                                        value={masterFormData.name || ''}
                                                        onChange={e => setMasterFormData({ ...masterFormData, name: e.target.value })}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registry Code</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-mono"
                                                            value={masterFormData.code || ''}
                                                            onChange={e => setMasterFormData({ ...masterFormData, code: e.target.value.toUpperCase() })}
                                                        />
                                                    </div>
                                                    {masterTab === 'COUNTRIES' && (
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Prefix</label>
                                                            <input
                                                                type="text"
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                                                                value={masterFormData.phone_code || ''}
                                                                onChange={e => setMasterFormData({ ...masterFormData, phone_code: e.target.value })}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {masterTab === 'COUNTRIES' && (
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                                                            value={masterFormData.currency_code || ''}
                                                            onChange={e => setMasterFormData({ ...masterFormData, currency_code: e.target.value.toUpperCase() })}
                                                        />
                                                    </div>
                                                )}

                                                <div className="pt-4 flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsMasterModalOpen(false)}
                                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                                                    >
                                                        Abort
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="flex-[2] bg-[#0066FF] hover:bg-[#0052CC] text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
                                                    >
                                                        {editingMasterItem ? 'Commit Update' : 'Initialize Provision'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            Infrastructure Confirmed • Environment Secured • All Clusters Syncable
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
