'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import '../crm.css';

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const courseTypeOptions = [
    { value: 'ug', label: 'UG' },
    { value: 'pg', label: 'PG' },
    { value: 'certification', label: 'Certification' }
];

const departmentOptions = [
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'mechanical', label: 'Mechanical' },
    { value: 'civil', label: 'Civil' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'business', label: 'Business' },
    { value: 'others', label: 'Others' }
];

const internshipDomainOptions = [
    { value: 'it', label: 'IT' },
    { value: 'non-it', label: 'Non-IT' },
    { value: 'others', label: 'Others' }
];

const durationOptions = [
    { value: '3-months', label: '3 Months' },
    { value: '6-months', label: '6 Months' }
];

const internshipSubCategories = [
    {
        id: 'academic-mandatory-internships',
        label: 'Academic Mandatory internships',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&q=80',
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
        )
    },
    {
        id: 'college-final-year-students',
        label: 'College final-year students',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&q=80',
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
        )
    },
    {
        id: 'freshers-need-training-placement',
        label: 'Freshers need training & placement',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&q=80',
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        )
    }
];

export default function InternshipPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cid = searchParams.get('cid'); // Extract company ID from URL
    const [view, setView] = useState('subcategories');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: '',
        full_name: '',
        registration_number: '',
        address: '',
        email: '',
        contact_number: '',
        dob: '',
        age: 0,
        blood_group: '',
        gender: '',
        college_institution_name: '',
        course_type: '',
        department: '',
        internship_domain: '',
        duration: '',
        remarks: '',
        company_id: cid ? parseInt(cid) : 11,
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
        if (name === 'full_name' || name === 'college_institution_name') {
            const charOnlyValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: charOnlyValue }));
            return;
        }

        // 2. Contact number validation: Only 10 digit numbers
        if (name === 'contact_number') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        // 3. Remarks word count validation
        if (name === 'remarks') {
            const words = value.trim().split(/\s+/);
            if (words.length > 500 && value.length > (formData.remarks || '').length) {
                return; // Block adding more words
            }
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'dob') {
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

        if (formData.contact_number.length !== 10) {
            alert('Please enter a valid 10-digit contact number.');
            return;
        }

        if (fileError) {
            alert(fileError);
            return;
        }

        setIsSubmitting(true);


        try {
            const response = await api.post('/crm/applications/internship', formData);

            if (response.status === 201 || response.status === 200) {
                alert('Internship application submitted successfully!');
                router.push('/workspace/crm');
            }
        } catch (err: any) {
            console.error('Internship Submission Error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit application.';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'subcategories') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 crm-theme">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <button
                            onClick={() => router.push('/workspace/crm')}
                            className="mb-6 inline-flex items-center text-[#409891] hover:underline font-medium"
                        >
                            ← Back to CRM
                        </button>
                        <h1 className="text-4xl font-bold text-slate-800">Internship Applicants</h1>
                        <p className="mt-4 text-lg text-slate-600">Choose the category that best describes you.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {internshipSubCategories.map((sub, idx) => (
                            <div
                                key={sub.id}
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, category: sub.label }));
                                    setView('form');
                                }}
                                className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hero-fade-in"
                                style={{ animationDelay: `${0.1 * idx}s` }}
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${sub.image})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                                    <div className="mb-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl group-hover:bg-white/30 transition-colors">
                                        {sub.icon}
                                    </div>
                                    <h3 className="text-xl font-bold">{sub.label}</h3>
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
                <button
                    onClick={() => setView('subcategories')}
                    className="mb-8 flex items-center text-[#409891] hover:underline font-medium"
                >
                    ← Back to Internship Categories
                </button>

                <div className="bg-white rounded-3xl shadow-xl shadow-[#409891]/5 overflow-hidden border border-slate-100">
                    <div className="bg-[#409891] px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold">Internship Application Form</h1>
                        <p className="mt-2 opacity-90"><span className="font-semibold underline">Selected Category:</span> {formData.category}</p>
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
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    placeholder="Enter your full name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Number *</label>
                                <input
                                    type="text"
                                    name="registration_number"
                                    placeholder="Enter registration number"
                                    value={formData.registration_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="md:col-span-1">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number *</label>
                                <input
                                    type="tel"
                                    name="contact_number"
                                    placeholder="Enter 10-digit contact number"
                                    value={formData.contact_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                    pattern="\d{10}"
                                    title="Contact number must be exactly 10 digits"
                                />

                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">D.O.B *</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Age *</label>
                                <input
                                    type="text"
                                    name="age"
                                    value={formData.age}
                                    placeholder="Auto-calculated from DOB"
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group *</label>
                                <input
                                    type="text"
                                    name="blood_group"
                                    placeholder="e.g., O+, A+, B+"
                                    value={formData.blood_group}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white"
                                    required
                                >
                                    <option value="">Select an option</option>
                                    {genderOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">College / Institution Name *</label>
                                <input
                                    type="text"
                                    name="college_institution_name"
                                    placeholder="Enter college or institution name"
                                    value={formData.college_institution_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Type *</label>
                                <select
                                    name="course_type"
                                    value={formData.course_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white"
                                    required
                                >
                                    <option value="">Select an option</option>
                                    {courseTypeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Department *</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white"
                                    required
                                >
                                    <option value="">Select an option</option>
                                    {departmentOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Internship Domain *</label>
                                <select
                                    name="internship_domain"
                                    value={formData.internship_domain}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white"
                                    required
                                >
                                    <option value="">Select an option</option>
                                    {internshipDomainOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Duration *</label>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white"
                                    required
                                >
                                    <option value="">Select an option</option>
                                    {durationOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload File (Resume / ID / Letter)</label>
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
