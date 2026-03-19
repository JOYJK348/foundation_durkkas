'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import '../crm.css';

const subCategories = [
    {
        id: 'student-career-counselling',
        title: 'Student Career Counselling',
        description: 'Personalized 1:1 guidance to help you discover your potential and choose the right academic or career path.',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&q=80',
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        )
    },
    {
        id: 'suitability-test',
        title: 'Suitability Test',
        description: 'Advanced psychometric and aptitude assessments to identify your core strengths and suggest matching career options.',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&q=80',
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        )
    },
    {
        id: 'study-abroad-guidance',
        title: 'Study Abroad Guidance',
        description: 'Global mentoring for university selection, application processes, and roadmap for international academic success.',
        image: 'https://images.unsplash.com/photo-1523240715632-d984bb4b990a?w=1000&q=80',
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
        )
    },
    {
        id: 'fifteen-years-career-roadmap',
        title: '15 Years Career Roadmap',
        description: 'A comprehensive, long-term strategic plan designed to guide your professional growth over the next 15 years.',
        image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1000&q=80',
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
        )
    },
];

const roadmapStatusOptions = [
    'School Student Career Guidance Form',
    'College Student Career & Future Planning Form',
    'Working Professional Career Strategy Form'
];

export default function CareerGuidancePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cid = searchParams.get('cid'); // Extract company ID from URL
    const [view, setView] = useState('subcategories');
    const [selectedId, setSelectedId] = useState('');
    const [roadmapStatus, setRoadmapStatus] = useState('');
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        categoryname: '',
        student_name: '',
        candidate_name: '',
        age: '',
        email: '',
        contact_number: '',
        standard_year: '',
        education_level: '',
        institution_name: '',
        pincode: '',
        city: '',
        current_stream: '',
        last_exam_result: '',
        favorite_subject: '',
        struggle_subject: '',
        well_performing_subjects: '',
        enjoyed_activities: '',
        prefer_working_with: '',
        solve_problems_logically: '',
        enjoy_creative_tasks: '',
        test_reason: '',
        comfortable_with_assessments: '',
        career_goal: '',
        session_expectations: '',
        counselling_mode: '',
        preferred_language: '',
        remarks_notes: '',

        // Roadmap Common
        required_guidance: [] as string[],

        // Professional specific fields
        job_role: '',
        industry: '',
        work_experience: '',
        core_skills: '',
        certifications: '',
        job_satisfaction: '',
        reason_for_guidance: '',
        career_switch_2y: '',
        willingness_to_upskill: '',
        long_term_mentoring_interest: '',
        specific_challenge: '',

        // School specific
        parent_guardian_name: '',
        parent_contact_number: '',
        current_board: '',
        subjects_currently_studied: '',
        career_idea: '',
        biggest_confusion: '',
        parent_concern: '',

        // College specific
        degree_course: '',
        current_year_semester: '',
        major_specialization: '',
        current_cgpa: '',
        key_skills: '',
        current_career_intention: '',
        satisfied_with_course: '',
        preferred_future_path: '',
        planning_study_abroad: '',
        target_country: '',
        open_to_mentoring: '',

        // Study Abroad Specific
        current_qualification: '',
        highest_qualification_completed: '',
        academic_score_gpa: '',
        medium_of_instruction: '',
        other_medium: '',
        preferred_country: '',
        intended_level_of_study: '',
        preferred_course: '',
        english_test_status: '',
        target_intake_year: '',
        budget_range: '',

        company_id: cid ? parseInt(cid) : 11,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (value: string) => {
        setFormData(prev => {
            const current = prev.required_guidance || [];
            if (current.includes(value)) {
                return { ...prev, required_guidance: current.filter(item => item !== value) };
            }
            return { ...prev, required_guidance: [...current, value] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const submissionData = { ...formData };
        if (selectedId === 'fifteen-years-career-roadmap') {
            submissionData.categoryname = `15Y Roadmap - ${roadmapStatus}`;
        }

        try {
            const response = await api.post('/crm/applications/career-guidance', submissionData);
            if (response.status === 201 || response.status === 200) {
                alert('Application submitted successfully!');
                router.push('/crm/workspace');
            }
        } catch (error: any) {
            alert('Failed to submit application: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'subcategories') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 crm-theme">
                <div className="max-w-6xl mx-auto text-center font-sans">
                    <button onClick={() => router.push('/crm/workspace')} className="mb-6 inline-flex items-center text-[#409891] hover:underline font-medium">← Back to CRM</button>
                    <h1 className="text-4xl font-bold text-slate-800">Career Guidance</h1>
                    <p className="mt-4 text-lg text-slate-600 mb-12">Discover your potential with our specialized guidance programs.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {subCategories.map((sub, idx) => (
                            <div key={sub.id} onClick={() => { setFormData(prev => ({ ...prev, categoryname: sub.title })); setSelectedId(sub.id); setView('form'); }} className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hero-fade-in" style={{ animationDelay: `${0.1 * idx}s` }}>
                                <Image src={sub.image} alt={sub.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                                    <div className="mb-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl group-hover:bg-white/30 transition-colors">{sub.icon}</div>
                                    <h3 className="text-lg font-bold">{sub.title}</h3>
                                    <p className="mt-2 text-xs text-white/70 line-clamp-2">{sub.description}</p>
                                    <p className="mt-4 text-xs font-semibold text-[#409891]/90 bg-white/90 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Select Guidance →</p>
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
            <div className="max-w-4xl mx-auto font-sans">
                <button onClick={() => { setView('subcategories'); setRoadmapStatus(''); }} className="mb-8 flex items-center text-[#409891] hover:underline font-medium">← Back to Categories</button>
                <div className="bg-white rounded-3xl shadow-xl shadow-[#409891]/5 overflow-hidden border border-slate-100">
                    <div className="bg-[#409891] px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold">Career Guidance Application Form</h1>
                        <p className="mt-2 opacity-90">Please fill in all required fields to submit your career guidance application.</p>
                        <p className="mt-1 opacity-90"><span className="font-semibold underline">Selected Category:</span> {formData.categoryname}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
                        {/* Status Selection for 15Y Roadmap */}
                        {selectedId === 'fifteen-years-career-roadmap' && (
                            <div className="space-y-6 hero-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Please Select Your Current Status *</label>
                                    <select required value={roadmapStatus} onChange={(e) => setRoadmapStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px] focus:ring-2 focus:ring-[#409891]/20 outline-none">
                                        <option value="">Select an option</option>
                                        {roadmapStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <p className="mt-2 text-xs text-slate-500 italic">Select the option that best describes your current stage to see the appropriate form.</p>
                                </div>
                            </div>
                        )}

                        {/* Date Field */}
                        {(!selectedId.includes('roadmap') || roadmapStatus) && (
                            <div className="max-w-xs">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                                <input type="text" value={formData.date} readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed outline-none" />
                            </div>
                        )}

                        {/* -------------------- WORKING PROFESSIONAL ROADMAP FORM -------------------- */}
                        {selectedId === 'fifteen-years-career-roadmap' && roadmapStatus === 'Working Professional Career Strategy Form' && (
                            <div className="space-y-8 hero-fade-in">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                    <p className="text-sm font-bold text-emerald-800">Working Professional Career Strategy Form</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label><input type="text" name="student_name" required placeholder="Full Name" value={formData.student_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Age *</label><input type="number" name="age" required placeholder="Age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Current Job Role *</label><input type="text" name="job_role" required placeholder="Current Job Role" value={formData.job_role} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Industry / Sector *</label><input type="text" name="industry" required placeholder="Industry / Sector" value={formData.industry} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Total Work Experience *</label><input type="text" name="work_experience" required placeholder="e.g. 5 Years" value={formData.work_experience} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Pincode *</label><input type="text" name="pincode" required pattern="\d{6}" placeholder="6 digit pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">City / District *</label><input type="text" name="city" required placeholder="Enter city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number *</label><input type="tel" name="contact_number" required placeholder="Contact Number" value={formData.contact_number} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Core skills used in your current job *</label><textarea name="core_skills" required rows={2} placeholder="Core skills..." value={formData.core_skills} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Certifications / Training completed</label><input type="text" name="certifications" placeholder="Certifications..." value={formData.certifications} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Job satisfaction level (1–5) *</label>
                                    <div className="flex gap-4">
                                        {[1, 2, 3, 4, 5].map(level => (
                                            <label key={level} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${formData.job_satisfaction === String(level) ? 'bg-[#409891] border-[#409891] text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                                <input type="radio" name="job_satisfaction" required value={level} checked={formData.job_satisfaction === String(level)} onChange={handleChange} className="hidden" />
                                                <span className="text-lg font-bold">{level}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">What kind of support are you looking for? (Select all that apply) *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {['Career Counselling', 'Suitability Test (Career Switch)', 'Study Abroad (Higher Studies / Migration)', '15-Years Career Roadmap'].map(option => (
                                            <label key={option} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                                <input type="checkbox" checked={formData.required_guidance.includes(option)} onChange={() => handleCheckboxChange(option)} className="w-4 h-4 accent-[#409891]" />
                                                <span className="text-sm text-slate-600">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Primary reason for seeking guidance *</label>
                                        <select name="reason_for_guidance" required value={formData.reason_for_guidance} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="growth stagnation">growth stagnation</option>
                                            <option value="career Change">career Change</option>
                                            <option value="salary improvment">salary improvment</option>
                                            <option value="work life balance">work life balance</option>
                                            <option value="long term balance">long term balance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Are you planning a career switch within the next 2 years? *</label>
                                        <select name="career_switch_2y" required value={formData.career_switch_2y} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="yes">yes</option>
                                            <option value="no">no</option>
                                            <option value="sure">sure</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Willingness to upskill continuously *</label>
                                        <select name="willingness_to_upskill" required value={formData.willingness_to_upskill} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="yes">yes</option>
                                            <option value="no">no</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Interest in long-term mentoring *</label>
                                        <select name="long_term_mentoring_interest" required value={formData.long_term_mentoring_interest} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="yes">yes</option>
                                            <option value="no">no</option>
                                        </select>
                                    </div>
                                </div>

                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Any specific challenge the counsellor should know about?</label><textarea name="specific_challenge" rows={3} placeholder="Describe any challenges..." value={formData.specific_challenge} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                            </div>
                        )}

                        {/* -------------------- SCHOOL STUDENT ROADMAP FORM -------------------- */}
                        {selectedId === 'fifteen-years-career-roadmap' && (roadmapStatus === 'School Student Career Guidance Form' || roadmapStatus === 'School Student Career guidance Form') && (
                            <div className="space-y-8 hero-fade-in">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                    <p className="text-sm font-bold text-emerald-800">School Student Career Guidance Form</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Student Name *</label><input type="text" name="student_name" required placeholder="Enter student name" value={formData.student_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Age *</label><input type="number" name="age" required placeholder="Age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Current Class *</label>
                                        <select name="standard_year" required value={formData.standard_year} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            {['8th Standard', '9th Standard', '10th Standard', '11th Standard', '12th Standard'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">School Name *</label><input type="text" name="institution_name" required placeholder="Enter School Name" value={formData.institution_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Pincode *</label><input type="text" name="pincode" required pattern="\d{6}" placeholder="6 digit pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">City / District *</label><input type="text" name="city" required placeholder="Enter city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Parent / Guardian Name *</label><input type="text" name="parent_guardian_name" required placeholder="Parent Name" value={formData.parent_guardian_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Parent Contact Number *</label><input type="tel" name="parent_contact_number" required placeholder="Contact Number" value={formData.parent_contact_number} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Current Board / Syllabus *</label>
                                        <select name="current_board" required value={formData.current_board} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="State Board">State Board</option>
                                            <option value="CBSE">CBSE</option>
                                            <option value="ICSE">ICSE</option>
                                            <option value="IB">IB</option>
                                            <option value="IGCSE">IGCSE</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Last Exam Result (%) *</label><input type="text" name="last_exam_result" required placeholder="e.g. 90%" value={formData.last_exam_result} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Subjects Currently Studied *</label><input type="text" name="subjects_currently_studied" required placeholder="e.g. Maths, Science, English" value={formData.subjects_currently_studied} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Favourite Subject *</label>
                                        <select name="favorite_subject" required value={formData.favorite_subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            {['Mathematics', 'Science', 'Social Science', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Commerce', 'Accountancy', 'English', 'History / Geography', 'Others'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Most Difficult Subject *</label>
                                        <select name="struggle_subject" required value={formData.struggle_subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            {['Mathematics', 'Science', 'Social Science', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Commerce', 'Accountancy', 'English', 'History / Geography', 'Others'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">What support are you looking for? (Select all that apply) *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {['Student Career Counselling', 'Suitability Test', 'Study Abroad Guidance', '15-Years Career Roadmap'].map(option => (
                                            <label key={option} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                                <input type="checkbox" checked={formData.required_guidance.includes(option)} onChange={() => handleCheckboxChange(option)} className="w-4 h-4 accent-[#409891]" />
                                                <span className="text-sm text-slate-600">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Do you already have a career idea? *</label>
                                        <select name="career_idea" required value={formData.career_idea} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select</option>
                                            <option value="yes">yes</option>
                                            <option value="no">no</option>
                                            <option value="not sure">not sure</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Biggest confusion right now *</label>
                                        <select name="biggest_confusion" required value={formData.biggest_confusion} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="stream selection">stream selection</option>
                                            <option value="Career options">Career options</option>
                                            <option value="perental Expetations">perental Expetations</option>
                                            <option value="Academic pressure">Academic pressure</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred counselling mode *</label>
                                        <select name="counselling_mode" required value={formData.counselling_mode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]"><option value="">Select an option</option><option value="online">online</option><option value="offline">offline</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred language *</label>
                                        <select name="preferred_language" required value={formData.preferred_language} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]"><option value="">Select an option</option><option value="English">English</option><option value="Tamil">Tamil</option><option value="Hindi">Hindi</option><option value="Others">Others</option></select>
                                    </div>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Any concern the parent wants the counsellor to know?</label><textarea name="parent_concern" rows={2} placeholder="Concerns..." value={formData.parent_concern} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                            </div>
                        )}

                        {/* -------------------- COLLEGE STUDENT ROADMAP FORM -------------------- */}
                        {selectedId === 'fifteen-years-career-roadmap' && roadmapStatus === 'College Student Career & Future Planning Form' && (
                            <div className="space-y-8 hero-fade-in">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                    <p className="text-sm font-bold text-emerald-800">College Student Career & Future Planning Form</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label><input type="text" name="student_name" required placeholder="Full Name" value={formData.student_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Age *</label><input type="number" name="age" required placeholder="Age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Degree / Course *</label><input type="text" name="degree_course" required placeholder="Degree / Course" value={formData.degree_course} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Institution Name *</label><input type="text" name="institution_name" required placeholder="Institution Name" value={formData.institution_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Pincode *</label><input type="text" name="pincode" required pattern="\d{6}" placeholder="6 digit pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">City / District *</label><input type="text" name="city" required placeholder="Enter city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number *</label><input type="tel" name="contact_number" required placeholder="Contact Number" value={formData.contact_number} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Email ID *</label><input type="email" name="email" required placeholder="Email ID" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Current Year / Sem *</label><input type="text" name="current_year_semester" required placeholder="Year/Sem" value={formData.current_year_semester} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Major / Specialization *</label><input type="text" name="major_specialization" required placeholder="Major" value={formData.major_specialization} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Current CGPA / % *</label><input type="text" name="current_cgpa" required placeholder="CGPA" value={formData.current_cgpa} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Key skills developed so far *</label><textarea name="key_skills" required rows={2} placeholder="Skills..." value={formData.key_skills} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">What type of guidance do you need? (Select all that apply) *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {['Student Career Counselling', 'Suitability Test', 'Study Abroad Guidance', '15-Years Career Roadmap'].map(option => (
                                            <label key={option} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                                <input type="checkbox" checked={formData.required_guidance.includes(option)} onChange={() => handleCheckboxChange(option)} className="w-4 h-4 accent-[#409891]" />
                                                <span className="text-sm text-slate-600">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Current career intention (if any)</label><input type="text" name="current_career_intention" placeholder="Career intention" value={formData.current_career_intention} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Are you satisfied with your course? *</label><select name="satisfied_with_course" required value={formData.satisfied_with_course} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]"><option value="">Select</option><option value="yes">Yes</option><option value="no">No</option><option value="somewhat">Somewhat</option></select></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Preferred future path *</label><select name="preferred_future_path" required value={formData.preferred_future_path} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]"><option value="">Select</option><option value="Higher studies">Higher studies</option><option value="Job">Job</option><option value="Entrepreneurship">Entrepreneurship</option></select></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Are you planning to study abroad? *</label><select name="planning_study_abroad" required value={formData.planning_study_abroad} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]"><option value="">Select</option><option value="yes">yes</option><option value="Maybe">Maybe</option><option value="NO">NO</option></select></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Target country (if applicable)</label><input type="text" name="target_country" placeholder="Target country" value={formData.target_country} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Are you open to long-term mentoring? *</label><select name="open_to_mentoring" required value={formData.open_to_mentoring} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]"><option value="">Select</option><option value="yes">yes</option><option value="no">no</option></select></div>
                            </div>
                        )}

                        {/* -------------------- OTHER CORE FORMS -------------------- */}

                        {selectedId === 'student-career-counselling' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">1. Student Name *</label><input type="text" name="student_name" required placeholder="Enter student name" value={formData.student_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">2. Age *</label><input type="number" name="age" required placeholder="Enter age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">3. Current Class / Year *</label><select name="standard_year" required value={formData.standard_year} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]"><option value="">Select an option</option>{['8th Standard', '9th Standard', '10th Standard', '11th Standard', '12th Standard', 'UG - 1st Year', 'UG - 2nd Year', 'UG - 3rd Year', 'UG - Final Year', 'PG - 1st Year', 'PG - Final Year', 'Others'].map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">4. School / College Name *</label><input type="text" name="institution_name" required placeholder="Enter institution name" value={formData.institution_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Pincode *</label><input type="text" name="pincode" required pattern="\d{6}" placeholder="6 digit pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">5. City / District *</label><input type="text" name="city" required placeholder="Enter city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">6. Current Stream / Subjects *</label><input type="text" name="current_stream" required placeholder="e.g. Biology-Maths / CS" value={formData.current_stream} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">7. Last Exam Result (% / Grade) *</label><input type="text" name="last_exam_result" required placeholder="e.g. 85% / A Grade" value={formData.last_exam_result} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">8. Subject you enjoy the most *</label>
                                        <select name="favorite_subject" required value={formData.favorite_subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            {['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Commerce', 'Accountancy', 'English', 'History / Geography', 'Others'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">9. Subject you struggle with *</label>
                                        <select name="struggle_subject" required value={formData.struggle_subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            {['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Commerce', 'Accountancy', 'English', 'History / Geography', 'Others'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">10. Do you have a career goal now? *</label>
                                    <select name="career_goal" required value={formData.career_goal} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                        <option value="">Select an option</option>
                                        <option value="yes">yes</option>
                                        <option value="no">no</option>
                                        <option value="not sure">not sure</option>
                                    </select>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">13. What do you expect from this counselling session? *</label><textarea name="session_expectations" required rows={3} placeholder="Tell us how we can help..." value={formData.session_expectations} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">14. Preferred counselling mode *</label>
                                        <select name="counselling_mode" required value={formData.counselling_mode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="online">online</option>
                                            <option value="offline">offline</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">15. Preferred language *</label>
                                        <select name="preferred_language" required value={formData.preferred_language} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="English">English</option>
                                            <option value="Tamil">Tamil</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedId === 'suitability-test' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">1. Candidate Name *</label><input type="text" name="candidate_name" required placeholder="Enter candidate name" value={formData.candidate_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">2. Age *</label><input type="number" name="age" required placeholder="Enter age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">3. Current Education Level *</label><select name="education_level" required value={formData.education_level} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]"><option value="">Select an option</option>{['Schooling (Below 10th)', 'High School (10th-12th)', 'Diploma', 'Undergraduate (UG)', 'Postgraduate (PG)', 'Working Professional'].map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Pincode *</label><input type="text" name="pincode" required pattern="\d{6}" placeholder="6 digit pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">4. City *</label><input type="text" name="city" required placeholder="Enter city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">5. Subjects you perform well in *</label><input type="text" name="well_performing_subjects" required placeholder="Mention subjects you are good at" value={formData.well_performing_subjects} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">6. Activities you enjoy most *</label>
                                        <select name="enjoyed_activities" required value={formData.enjoyed_activities} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            {['Reading / Writing', 'Sports / Fitness', 'Coding / Tech', 'Art / Design', 'Socializing', 'Music / Dance', 'Volunteering', 'Others'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">7. You prefer working with: *</label>
                                        <select name="prefer_working_with" required value={formData.prefer_working_with} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            {['People', 'Machines / Tools', 'Data / Numbers', 'Ideas / Concepts', 'Nature / Animals'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">8. You enjoy solving problems logically *</label>
                                        <select name="solve_problems_logically" required value={formData.solve_problems_logically} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="Always">Always</option>
                                            <option value="Mostly">Mostly</option>
                                            <option value="Sometimes">Sometimes</option>
                                            <option value="Never">Never</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">9. You enjoy creative tasks *</label>
                                        <select name="enjoy_creative_tasks" required value={formData.enjoy_creative_tasks} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="Always">Always</option>
                                            <option value="Mostly">Mostly</option>
                                            <option value="Sometimes">Sometimes</option>
                                            <option value="Never">Never</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">10. Why are you taking this test? *</label>
                                        <select name="test_reason" required value={formData.test_reason} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="Career Guidance">Career Guidance</option>
                                            <option value="Stream Selection">Stream Selection</option>
                                            <option value="Skill Assessment">Skill Assessment</option>
                                            <option value="Job Change">Job Change</option>
                                            <option value="General Awareness">General Awareness</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">11. Are you comfortable with aptitude assessment? *</label>
                                        <select name="comfortable_with_assessments" required value={formData.comfortable_with_assessments} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                            <option value="Maybe">Maybe</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedId === 'study-abroad-guidance' && (
                            <div className="space-y-8 hero-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">1. Student Name *</label><input type="text" name="student_name" required placeholder="Enter student name" value={formData.student_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">2. Age *</label><input type="number" name="age" required placeholder="Enter age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">3. Current Qualification *</label><input type="text" name="current_qualification" required placeholder="e.g. Final year B.E / 12th Std" value={formData.current_qualification} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">Pincode *</label><input type="text" name="pincode" required pattern="\d{6}" placeholder="6 digit pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">4. City *</label><input type="text" name="city" required placeholder="Enter city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">5. Contact Number *</label><input type="tel" name="contact_number" required placeholder="Enter contact number" value={formData.contact_number} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">6. Highest qualification completed *</label><input type="text" name="highest_qualification_completed" required placeholder="e.g. 12th / Diploma / UG" value={formData.highest_qualification_completed} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">7. Academic score / GPA *</label><input type="text" name="academic_score_gpa" required placeholder="e.g. 8.5 CGPA / 90%" value={formData.academic_score_gpa} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">8. Medium of instruction *</label>
                                        <select name="medium_of_instruction" required value={formData.medium_of_instruction} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="english">english</option>
                                            <option value="others">others</option>
                                        </select>
                                    </div>
                                    {formData.medium_of_instruction === 'others' && (
                                        <div><label className="block text-sm font-semibold text-slate-700 mb-2">Please specify medium *</label><input type="text" name="other_medium" required placeholder="Specify your medium" value={formData.other_medium} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                    )}
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">9. Preferred country / countries *</label><input type="text" name="preferred_country" required placeholder="e.g. Germany, UK, USA" value={formData.preferred_country} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">10. Intended level of study *</label>
                                        <select name="intended_level_of_study" required value={formData.intended_level_of_study} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="UG">UG</option>
                                            <option value="pG">pG</option>
                                            <option value="diploma">diploma</option>
                                        </select>
                                    </div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">11. Preferred course / field *</label><input type="text" name="preferred_course" required placeholder="e.g. MS in Data Science" value={formData.preferred_course} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">12. English test status *</label>
                                        <select name="english_test_status" required value={formData.english_test_status} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-[50px]">
                                            <option value="">Select an option</option>
                                            <option value="taken planning">taken planning</option>
                                            <option value="not yet">not yet</option>
                                        </select>
                                    </div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-2">13. Target intake year *</label><input type="text" name="target_intake_year" required placeholder="e.g. 2025 / 2026" value={formData.target_intake_year} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">14. Budget range (Approx.) *</label><input type="text" name="budget_range" required placeholder="e.g. 20-30 Lakhs" value={formData.budget_range} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#409891]" /></div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {(roadmapStatus || !selectedId.includes('roadmap')) && (
                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#409891] text-white font-black py-4 rounded-xl shadow-lg shadow-[#409891]/20 hover:bg-[#327a75] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50">{isSubmitting ? 'Submitting Application...' : 'Submit Application'}</button>
                                <button type="button" onClick={() => { setView('subcategories'); setRoadmapStatus(''); }} className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
