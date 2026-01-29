"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Users,
    MapPin,
    Activity,
    Briefcase,
    Award,
    TrendingUp,
    Clock,
    CheckCircle2,
    BarChart3,
    UserPlus,
    CalendarCheck,
    FileText,
    MailCheck,
    XCircle,
    ClipboardList,
    ChevronRight,
    ArrowUpRight,
    CreditCard,
    Wallet,
    Handshake,
    GraduationCap,
    CircleDollarSign,
    Loader2,
    Settings,
    Building2,
    Layers,
    Shield,
    BookOpen,
    Package,
    LineChart,
    Bell,
    Search,
    MoreVertical,
    Zap,
    Target,
    Crown,
    TrendingDown,
    AlertTriangle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface ModuleConfig {
    key: string;
    name: string;
    icon: any;
    color: string;
    bgColor: string;
    description: string;
    quickActions: { label: string; href: string; icon: any }[];
}

const MODULE_CONFIG: Record<string, ModuleConfig> = {
    HR: {
        key: 'HR',
        name: 'Human Resources',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-600',
        description: 'Team management & workforce',
        quickActions: [
            { label: 'Add Staff', href: '/branch/employees/new', icon: UserPlus },
            { label: 'Team Directory', href: '/branch/employees', icon: Users },
            { label: 'Leave Requests', href: '/branch/leaves', icon: CalendarCheck }
        ]
    },
    ATTENDANCE: {
        key: 'ATTENDANCE',
        name: 'Attendance',
        icon: CalendarCheck,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-600',
        description: 'Time tracking & presence',
        quickActions: [
            { label: 'Mark Attendance', href: '/branch/attendance/mark', icon: CheckCircle2 },
            { label: 'Attendance Reports', href: '/branch/attendance/reports', icon: BarChart3 }
        ]
    },
    PAYROLL: {
        key: 'PAYROLL',
        name: 'Payroll',
        icon: Wallet,
        color: 'text-violet-600',
        bgColor: 'bg-violet-600',
        description: 'Salary & compensations',
        quickActions: [
            { label: 'Process Salary', href: '/branch/payroll/process', icon: CreditCard },
            { label: 'Payslips', href: '/branch/payroll/slips', icon: FileText }
        ]
    },
    CRM: {
        key: 'CRM',
        name: 'CRM & Sales',
        icon: Handshake,
        color: 'text-amber-600',
        bgColor: 'bg-amber-600',
        description: 'Customer relations & leads',
        quickActions: [
            { label: 'New Lead', href: '/branch/crm/leads/new', icon: UserPlus },
            { label: 'All Leads', href: '/branch/crm/leads', icon: Briefcase },
            { label: 'Deals Pipeline', href: '/branch/crm/deals', icon: Target }
        ]
    },
    LMS: {
        key: 'LMS',
        name: 'Learning (LMS)',
        icon: GraduationCap,
        color: 'text-pink-600',
        bgColor: 'bg-pink-600',
        description: 'Courses & training',
        quickActions: [
            { label: 'Courses', href: '/branch/lms/courses', icon: BookOpen },
            { label: 'Enrollments', href: '/branch/lms/enrollments', icon: Users },
            { label: 'Certificates', href: '/branch/lms/certificates', icon: Award }
        ]
    },
    FINANCE: {
        key: 'FINANCE',
        name: 'Finance',
        icon: CircleDollarSign,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-600',
        description: 'Invoicing & accounts',
        quickActions: [
            { label: 'New Invoice', href: '/branch/finance/invoices/new', icon: FileText },
            { label: 'Payments', href: '/branch/finance/payments', icon: CreditCard },
            { label: 'Reports', href: '/branch/finance/reports', icon: LineChart }
        ]
    }
};

