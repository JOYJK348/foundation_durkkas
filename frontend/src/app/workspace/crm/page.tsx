'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
    Mail
} from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { crmService } from "@/services/crmService";

const categoryConfig = [
    {
        key: 'vendors',
        title: 'Vendors / Suppliers',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000&q=80',
        link: '/platform/crm/vendor',
        description: 'Register as a vendor or supplier for the organization.',
        icon: Building2,
        statsLabel: 'Active'
    },
    {
        key: 'partners',
        title: 'Partners',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000&q=80',
        link: '/platform/crm/partners',
        description: 'Join our partnership ecosystem.',
        icon: Users,
        statsLabel: 'Current'
    },
    {
        key: 'jobSeekers',
        title: 'Job Seekers',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&q=80',
        link: '/platform/crm/job-seeker',
        description: 'Find your career opportunities with us.',
        icon: Briefcase,
        statsLabel: 'Applied'
    },
    {
        key: 'internships',
        title: 'Internship Applicants',
        image: 'https://images.unsplash.com/photo-1523240715632-d984bb4b990a?w=1000&q=80',
        link: '/platform/crm/internship',
        description: 'Apply for internship programs.',
        icon: GraduationCap,
        statsLabel: 'Students'
    },
    {
        key: 'courseEnquiries',
        title: 'Course Enquiry',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1000&q=80',
        link: '/platform/crm/course-enquiry',
        description: 'Enquire about our specialized courses.',
        icon: Search,
        statsLabel: 'Inquiries'
    },
    {
        key: 'careerGuidance',
        title: 'Career Guidance',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&q=80',
        link: '/platform/crm/career-guidance',
        description: 'Professional guidance and roadmaps for students.',
        icon: GraduationCap,
        statsLabel: 'Applied'
    }
];

export default function CRMWorkspacePage() {
    const [stats, setStats] = useState<any>(null);
    const [recentLeads, setRecentLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchRecentLeads()]);
            setLoading(false);
        };
        initData();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await crmService.getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load CRM stats");
        }
    };

    const fetchRecentLeads = async () => {
        try {
            const data = await crmService.getRecentLeads();
            setRecentLeads(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const copyToClipboard = (link: string) => {
        const fullUrl = `${window.location.origin}${link}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Link copied to clipboard!");
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
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
                        <Link href="/platform/crm" target="_blank">
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

                    {/* Left Column: Stats & Recent */}
                    <div className="xl:col-span-3 space-y-8">

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Leads', value: stats?.totalLeads ?? 0, trend: '+Smart Flow', color: 'text-[#409891]', bg: 'bg-[#409891]/5', icon: LayoutDashboard },
                                { label: 'Active Partners', value: stats?.activePartners ?? 0, trend: 'Collaborations', color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
                                { label: 'Applications', value: stats?.applications ?? 0, trend: 'Talent Pool', color: 'text-violet-600', bg: 'bg-violet-50', icon: Briefcase },
                                { label: 'Enquiries', value: stats?.enquiries ?? 0, trend: 'Lead Potential', color: 'text-amber-600', bg: 'bg-amber-50', icon: Search },
                            ].map((idx) => (
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
                                            <th className="px-8 py-4 font-black">Lead Name & Source</th>
                                            <th className="px-6 py-4 font-black text-center">Category</th>
                                            <th className="px-6 py-4 font-black">Email Address</th>
                                            <th className="px-8 py-4 font-black text-right">Applied On</th>
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
                                                            <div className="text-sm font-bold text-slate-800">{lead.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{lead.type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm
                                                        ${lead.type === 'Vendor' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            lead.type === 'Partner' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                lead.type === 'Job Seeker' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                                                                    lead.type === 'Internship' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                                                                        'bg-emerald-50 text-emerald-600 border-emerald-100'}
                                                    `}>
                                                        {lead.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <Mail className="w-3.5 h-3.5 opacity-40" />
                                                        {lead.email}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="text-xs font-bold text-slate-400">{formatDate(lead.date)}</div>
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
                                                ?cid={stats?.companyId}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(`/platform/crm${stats?.companyId ? `?cid=${stats.companyId}` : ''}`)}
                                                className="w-10 h-10 bg-white text-[#409891] rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-2 space-y-3">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Individual Channel Links</p>
                                        <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar-white">
                                            {categoryConfig.map(cat => (
                                                <div key={cat.key} className="group/item flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <cat.icon className="w-3.5 h-3.5 text-white/60" />
                                                        <span className="text-[11px] font-bold text-white/90">{cat.title}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(`${cat.link}${stats?.companyId ? `?cid=${stats.companyId}` : ''}`)}
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

                        {/* Module Shortcuts Card */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-4">Quick Tracks</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {categoryConfig.map((cat) => (
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

                {/* Channel Preview Grid */}
                <div className="pt-8">
                    <div className="flex items-end justify-between mb-6 px-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Module Ecosystem</h2>
                            <p className="text-sm font-medium text-slate-400">Deep dive into each registration channel.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryConfig.map((cat, idx) => (
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
                                        <Link href={cat.link} className="h-10 px-4 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center hover:bg-slate-100 transition-all">
                                            View Form
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
