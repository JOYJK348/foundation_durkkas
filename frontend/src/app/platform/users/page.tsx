"use client";

import React, { useEffect, useState } from "react";
import {
    Users2,
    ShieldCheck,
    TrendingUp,
    Search,
    Filter,
    Loader2,
    Eye,
    Building2,
    MapPin,
    UserCheck,
    Briefcase
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";

export default function PlatformUsersOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        platform: 0,
        company: 0,
        branch: 0,
        employee: 0,
        total: 0
    });
    const [users, setUsers] = useState<any[]>([]);
    const [filterRole, setFilterRole] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        if (roleParam) {
            setFilterRole(roleParam);
        }
        loadUserAnalytics();
    }, []);

    const loadUserAnalytics = async () => {
        try {
            setLoading(true);
            const usersData = await platformService.getUsers();
            setUsers(usersData);

            // Calculate Role Distribution
            const distribution = {
                platform: 0,
                company: 0,
                branch: 0,
                employee: 0,
                total: usersData.length
            };

            usersData.forEach((u: any) => {
                const level = u.user_roles?.[0]?.roles?.level || 0;
                if (level === 5) distribution.platform++;
                else if (level === 4) distribution.company++;
                else if (level === 1) distribution.branch++;
                else distribution.employee++;
            });

            setStats(distribution);
        } catch (error) {
            console.error("User overview error", error);
            toast.error("Failed to load user data");
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const usersToDisplay = users.filter(user => {
        const matchesSearch = (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const roleMatch = !filterRole || user.user_roles?.[0]?.roles?.name === filterRole;

        const statusMatch = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' ? user.is_active : !user.is_active);

        return matchesSearch && roleMatch && statusMatch;
    });

    const statCards = [
        {
            label: "Total Users",
            value: stats.total,
            icon: Users2,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            trend: "+12%"
        },
        {
            label: "Platform Admins",
            value: stats.platform,
            icon: ShieldCheck,
            color: "text-violet-600",
            bgColor: "bg-violet-50",
            trend: "Stable"
        },
        {
            label: "Company Admins",
            value: stats.company,
            icon: Building2,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            trend: "+5%"
        },
        {
            label: "Employees",
            value: stats.employee,
            icon: Briefcase,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            trend: "+8%"
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Users2 className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">User Management</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Global Registry
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Manage and monitor all users across the platform
                        </p>
                    </div>
                </div>

                {/* Stats Grid - Identical to Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {statCards.map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 hover:border-slate-200 transition-all hover:shadow-lg group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>{stat.trend}</span>
                                </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                                {stat.value}
                            </h3>
                            <p className="text-xs md:text-sm font-medium text-slate-500">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Search & Filters - Identical to Companies */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or ID..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                            <div className="relative min-w-[150px]">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-none rounded-xl py-3 pl-9 pr-8 text-xs font-bold uppercase tracking-wider text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 cursor-pointer"
                                    value={filterRole || ''}
                                    onChange={(e) => setFilterRole(e.target.value || null)}
                                >
                                    <option value="">All Roles</option>
                                    <option value="PLATFORM_ADMIN">Platform Admin</option>
                                    <option value="COMPANY_ADMIN">Company Admin</option>
                                    <option value="BRANCH_ADMIN">Branch Admin</option>
                                    <option value="EMPLOYEE">Employee</option>
                                </select>
                            </div>
                            <div className="relative min-w-[150px]">
                                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-none rounded-xl py-3 pl-9 pr-8 text-xs font-bold uppercase tracking-wider text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading directory...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View - Identical to Companies */}
                        <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Identity</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Scope</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {usersToDisplay.map((user: any) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white flex items-center justify-center font-bold text-sm">
                                                            {user.email?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{user.email}</p>
                                                            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {user.id.substring(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold
                                                        ${user.user_roles?.[0]?.roles?.level === 5 ? 'bg-violet-100 text-violet-700' :
                                                            user.user_roles?.[0]?.roles?.level === 4 ? 'bg-blue-100 text-blue-700' :
                                                                user.user_roles?.[0]?.roles?.level === 1 ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-slate-100 text-slate-700'}`}>
                                                        {user.user_roles?.[0]?.roles?.name || 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {user.user_roles?.[0]?.companies?.name || 'Global Platform'}
                                                        </span>
                                                        {user.user_roles?.[0]?.branches?.name && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                                <MapPin className="w-3 h-3" />
                                                                {user.user_roles?.[0]?.branches?.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        {user.is_active ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-sm font-semibold text-[#0066FF] hover:text-[#0052CC] flex items-center justify-end gap-1 ml-auto">
                                                        View
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {usersToDisplay.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                                    No users found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View - Identical to Companies */}
                        <div className="lg:hidden space-y-4">
                            {usersToDisplay.map((user: any) => (
                                <div key={user.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white flex items-center justify-center font-bold text-lg">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 break-all pr-2 text-sm">{user.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                        ${user.user_roles?.[0]?.roles?.level === 5 ? 'bg-violet-100 text-violet-700' :
                                                            user.user_roles?.[0]?.roles?.level === 4 ? 'bg-blue-100 text-blue-700' :
                                                                user.user_roles?.[0]?.roles?.level === 1 ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-slate-100 text-slate-700'}`}>
                                                        {user.user_roles?.[0]?.roles?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            {user.is_active ? 'Active' : 'SSPD'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="p-3 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-500 font-medium mb-1">Scope</p>
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {user.user_roles?.[0]?.companies?.name || 'Global'}
                                            </p>
                                        </div>
                                        {user.user_roles?.[0]?.branches?.name ? (
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-500 font-medium mb-1">Branch</p>
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {user.user_roles?.[0]?.branches?.name}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-500 font-medium mb-1">ID</p>
                                                <p className="text-sm font-bold text-slate-900 font-mono">
                                                    ...{user.id.substring(0, 8)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        View Profile
                                    </button>
                                </div>
                            ))}
                            {usersToDisplay.length === 0 && (
                                <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
                                    No users found.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
