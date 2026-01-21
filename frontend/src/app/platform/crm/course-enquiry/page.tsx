'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import '../crm.css';

const mainCategories = [
    {
        id: 'ai-robotics',
        title: 'School of AI & Robotics',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
        icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8" y2="16"></line>
                <line x1="16" y1="16" x2="16" y2="16"></line>
            </svg>
        )
    },
    {
        id: 'languages',
        title: 'School of Languages',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
        icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8l6 6"></path>
                <path d="M4 14l6-6 2-3"></path>
                <path d="M2 5h12"></path>
                <path d="M7 2h1"></path>
                <path d="M22 22l-5-10-5 10"></path>
                <path d="M14 18h6"></path>
            </svg>
        )
    },
    {
        id: 'finance',
        title: 'School of Finance',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
        )
    },
    {
        id: 'business',
        title: 'School of Business',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
        icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
        )
    }
];

const subCategoriesMap: Record<string, { id: string, label: string, image: string }[]> = {
    'ai-robotics': [
        { id: 'k12-robotics', label: 'K-12 Robotics', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' },
        { id: 'aicra-courses', label: 'AICRA Courses', image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&q=80' }
    ],
    'languages': [
        { id: 'indian-languages', label: 'Indian Languages', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80' },
        { id: 'foreign-languages', label: 'Foreign Languages', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80' }
    ],
    'finance': [
        { id: 'accounting-taxation', label: 'Accounting & Taxation', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
        { id: 'company-formation', label: 'Company Formation', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80' }
    ],
    'business': [
        { id: 'digital-business', label: 'Digital Business Admin', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80' },
        { id: 'digital-marketing', label: 'Digital Marketing', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80' }
    ]
};

export default function CourseEnquiryPage() {
    const router = useRouter();
    const [view, setView] = useState('categories');
    const [selectedMain, setSelectedMain] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: '',
        sub_category: '',
        name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        age: 0,
        address: '',
        course_enquiry: '',
        remarks: '',
        company_id: 20,
    });

    const calculateAge = (dobString: string) => {
        if (!dobString) return 0;
        const birthDate = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();
        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age > 0 ? age : 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'date_of_birth') {
                updated.age = calculateAge(value);
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await api.post('/crm/applications/course-enquiry', formData);

            if (response.status === 201 || response.status === 200) {
                alert('Course Enquiry submitted successfully!');
                router.push('/platform/crm');
            }
        } catch (err: any) {
            console.error('Course Enquiry Submission Error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit enquiry.';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'categories') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 crm-theme">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <button onClick={() => router.push('/platform/crm')} className="mb-6 inline-flex items-center text-[#409891] hover:underline font-medium">← Back to Overview</button>
                        <h1 className="text-4xl font-bold text-slate-800">Course Enquiry / Registration</h1>
                        <p className="mt-4 text-lg text-slate-600">Explore our specialized schools and programs.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {mainCategories.map((cat, idx) => (
                            <div
                                key={cat.id}
                                onClick={() => { setSelectedMain(cat.id); setFormData(p => ({ ...p, category: cat.title })); setView('subcategories'); }}
                                className="group bg-white rounded-3xl p-8 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col items-center text-center hero-fade-in"
                                style={{ animationDelay: `${0.1 * idx}s` }}
                            >
                                <div className="mb-6 p-4 bg-[#409891]/10 rounded-2xl group-hover:bg-[#409891] group-hover:text-white transition-colors duration-300">
                                    {cat.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{cat.title}</h3>
                                <p className="text-sm text-slate-500">View available courses →</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'subcategories') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 crm-theme">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <button onClick={() => setView('categories')} className="mb-6 inline-flex items-center text-[#409891] hover:underline font-medium">← Back to Schools</button>
                        <h1 className="text-3xl font-bold text-slate-800">{formData.category}</h1>
                        <p className="mt-4 text-lg text-slate-600">Select your preferred course track.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {subCategoriesMap[selectedMain]?.map((sub, idx) => (
                            <div
                                key={sub.id}
                                onClick={() => { setFormData(p => ({ ...p, sub_category: sub.label })); setView('form'); }}
                                className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hero-fade-in"
                                style={{ animationDelay: `${0.1 * idx}s` }}
                            >
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${sub.image})` }} />
                                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
                                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">
                                    <h3 className="text-2xl font-bold">{sub.label}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 crm-theme">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => setView('subcategories')} className="mb-8 flex items-center text-[#409891] hover:underline font-medium">← Back to Courses</button>

                <div className="bg-white rounded-3xl shadow-xl shadow-[#409891]/5 overflow-hidden border border-slate-100">
                    <div className="bg-[#409891] px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold">Course Enquiry Form</h1>
                        <p className="mt-2 opacity-90"><span className="font-semibold underline">Enquiring for:</span> {formData.category} - {formData.sub_category}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                                <input
                                    type="text"
                                    name="date"
                                    value={formData.date}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    placeholder="Enter your phone number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth (D.O.B) *</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Age *</label>
                                <input
                                    type="text"
                                    name="age"
                                    value={formData.age}
                                    placeholder="Auto-calculated"
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Address *</label>
                            <textarea
                                name="address"
                                placeholder="Enter your address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Course Enquiry *</label>
                            <textarea
                                name="course_enquiry"
                                placeholder="Please provide details about the course you are enquiring about"
                                value={formData.course_enquiry}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                            <textarea
                                name="remarks"
                                placeholder="Any additional remarks (optional)"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={4}
                                maxLength={500}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                            ></textarea>
                            <p className="mt-1 text-xs text-slate-400">Maximum 500 words</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-[#409891] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#409891]/20 hover:bg-[#327a75] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('subcategories')}
                                className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
