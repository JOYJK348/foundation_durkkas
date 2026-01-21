'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import '../crm.css';

const businessTypeOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'services', label: 'Services' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'others', label: 'Others' }
];

const modeOfBusinessOptions = [
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'co-worker', label: 'Co-Worker' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'others', label: 'Others' }
];

export default function B2BPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        contact_person_name: '',
        organization_name: '',
        organization_address: '',
        business_type: '',
        business_type_others: '',
        mode_of_business: '',
        mode_of_business_others: '',
        company_website_email: '',
        remarks: '',
        company_id: 20,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const submissionData = {
                ...formData,
                business_type: formData.business_type === 'others'
                    ? `Others: ${formData.business_type_others}`
                    : formData.business_type,
                mode_of_business: formData.mode_of_business === 'others'
                    ? `Others: ${formData.mode_of_business_others}`
                    : formData.mode_of_business
            };

            const response = await api.post('/crm/applications/b2b', submissionData);

            if (response.status === 201 || response.status === 200) {
                alert('B2B Application submitted successfully!');
                router.push('/platform/crm');
            }
        } catch (err: any) {
            console.error('B2B Submission Error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit application.';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 crm-theme">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center text-[#409891] hover:underline font-medium"
                >
                    ← Back to Categories
                </button>

                <div className="bg-white rounded-3xl shadow-xl shadow-[#409891]/5 overflow-hidden border border-slate-100">
                    <div className="bg-[#409891] px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold">B2B Application</h1>
                        <p className="mt-2 opacity-90">Register your organization for business-to-business opportunities.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Application Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Person Name</label>
                                <input
                                    type="text"
                                    name="contact_person_name"
                                    placeholder="Enter full name"
                                    value={formData.contact_person_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Organization Name</label>
                                <input
                                    type="text"
                                    name="organization_name"
                                    placeholder="E.g. Lead Centre Partners"
                                    value={formData.organization_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Website / Email</label>
                                <input
                                    type="text"
                                    name="company_website_email"
                                    placeholder="www.company.com or email@org.com"
                                    value={formData.company_website_email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Organization Address</label>
                            <textarea
                                name="organization_address"
                                placeholder="Full office address"
                                value={formData.organization_address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                required
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Type</label>
                                <select
                                    name="business_type"
                                    value={formData.business_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {businessTypeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {formData.business_type === 'others' && (
                                    <input
                                        type="text"
                                        name="business_type_others"
                                        placeholder="Specify business type"
                                        value={formData.business_type_others}
                                        onChange={handleChange}
                                        className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                        required
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Mode of Business</label>
                                <select
                                    name="mode_of_business"
                                    value={formData.mode_of_business}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white"
                                    required
                                >
                                    <option value="">Select Mode</option>
                                    {modeOfBusinessOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {formData.mode_of_business === 'others' && (
                                    <input
                                        type="text"
                                        name="mode_of_business_others"
                                        placeholder="Specify mode of business"
                                        value={formData.mode_of_business_others}
                                        onChange={handleChange}
                                        className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Remarks</label>
                            <textarea
                                name="remarks"
                                placeholder="Briefly describe your business requirements..."
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all"
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#409891] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#409891]/20 hover:bg-[#327a75] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting Application...' : 'Submit B2B Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
