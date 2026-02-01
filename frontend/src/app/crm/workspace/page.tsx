'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Users,
    Briefcase,
    GraduationCap,
    Search,
    BarChart3,
    ArrowUpRight,
    Star,
    Building2,
    Copy,
    ExternalLink,
    CheckCircle2,
    Loader2,
    Zap,
    Calendar,
    LayoutDashboard,
    Clock,
    Mail,
    ShieldAlert,
    Pencil,
    Trash2,
    Eye
} from 'lucide-react';
import api from '@/lib/api';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { crmService } from "@/services/crmService";
import { useFeatureAccess } from "@/contexts/FeatureAccessContext";

const categoryConfig = [
    {
        id: 87,
        key: 'tracks',
        title: 'Lead Tracks',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&q=80',
        link: '/crm/platform/tracks',
        description: 'Global tracking and management of all lead channels.',
        icon: Star,
        statsLabel: 'Smart Flows'
    },
    {
        id: 88,
        key: 'vendors',
        title: 'Vendors / Suppliers',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000&q=80',
        link: '/crm/platform/vendor',
        description: 'Register as a vendor or supplier for the organization.',
        icon: Building2,
        statsLabel: 'Active'
    },
    {
        id: 89,
        key: 'partners',
        title: 'Partners',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000&q=80',
        link: '/crm/platform/partners',
        description: 'Join our partnership ecosystem.',
        icon: Users,
        statsLabel: 'Current'
    },
    {
        id: 90,
        key: 'jobSeekers',
        title: 'Job Seekers',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&q=80',
        link: '/crm/platform/job-seeker',
        description: 'Find your career opportunities with us.',
        icon: Briefcase,
        statsLabel: 'Applied'
    },
    {
        id: 91,
        key: 'internships',
        title: 'Internship Applicants',
        image: 'https://images.unsplash.com/photo-1523240715632-d984bb4b990a?w=1000&q=80',
        link: '/crm/platform/internship',
        description: 'Apply for internship programs.',
        icon: GraduationCap,
        statsLabel: 'Students'
    },
    {
        id: 92,
        key: 'courseEnquiries',
        title: 'Course Enquiry',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1000&q=80',
        link: '/crm/platform/course-enquiry',
        description: 'Enquire about our specialized courses.',
        icon: Search,
        statsLabel: 'Inquiries'
    },
    {
        id: 93,
        key: 'careerGuidance',
        title: 'Career Guidance',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&q=80',
        link: '/crm/platform/career-guidance',
        description: 'Professional guidance and roadmaps for students.',
        icon: GraduationCap,
        statsLabel: 'Applied'
    }
];

