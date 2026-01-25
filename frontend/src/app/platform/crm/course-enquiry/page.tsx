'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import '../crm.css';

const mainCategories = [
    {
        id: 'ai-robotics',
        title: 'School of AI & Robotics',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000&q=80',
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
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&q=80',
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
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1000&q=80',
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
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&q=80',
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
        { id: 'k12-robotics', label: 'K-12 Robotics', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80' },
        { id: 'aicra-courses', label: 'AICRA Courses', image: 'https://images.unsplash.com/photo-1531746790731-6c41d256ef72?w=800&q=80' }
    ],
    'languages': [
        { id: 'indian-languages', label: 'Indian Languages', image: 'https://images.unsplash.com/photo-1566678299103-c10d75739edf?w=800&q=80' },
        { id: 'foreign-languages', label: 'Foreign Languages', image: 'https://images.unsplash.com/photo-1526662092594-e98c1e356d6a?w=800&q=80' }
    ],
    'finance': [
        { id: 'accounting-taxation', label: 'Accounting & Taxation', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80' },
        { id: 'company-formation', label: 'Company Formation', image: 'https://images.unsplash.com/photo-1507679799987-c7377ec48696?w=800&q=80' }
    ],
    'business': [
        { id: 'digital-business', label: 'Digital Business Admin', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
        { id: 'digital-marketing', label: 'Digital Marketing', image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c20e?w=800&q=80' }
    ]
};

export default function CourseEnquiryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cid = searchParams.get('cid'); // Extract company ID from URL

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
        company_id: cid ? parseInt(cid) : 11, // Use cid from URL or default to 11
    });
    const [fileError, setFileError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const getWordCount = (text: string) => {
        return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    };



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

        // 1. Name validation: Only characters and spaces
        if (name === 'name') {
            const charOnlyValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: charOnlyValue }));
            return;
        }

        // 2. Phone number validation: Only 10 digit numbers
        if (name === 'phone_number') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        // 3. Word count validation for course_enquiry and remarks
        if (name === 'course_enquiry' || name === 'remarks') {
            const words = value.trim().split(/\s+/);
            if (words.length > 500 && value.length > (formData[name as keyof typeof formData] as string || '').length) {
                return; // Block adding more words
            }
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'date_of_birth') {
                updated.age = calculateAge(value);
            }
            return updated;
        });
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);

        if (file) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setFileError('File size exceeds 5MB limit. Please upload a smaller file.');
                e.target.value = ''; // Reset input
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.phone_number.length !== 10) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }

        if (fileError) {
            alert(fileError);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/crm/applications/course-enquiry', formData);

            if (response.status === 201 || response.status === 200) {
                alert('Course Enquiry submitted successfully!');
                router.push('/workspace/crm');
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
                        <button onClick={() => router.push('/workspace/crm')} className="mb-6 inline-flex items-center text-[#409891] hover:underline font-medium">← Back to CRM</button>
                        <h1 className="text-4xl font-bold text-slate-800">Course Enquiry / Registration</h1>
                        <p className="mt-4 text-lg text-slate-600">Explore our specialized schools and programs.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {mainCategories.map((cat, idx) => (
                            <div
                                key={cat.id}
                                onClick={() => { setSelectedMain(cat.id); setFormData(p => ({ ...p, category: cat.title })); setView('subcategories'); }}
                                className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hero-fade-in"
                                style={{ animationDelay: `${0.1 * idx}s` }}
                            >
                                <Image
                                    src={cat.image}
                                    alt={cat.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                                    <div className="mb-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl group-hover:bg-white/30 transition-colors">
                                        {cat.icon}
                                    </div>
                                    <h3 className="text-xl font-bold">{cat.title}</h3>
                                    <p className="mt-2 text-xs font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">Select School →</p>
                                </div>
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
                                className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hero-fade-in"
                                style={{ animationDelay: `${0.1 * idx}s` }}
                            >
                                <Image
                                    src={sub.image}
                                    alt={sub.label}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">
                                    <h3 className="text-2xl font-bold">{sub.label}</h3>
                                </div>
                                <div className="absolute bottom-6 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-white/90 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                                        Enquire Now →
                                    </span>
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
                                    placeholder="Enter 10-digit phone number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                    pattern="\d{10}"
                                    title="Phone number must be exactly 10 digits"
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
                            <div className="flex justify-between mt-1">
                                <p className="text-xs text-slate-400">Please provide details (Max 500 words)</p>
                                <p className={`text-xs font-medium ${getWordCount(formData.course_enquiry) > 480 ? 'text-orange-500' : 'text-slate-400'}`}>
                                    {getWordCount(formData.course_enquiry)} / 500 words
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload File (Optional)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-[#409891] transition-colors cursor-pointer group">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-slate-400 group-hover:text-[#409891]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-slate-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#409891] hover:text-[#327a75]">
                                            <span>{selectedFile ? selectedFile.name : 'Upload a file'}</span>
                                            <input type="file" className="sr-only" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf" />
                                        </label>
                                        <p className="pl-1 text-slate-400">{!selectedFile && 'or drag and drop'}</p>
                                    </div>
                                    <p className="text-xs text-slate-500">PNG, JPG, PDF up to 5MB</p>
                                    {fileError && <p className="text-xs text-red-500 mt-1 font-medium">{fileError}</p>}
                                    {selectedFile && !fileError && <p className="text-xs text-[#409891] mt-1 font-medium">✓ File ready: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>}
                                </div>
                            </div>
                        </div>


                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                            <textarea
                                name="remarks"
                                placeholder="Any additional remarks (optional)"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                            ></textarea>
                            <div className="flex justify-between mt-1">
                                <p className="text-xs text-slate-400">Maximum 500 words</p>
                                <p className={`text-xs font-medium ${getWordCount(formData.remarks) > 480 ? 'text-orange-500' : 'text-slate-400'}`}>
                                    {getWordCount(formData.remarks)} / 500 words
                                </p>
                            </div>
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
