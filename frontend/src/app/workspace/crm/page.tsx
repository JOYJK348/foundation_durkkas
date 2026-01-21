'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Users,
    Briefcase,
    UserPlus,
    GraduationCap,
    Search,
    BarChart3,
    ArrowUpRight,
    Star,
    Calendar,
    Building2,
    HeartHandshake,
    Copy,
    ExternalLink,
    CheckCircle2
} from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";

const categories = [
    {
        title: 'Vendors / Suppliers',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
        link: '/platform/crm/vendor',
        description: 'Register as a vendor or supplier for the organization.',
        icon: Building2,
        color: 'from-blue-500 to-indigo-600',
        stats: '12 Active'
    },
    {
        title: 'B2B Applications',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
        link: '/platform/crm/b2b',
        description: 'Business-to-Business partnership opportunities.',
        icon: HeartHandshake,
        color: 'from-emerald-500 to-teal-600',
        stats: '8 Pending'
    },
    {
        title: 'Partners',
        image: 'https://images.unsplash.com/photo-1454165833767-0275080187a1?w=800&q=80',
        link: '/platform/crm/partners',
        description: 'Join our partnership ecosystem.',
        icon: Users,
        color: 'from-amber-500 to-orange-600',
        stats: '15 Current'
    },
    {
        title: 'Job Seekers',
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80',
        link: '/platform/crm/job-seeker',
        description: 'Find your career opportunities with us.',
        icon: Briefcase,
        color: 'from-violet-500 to-purple-600',
        stats: '45 Applied'
    },
    {
        title: 'Internship Applicants',
        image: 'https://images.unsplash.com/photo-1523240715632-d984bb4b990a?w=800&q=80',
        link: '/platform/crm/internship',
        description: 'Apply for internship programs.',
        icon: GraduationCap,
        color: 'from-rose-500 to-pink-600',
        stats: '28 Students'
    },
    {
        title: 'Course Enquiry',
        image: 'https://images.unsplash.com/photo-1524178232457-3bb2449b3840?w=800&q=80',
        link: '/platform/crm/course-enquiry',
        description: 'Enquire about our specialized courses.',
        icon: Search,
        color: 'from-cyan-500 to-blue-600',
        stats: '62 Inquiries'
    }
];

export default function CRMWorkspacePage() {
    const copyToClipboard = (link: string) => {
        const fullUrl = `${window.location.origin}${link}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Public link copied to clipboard!");
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#409891]/10 border border-[#409891]/30 mb-3">
                            <BarChart3 className="w-3.5 h-3.5 text-[#409891]" />
                            <span className="text-[10px] font-bold text-[#409891] uppercase tracking-wider">CRM Lead Centre</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                            Lead Management Hub
                        </h1>
                        <p className="text-slate-500 font-medium max-w-2xl">
                            Oversee your ecosystem of applicants and partners. Share registration links or manage incoming submissions.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/platform/crm" target="_blank">
                            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                <ExternalLink className="w-4 h-4 text-slate-400" />
                                Public Landing Page
                            </button>
                        </Link>
                        <button className="px-5 py-2.5 bg-[#409891] text-white rounded-xl text-sm font-bold hover:bg-[#327a75] transition-all flex items-center gap-2 shadow-lg shadow-[#409891]/25">
                            <Star className="w-4 h-4" />
                            Launch Dashboard
                        </button>
                    </div>
                </div>

                {/* KPI Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Leads', value: '1,284', trend: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Active Partners', value: '42', trend: 'Stable', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Applications', value: '86', trend: '+5 New', color: 'text-violet-600', bg: 'bg-violet-50' },
                        { label: 'Enquiries', value: '312', trend: 'High', color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((idx) => (
                        <div key={idx.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">{idx.label}</p>
                            <h3 className="text-2xl font-black text-slate-900">{idx.value}</h3>
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold ${idx.color} ${idx.bg} px-1.5 py-0.5 rounded`}>{idx.trend}</span>
                                <span className="text-[10px] text-slate-400">vs last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                            <div className="relative h-44 w-full overflow-hidden">
                                <Image
                                    src={cat.image}
                                    alt={cat.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-xl p-2.5 border border-white/30 text-white">
                                    <cat.icon className="w-5 h-5" />
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-lg font-bold text-white mb-1">{cat.title}</h3>
                                    <span className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
                                        {cat.stats} Lead Records
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                                    {cat.description}
                                </p>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Link href={cat.link} className="flex-1">
                                            <button className="w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                                View Form
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => copyToClipboard(cat.link)}
                                            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-[#409891]"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button className="w-full py-2.5 bg-[#409891]/5 text-[#409891] rounded-xl text-xs font-bold hover:bg-[#409891]/10 transition-all flex items-center justify-center gap-2 group/btn">
                                        Manage Submissions
                                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Active Support & Quick Links */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#409891]/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="flex-1 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-6 h-6 text-[#409891]" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Lead Centre is Live</h2>
                            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                                Your multi-track registration system is now online. Incoming leads will be automatically categorized and stored for review.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto relative z-10">
                            <button className="px-6 py-3 bg-[#409891] text-white rounded-xl font-bold text-sm hover:bg-[#327a75] transition-all whitespace-nowrap">
                                View Recent Leads
                            </button>
                            <button className="px-6 py-3 bg-white/10 text-white border border-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all whitespace-nowrap">
                                Export Data (CSV)
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#409891]" />
                            Public Access
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Landing Page URL</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs text-[#409891] font-mono flex-1 truncate">/platform/crm</code>
                                    <button onClick={() => copyToClipboard('/platform/crm')} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Share the main landing page or individual track links with your network to start capturing leads.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