export default function CRMWorkspacePage() {
    const router = useRouter();
    const { hasModule, isLoading: featureLoading, company, accessibleMenuIds } = useFeatureAccess();
    const [stats, setStats] = useState<any>(null);
    const [recentLeads, setRecentLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal Management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeLead, setActiveLead] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [modalLoading, setModalLoading] = useState(false);

    const handleOpenModal = async (lead: any, mode: 'view' | 'edit') => {
        setModalMode(mode);
        setModalLoading(true);
        setIsModalOpen(true);

        try {
            const type = lead.categoryKey === 'vendors' ? 'vendor' : lead.categoryKey === 'jobSeekers' ? 'job-seeker' : lead.categoryKey === 'internships' ? 'internship' : lead.categoryKey === 'courseEnquiries' ? 'course-enquiry' : lead.categoryKey === 'careerGuidance' ? 'career-guidance' : 'partner';
            const data = await crmService.getLead(type, lead.id);
            setActiveLead({ ...data, _type: type });
        } catch (error) {
            console.error("❌ Detail fetch failed:", error);
            toast.error("Could not fetch lead details from Cloud engine");
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateLead = async () => {
        if (!activeLead) return;
        setModalLoading(true);
        try {
            const res = await crmService.updateLead(activeLead._type, activeLead.id, activeLead);
            if (res.success) {
                toast.success("Lead synchronized with Cloud database");
                setIsModalOpen(false);
                fetchRecentLeads();
            }
        } catch (error) {
            toast.error("Update synchronization failed");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteLead = async (lead: any) => {
        const reason = window.prompt(`Why are you archiving ${lead.name}? (Required)`, "Administrative clean-up");
        if (reason === null) return;
        if (!reason.trim()) {
            toast.error("Archive reason is mandatory for audit compliance");
            return;
        }

        try {
            toast.loading(`Synchronizing Archive...`);
            const type = lead.categoryKey === 'vendors' ? 'vendor' : lead.categoryKey === 'jobSeekers' ? 'job-seeker' : lead.categoryKey === 'internships' ? 'internship' : lead.categoryKey === 'courseEnquiries' ? 'course-enquiry' : lead.categoryKey === 'careerGuidance' ? 'career-guidance' : 'partner';

            const res = await crmService.deleteLead(type, lead.id, reason);

            if (res.success) {
                toast.success("Lead moved to archives with audit reason");
                fetchRecentLeads();
                fetchStats();
            }
        } catch (error: any) {
            console.error("❌ Archive failed:", error);
            toast.error("Cloud engine could not process archival");
        } finally {
            toast.dismiss();
        }
    };

    const getActionLink = (lead: any, mode: 'view' | 'edit') => {
        const config = categoryConfig.find(c => c.key === lead.categoryKey);
        if (!config) return '#';
        return `${config.link}?id=${lead.id}&mode=${mode}`;
    };

    // Check CRM module access
    useEffect(() => {
        // 🛡️ SECURITY ENFORCEMENT
        // Only trigger redirect if features have loaded AND we are sure the company doesn't have the module
        // company object being present confirms hydration has occurred
        if (!featureLoading && company && !hasModule('CRM')) {
            toast.error('CRM module is not enabled for your subscription');
            router.push('/workspace/dashboard');
        }
    }, [featureLoading, hasModule, router, company]);

    useEffect(() => {
        if (featureLoading) return; // Wait for feature access to load

        const initData = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchRecentLeads()]);
            setLoading(false);
        };
        initData();
    }, [featureLoading]);

    const fetchStats = async () => {
        try {
            console.log('[CRM Dashboard] 🔄 Fetching stats...');
            const data = await crmService.getStats();
            console.log('[CRM Dashboard] ✅ Stats loaded:', data);
            setStats(data);
            toast.success(`CRM Stats Updated - ${data?.totalLeads || 0} total leads`);
        } catch (error) {
            console.error('[CRM Dashboard] ❌ Stats error:', error);
            toast.error("Failed to load CRM stats");
        }
    };

    const fetchRecentLeads = async () => {
        try {
            console.log('[CRM Dashboard] 🔄 Fetching recent leads...');
            const data = await crmService.getRecentLeads();
            console.log('[CRM Dashboard] ✅ Recent leads received:', data);

            if (Array.isArray(data)) {
                setRecentLeads(data);
            } else {
                console.warn('[CRM Dashboard] ⚠️ Received non-array data for recent leads');
                setRecentLeads([]);
            }
        } catch (error) {
            console.error('[CRM Dashboard] ❌ Recent leads error:', error);
        }
    };

    const copyToClipboard = (link: string) => {
        const fullUrl = `${window.location.origin}${link}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Link copied to clipboard!");
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#409891]" />
                    <p className="text-slate-400 font-medium animate-pulse text-sm">Syncing your Lead Centre...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-2">
                            <Zap className="w-3.5 h-3.5 text-[#409891] fill-[#409891]" />
                            <span className="text-[10px] font-bold text-[#409891] uppercase tracking-widest">Real-time CRM</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                            Growth Dashboard
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl pt-2">
                            Central visibility into your organization's talent and partner pipeline.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/crm/platform" target="_blank">
                            <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap">
                                <ExternalLink className="w-4 h-4 text-slate-400" />
                                Public Ecosystem
                            </button>
                        </Link>
                        <button
                            onClick={() => { setLoading(true); Promise.all([fetchStats(), fetchRecentLeads()]).then(() => setLoading(false)) }}
                            className="h-12 px-6 bg-[#409891] text-white rounded-2xl text-xs font-bold hover:bg-[#327a75] transition-all flex items-center gap-2 shadow-lg shadow-[#409891]/25 whitespace-nowrap"
                        >
                            <Calendar className="w-4 h-4" />
                            Force Refresh
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3 space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: 87, label: 'Total Leads', value: stats?.totalLeads ?? 0, trend: '+Smart Flow', color: 'text-[#409891]', bg: 'bg-[#409891]/5', icon: LayoutDashboard },
                                { id: 89, label: 'Active Partners', value: stats?.activePartners ?? 0, trend: 'Collaborations', color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
                                { id: 90, label: 'Applications', value: stats?.applications ?? 0, trend: 'Talent Pool', color: 'text-violet-600', bg: 'bg-violet-50', icon: Briefcase },
                                { id: 92, label: 'Enquiries', value: stats?.enquiries ?? 0, trend: 'Lead Potential', color: 'text-amber-600', bg: 'bg-amber-50', icon: Search },
                            ]
                                .filter(card => accessibleMenuIds.includes(card.id))
                                .map((idx) => (
                                    <div key={idx.label} className="group relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#409891]/20 transition-all duration-500 overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-24 h-24 ${idx.bg} rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`}></div>
                                        <idx.icon className={`w-6 h-6 ${idx.color} mb-4 relative z-10`} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{idx.label}</p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-3xl font-black text-slate-900 group-hover:translate-x-1 transition-transform">{idx.value}</h3>
                                            <span className={`text-[10px] font-bold ${idx.color} opacity-80 uppercase`}>{idx.trend}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Recent Leads Table */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-none mb-1 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#409891]" />
                                        Incoming Activity
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium">Top 10 most recent leads from all channels.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-500 transition-colors uppercase">View All Activity</button>
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#F8FAFC]/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                                        <tr>
                                            <th className="px-8 py-4 font-black w-[30%]">Lead Name & Source</th>
                                            <th className="px-6 py-4 font-black">Email Address</th>
                                            <th className="px-6 py-4 font-black text-center">Applied On</th>
                                            <th className="px-8 py-4 font-black text-right w-[20%]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {recentLeads.length > 0 ? recentLeads.map((lead, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50/80 transition-all duration-300">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xs uppercase shadow-inner group-hover:bg-[#409891] group-hover:text-white transition-all">
                                                            {lead.name?.charAt(0) || 'L'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800 line-clamp-1">{lead.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{lead.type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-hidden">
                                                        <Mail className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                                        <span className="truncate">{lead.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="text-xs font-bold text-slate-400">{formatDate(lead.date)}</div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 text-right">
                                                        <button
                                                            onClick={() => handleOpenModal(lead, 'view')}
                                                            title="View Details"
                                                            className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all backdrop-blur-sm"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleOpenModal(lead, 'edit')}
                                                            title="Edit Lead"
                                                            className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all backdrop-blur-sm"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLead(lead)}
                                                            title="Delete Permanently"
                                                            className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all backdrop-blur-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                            <BarChart3 className="w-8 h-8 text-slate-200" />
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No activity found yet</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions & Links */}
                    <div className="space-y-8">
                        {/* Share Links Card */}
                        <div className="bg-[#409891] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-[#409891]/20">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl"></div>
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <h3 className="text-xl font-black leading-none mb-2">Smart Links</h3>
                                    <p className="text-white/70 text-xs font-medium">Automatic multi-tenant tracking links for your network.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Master Landing Page</p>
                                        <div className="flex items-center gap-3">
                                            <code className="text-xs font-mono flex-1 truncate opacity-90">
                                                ?cid={company?.id}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(`/crm/platform${company?.id ? `?cid=${company.id}` : ''}`)}
                                                className="w-10 h-10 bg-white text-[#409891] rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-2 space-y-3">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Individual Channel Links</p>
                                        <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar-white">
                                            {categoryConfig
                                                .filter(cat => accessibleMenuIds.includes(cat.id))
                                                .map(cat => (
                                                    <div key={cat.key} className="group/item flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <cat.icon className="w-3.5 h-3.5 text-white/60" />
                                                            <span className="text-[11px] font-bold text-white/90">{cat.title}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard(`${cat.link}${company?.id ? `?cid=${company.id}` : ''}`)}
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white hover:text-[#409891] transition-all opacity-0 group-hover/item:opacity-100"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tracks Card */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-4">Quick Tracks</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {categoryConfig
                                        .filter(cat => accessibleMenuIds.includes(cat.id))
                                        .map((cat) => (
                                            <Link key={cat.key} href={cat.link} className="flex flex-col items-center justify-center aspect-square bg-white/5 rounded-[2rem] border border-white/5 p-4 hover:bg-[#409891] hover:border-[#409891] transition-all duration-500 group">
                                                <cat.icon className="w-6 h-6 text-[#409891] group-hover:text-white transition-colors mb-2" />
                                                <span className="text-[9px] font-black uppercase text-center text-slate-400 group-hover:text-white/80 transition-colors leading-tight">
                                                    {cat.title.split('/')[0]}
                                                </span>
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Module Ecosystem Grid */}
                <div className="pt-8">
                    <div className="flex items-end justify-between mb-6 px-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Module Ecosystem</h2>
                            <p className="text-sm font-medium text-slate-400">Deep dive into each registration channel.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryConfig
                            .filter(cat => accessibleMenuIds.includes(cat.id))
                            .map((cat, idx) => (
                                <div key={idx} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 h-full flex flex-col">
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <Image
                                            src={cat.image}
                                            alt={cat.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <h3 className="text-lg font-black text-white leading-none mb-1">{cat.title}</h3>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                                                            {stats?.[cat.key] || 0} {cat.statsLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white">
                                                    <cat.icon className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-1">
                                        <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 flex-1">
                                            {cat.description}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                                            <button className="h-10 px-4 bg-[#409891]/5 text-[#409891] rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#409891] hover:text-white transition-all">
                                                Manage
                                            </button>
                                            <Link
                                                href={`${cat.link}${company?.id ? `?cid=${company.id}` : ''}`}
                                                className="h-10 px-4 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center hover:bg-slate-100 transition-all"
                                            >
                                                View Form
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* 💎 PREMIUM LEAD DETAIL MODAL 💎 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">
                                    {modalMode === 'view' ? 'Lead Intelligence' : 'Refine Lead Data'}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{activeLead?._type || 'Dynamic'} Record</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400"
                            >
                                <ShieldAlert className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {modalLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#409891]" />
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Syncing lead context...</p>
                                </div>
                            ) : activeLead ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(activeLead)
                                        .filter(([key]) => !['_type', 'id', 'company_id', 'branch_id', 'created_at', 'updated_at', 'deleted_at', 'deleted_by', 'delete_reason'].includes(key))
                                        .map(([key, value]) => (
                                            <div key={key} className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{key.replace(/_/g, ' ')}</label>
                                                {modalMode === 'view' || key === 'date' ? (
                                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 min-h-[48px]">
                                                        {key === 'date' ? formatDate(value) : (String(value) || '—')}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={String(value || '')}
                                                        onChange={(e) => setActiveLead({ ...activeLead, [key]: e.target.value })}
                                                        className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                                    />
                                                )}
                                            </div>
                                        ))
                                    }
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 font-bold">No data available for this record</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-50 flex items-center justify-end gap-4 bg-slate-50/50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase"
                            >
                                Cancel
                            </button>
                            {modalMode === 'edit' && (
                                <button
                                    onClick={handleUpdateLead}
                                    disabled={modalLoading}
                                    className="px-8 py-3 bg-[#409891] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#409891]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Finalize Synchronization
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                
                .custom-scrollbar-white::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar-white::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                .custom-scrollbar-white::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
            `}</style>
        </DashboardLayout>
    );
}
