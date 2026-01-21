'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './crm.css';

const categories = [
    {
        title: 'Vendors / Suppliers',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
        link: '/platform/crm/vendor',
        description: 'Register as a vendor or supplier for Lead Centre.'
    },
    {
        title: 'B2B Applications',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
        link: '/platform/crm/b2b',
        description: 'Business-to-Business partnership opportunities.'
    },
    {
        title: 'Partners',
        image: 'https://images.unsplash.com/photo-1454165833767-0275080187a1?w=800&q=80',
        link: '/platform/crm/partners',
        description: 'Join our partnership ecosystem.'
    },
    {
        title: 'Job Seekers',
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80',
        link: '/platform/crm/job-seeker',
        description: 'Find your career opportunities with us.'
    },
    {
        title: 'Internship Applicants',
        image: 'https://images.unsplash.com/photo-1523240715632-d984bb4b990a?w=800&q=80',
        link: '/platform/crm/internship',
        description: 'Apply for internship programs.'
    },
    {
        title: 'Course Enquiry / Registration',
        image: 'https://images.unsplash.com/photo-1524178232457-3bb2449b3840?w=800&q=80',
        link: '/platform/crm/course-enquiry',
        description: 'Enquire about our specialized courses.'
    },
    {
        title: 'Career Guidance',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
        link: '/platform/crm/career-guidance',
        description: 'Professional guidance for your future.'
    }
];

export default function CRMLandingPage() {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen relative bg-[#F8FAFC] overflow-x-hidden selection:bg-[#409891] selection:text-white crm-theme">
            {/* Abstract Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#409891]/5 rounded-full blur-3xl"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-[#48ADB7]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-[#409891]/5 rounded-full blur-3xl"></div>
            </div>

            {/* Snow Effect */}
            <div className="snow-container fixed inset-0 pointer-events-none z-10 opacity-30">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="snowflake" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${10 + Math.random() * 10}s`,
                        opacity: Math.random()
                    }}></div>
                ))}
            </div>

            <div className="relative z-20">
                {/* Dynamic Hero Section */}
                <div className="relative pt-12 pb-8 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="hero-fade-in inline-flex items-center rounded-full px-4 py-1.5 mb-6 border border-[#409891]/30 bg-white/50 backdrop-blur-sm shadow-sm">
                            <span className="flex h-2 w-2 rounded-full bg-[#409891] mr-2 animate-pulse"></span>
                            <span className="text-xs font-semibold text-[#409891] tracking-wider uppercase">Lead Centre Ecosystem</span>
                        </div>

                        <h1 className="hero-fade-in text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight mb-6" style={{ animationDelay: '0.1s' }}>
                            <span className="font-serif italic text-[#409891]">"Every Lead Is An </span>
                            <span className="font-serif italic text-[#409891]">Accountable"</span>
                        </h1>

                        <p className="hero-fade-in text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
                            The central hub connecting vendors, partners, and job seekers with premium opportunities.
                        </p>
                    </div>
                </div>

                {/* Services Grid Section */}
                <div className="relative py-12 bg-white/40 backdrop-blur-[2px] border-t border-white/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map((category, index) => (
                                <Link key={index} href={category.link} className="hero-fade-in" style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}>
                                    <div className="service-card glass-card rounded-2xl p-6 h-full flex flex-col group cursor-pointer hover:border-[#409891]/50 transition-all duration-500">
                                        <div className="relative h-48 mb-6 overflow-hidden rounded-xl">
                                            <Image
                                                src={category.image}
                                                alt={category.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                                                <span className="text-white text-sm font-medium">Click to register →</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#409891] transition-colors">{category.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6">{category.description}</p>
                                        <div className="mt-auto">
                                            <div className="inline-flex items-center text-[#409891] font-semibold text-sm group/btn">
                                                Get Started
                                                <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-20 py-12 bg-[#409891] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm opacity-90 mb-4">© {new Date().getFullYear()} Lead Centre — Powered by Durkkas Innovations Pvt Ltd</p>
                    <div className="w-10 h-10 bg-white/20 rounded-lg mx-auto flex items-center justify-center backdrop-blur-sm">
                        <span className="font-bold text-lg">DK</span>
                    </div>
                </div>
            </footer>

            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#409891] to-[#48ADB7] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            )}
        </div>
    );
}