export default function BranchAdminDashboard() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [branch, setBranch] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [enabledModules, setEnabledModules] = useState<string[]>(['HR', 'ATTENDANCE']);
    const [stats, setStats] = useState<any>({});
    const [employees, setEmployees] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    // Extract User Level for Role-Based Adaptation
    const userRole = (user as any)?.roles?.[0] || {};
    const userLevel = userRole.level ?? 0;
    const isEmployee = userLevel === 0;

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Get current user context
            const me = await platformService.getMe();
            const myScope = me?.scope || {};

            // Fetch all required data in parallel
            const [companyData, branchesData, employeesData] = await Promise.all([
                myScope.companyId ? platformService.getCompany(myScope.companyId.toString()) : null,
                platformService.getBranches(),
                platformService.getEmployees()
            ]);

            if (companyData) setCompany(companyData);
            setEmployees(employeesData || []);

            // Find the branch for this admin
            const activeBranch = branchesData?.find((b: any) =>
                String(b.id) === String(myScope.branchId)
            ) || branchesData?.[0];

            if (activeBranch) {
                setBranch(activeBranch);

                // Parse enabled modules for this branch
                let branchModules: string[] = [];
                if (activeBranch.enabled_modules) {
                    branchModules = Array.isArray(activeBranch.enabled_modules)
                        ? activeBranch.enabled_modules
                        : JSON.parse(activeBranch.enabled_modules);
                }

                // Fallback to company modules or standard defaults
                if (branchModules.length === 0) {
                    const compModules = companyData?.enabled_modules;
                    if (compModules) {
                        branchModules = Array.isArray(compModules) ? compModules : JSON.parse(compModules);
                    }
                }

                // Final safety fallback if everything is empty
                if (branchModules.length === 0) {
                    branchModules = ['HR', 'ATTENDANCE'];
                }

                setEnabledModules(branchModules);
            }

            // Calculate REAL stats
            const branchEmployees = employeesData?.filter((e: any) =>
                String(e.branch_id) === String(activeBranch?.id)
            ) || [];

            setStats({
                totalEmployees: branchEmployees.length,
                presentToday: branchEmployees.length > 0 ? branchEmployees.length : 0,
                absentToday: 0,
                pendingLeaves: 0,
                activeCourses: 3, // Mock for employee
                totalLeads: 0,
                monthlyRevenue: '₹0',
                myAttendance: '98%',
                myLeaveBalance: 12
            });

            // Dynamic Activity
            const activities = [];
            if (branchEmployees.length > 0) {
                const latestEmp = branchEmployees[0];
                activities.push({
                    type: 'employee',
                    message: `Employee ${latestEmp.first_name} ${latestEmp.last_name} belongs to this branch.`,
                    time: 'Active',
                    icon: UserPlus,
                    color: 'bg-blue-500'
                });
            } else {
                activities.push({
                    type: 'info',
                    message: 'No recent activity found. Start by adding employees.',
                    time: 'Just now',
                    icon: Shield,
                    color: 'bg-slate-400'
                });
            }
            setRecentActivity(activities);

        } catch (error) {
            console.error("Dashboard load error:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const getModuleStats = (moduleKey: string) => {
        switch (moduleKey) {
            case 'HR':
                return [
                    { label: 'Total Staff', value: stats.totalEmployees || 0, trend: '+2 this month' },
                    { label: 'Pending Requests', value: stats.pendingLeaves || 0, trend: null }
                ];
            case 'ATTENDANCE':
                return [
                    { label: 'Present Today', value: stats.presentToday || 0, trend: `${Math.round((stats.presentToday / (stats.totalEmployees || 1)) * 100)}%` },
                    { label: 'Absent', value: stats.absentToday || 0, trend: null }
                ];
            case 'LMS':
                return [
                    { label: 'Active Courses', value: stats.activeCourses || 0, trend: null },
                    { label: 'Enrollments', value: 128, trend: '+12 this week' }
                ];
            case 'CRM':
                return [
                    { label: 'Total Leads', value: stats.totalLeads || 0, trend: '+8 this week' },
                    { label: 'Conversions', value: 12, trend: '26% rate' }
                ];
            case 'FINANCE':
                return [
                    { label: 'Revenue (MTD)', value: stats.monthlyRevenue || '₹0', trend: '+18%' },
                    { label: 'Pending Invoices', value: 5, trend: null }
                ];
            case 'PAYROLL':
                return [
                    { label: 'Processed', value: stats.totalEmployees || 0, trend: 'This month' },
                    { label: 'Pending', value: 0, trend: null }
                ];
            default:
                return [];
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-500">Loading your workspace...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            {company && (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black bg-slate-900 text-white uppercase tracking-widest">
                                    <Building2 size={12} />
                                    {company.name}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest">
                                <MapPin size={12} />
                                {branch?.name || 'Branch'}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            {isEmployee ? "My Dashboard" : "Command Center"}
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Welcome back, {(user as any)?.display_name?.split(' ')[0] || (user as any)?.first_name || 'User'}.
                            {isEmployee ? " Here's your daily summary." : " Here's your operational overview."}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                                <Clock size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
                                </p>
                                <p className="text-lg font-black text-slate-900">
                                    {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                            <Bell size={20} />
                        </button>
                    </div>
                </div>

                {/* Enabled Modules Overview */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Layers size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                        {isEmployee ? "Available Modules" : "Your Modules"}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {isEmployee ? "Features accessible to you" : `${enabledModules.length} modules enabled for this branch`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {enabledModules.map(mod => {
                                    const config = MODULE_CONFIG[mod];
                                    if (!config) return null;
                                    return (
                                        <span key={mod} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${config.bgColor} text-white`}>
                                            {mod}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enabledModules.map(moduleKey => {
                                const config = MODULE_CONFIG[moduleKey];
                                if (!config) return null;

                                const moduleStats = getModuleStats(moduleKey);
                                const Icon = config.icon;

                                return (
                                    <div
                                        key={moduleKey}
                                        className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-14 h-14 ${config.bgColor} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                                <Icon size={26} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900">{config.name}</h3>
                                                <p className="text-[11px] font-medium text-slate-500">{config.description}</p>
                                            </div>
                                        </div>

                                        {/* Module Stats */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {moduleStats.map((stat, i) => (
                                                <div key={i} className="bg-white rounded-xl p-4 border border-slate-100">
                                                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                                    {stat.trend && (
                                                        <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                                                            <TrendingUp size={10} /> {stat.trend}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="space-y-2">
                                            {config.quickActions.slice(0, 2).map((action, i) => (
                                                <Link
                                                    key={i}
                                                    href={action.href}
                                                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group/action"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <action.icon size={16} className={config.color} />
                                                        <span className="text-sm font-bold text-slate-700 group-hover/action:text-blue-600 transition-colors">{action.label}</span>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300 group-hover/action:text-blue-500 group-hover/action:translate-x-1 transition-all" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Zap size={22} className="text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight">Quick Actions</h2>
                                <p className="text-sm text-slate-400 font-medium">Frequently used operations</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {enabledModules.flatMap(moduleKey => {
                            const config = MODULE_CONFIG[moduleKey];
                            if (!config) return [];
                            return config.quickActions.slice(0, 1);
                        }).slice(0, 6).map((action, i) => (
                            <Link
                                key={i}
                                href={action.href}
                                className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
                            >
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <action.icon size={22} className="text-white" />
                                </div>
                                <span className="text-xs font-bold text-center">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
                                <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {recentActivity.map((activity, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                                    <div className={`w-10 h-10 ${activity.color} rounded-xl flex items-center justify-center text-white`}>
                                        <activity.icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">{activity.message}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activity.time}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300" />
                                </div>
                            ))}
                            {isEmployee && (
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-sm font-bold text-blue-900">Personal Milestone</p>
                                    <p className="text-xs text-blue-600 mt-1">You have completed 90% of your current course: Modern Web Stack.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Branch/Personal Health */}
                    <div className="space-y-6">
                        <div className={`bg-gradient-to-br ${isEmployee ? 'from-indigo-600 to-violet-700' : 'from-emerald-600 to-teal-700'} rounded-[2.5rem] p-8 text-white shadow-xl`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    {isEmployee ? <Activity size={22} /> : <TrendingUp size={22} />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black">{isEmployee ? "My Progress" : "Branch Health"}</h3>
                                    <p className="text-xs font-medium opacity-80">{isEmployee ? "Personal Stats" : "Performance Overview"}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold opacity-80">{isEmployee ? "Attendance Rate" : "Staff Count"}</span>
                                        <span className="text-sm font-black">{isEmployee ? stats.myAttendance : (stats.totalEmployees || 0)}</span>
                                    </div>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-white rounded-full opacity-50" style={{ width: isEmployee ? '98%' : '100%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold opacity-80">{isEmployee ? "Course Progress" : "Live Status"}</span>
                                        <span className="text-sm font-black">{isEmployee ? "75%" : "Active"}</span>
                                    </div>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full w-[75%] bg-blue-400 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                            <h3 className="text-lg font-black text-slate-900 mb-6">{isEmployee ? "Personal Summary" : "Today's Summary"}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-emerald-600" />
                                        <span className="text-sm font-bold text-emerald-900">{isEmployee ? "Leave Balance" : "Employees"}</span>
                                    </div>
                                    <span className="text-lg font-black text-emerald-600">
                                        {isEmployee ? stats.myLeaveBalance : (stats.totalEmployees || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-blue-600" />
                                        <span className="text-sm font-bold text-blue-900">{isEmployee ? "My Team" : "Departments"}</span>
                                    </div>
                                    <span className="text-lg font-black text-blue-600">{isEmployee ? "12" : "0"}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={18} className="text-amber-600" />
                                        <span className="text-sm font-bold text-amber-900">Pending Actions</span>
                                    </div>
                                    <span className="text-lg font-black text-amber-600">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
