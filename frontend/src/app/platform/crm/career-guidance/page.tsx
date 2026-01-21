'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import '../crm.css';

const careerGuidanceSubCategories = [
    {
        id: 'student-career-counselling',
        label: 'Student Career Counselling',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
        icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        )
    },
    {
        id: 'suitability-test',
        label: 'Suitability Test',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
        )
    },
    {
        id: 'study-abroad-guidance',
        label: 'Study Abroad Guidance',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
        icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
        )
    },
    {
        id: '15-years-career-roadmap',
        label: '15 Years Career Roadmap',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="#409891" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 9 6 9 12 15 12 15 18 21 18"></polyline>
            </svg>
        )
    }
];

// Suitability Test Options
const educationLevelOptions = [
    { value: 'school', label: 'School Student (9th-10th)' },
    { value: 'higher-secondary', label: 'Higher Secondary (11th-12th)' },
    { value: 'ug', label: 'Undergraduate (UG)' },
    { value: 'pg', label: 'Postgraduate (PG)' },
    { value: 'professional', label: 'Working Professional' }
];

const activityOptions = [
    { value: 'math-logic', label: 'Solving Math/Logic problems' },
    { value: 'reading-writing', label: 'Reading & Creative Writing' },
    { value: 'team-work', label: 'Leading Group Discussions & Team Tasks' },
    { value: 'creative-design', label: 'Drawing, Designing & Digital Art' },
    { value: 'tech-research', label: 'Exploring Tech & Web Research' }
];

const preferenceOptions = [
    { value: 'data', label: 'Data & Numbers' },
    { value: 'people', label: 'People & Social Impact' },
    { value: 'tools', label: 'Tools & Technology' },
    { value: 'ideas', label: 'Creative Concepts & Ideas' }
];

const agreementOptions = [
    { value: 'strongly-agree', label: 'Strongly Agree' },
    { value: 'agree', label: 'Agree' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'disagree', label: 'Disagree' }
];

const testReasonOptions = [
    { value: 'clarity', label: 'Career Clarity & Direction' },
    { value: 'stream-selection', label: 'Stream Selection (10th/12th)' },
    { value: 'skills-assessment', label: 'Skill Gap Assessment' },
    { value: 'future-planning', label: 'Long-term Future Planning' }
];

// Study Abroad Options
const mediumOptions = [
    { value: 'english', label: 'English' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'others', label: 'Others' }
];

const levelOfStudyOptions = [
    { value: 'ug', label: 'Undergraduate (Bachelor\'s)' },
    { value: 'pg', label: 'Postgraduate (Master\'s)' },
    { value: 'phd', label: 'Doctorate (PhD)' },
    { value: 'diploma', label: 'Diploma / PG Diploma' }
];

const englishTestOptions = [
    { value: 'not-taken', label: 'Not Yet Taken' },
    { value: 'booked', label: 'Test Booked' },
    { value: 'completed', label: 'Completed (Result Received)' },
    { value: 'waived', label: 'Seeking Waiver' }
];

// General Form Options
const standardOptions = [
    { value: '9th', label: '9th' },
    { value: '10th', label: '10th' },
    { value: '11th', label: '11th' },
    { value: '12th', label: '12th' },
    { value: 'graduate', label: 'Graduate/Professional' }
];

export default function CareerGuidancePage() {
    const router = useRouter();
    const [view, setView] = useState('subcategories');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], // Use ISO format (YYYY-MM-DD) for database
        category: '',
        candidate_name: '',
        student_name: '', // For general/abroad info
        age: '',
        education_level: '',
        standard_year: '',
        pincode: '',
        city: '',
        location: '',
        contact_number: '',
        email: '',
        parent_guardian_name: '',
        well_performing_subjects: '',
        enjoyed_activities: '',
        prefer_working_with: '',
        solve_problems_logically: '',
        enjoy_creative_tasks: '',
        test_reason: '',
        comfortable_with_assessments: '',
        abroad_local: 'local',
        preferred_country: '',
        preferred_mode_of_study: 'offline',
        career_support_duration: '1-year',
        mentorship_required: 'no',
        remarks_notes: '',
        company_id: 20,
        // Study Abroad Specific
        current_qualification: '',
        highest_qualification_completed: '',
        academic_score_gpa: '',
        medium_of_instruction: '',
        intended_level_of_study: '',
        preferred_course_field: '',
        english_test_status: '',
        target_intake_year: '',
        budget_range: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Clean up data based on category before sending
            const rawData = { ...formData };
            if (selectedCategoryId === 'suitability-test') {
                rawData.student_name = rawData.candidate_name;
            } else if (selectedCategoryId === 'study-abroad-guidance') {
                rawData.candidate_name = rawData.student_name;
                rawData.abroad_local = 'abroad';
            } else {
                rawData.candidate_name = rawData.student_name;
                rawData.city = rawData.location;
            }

            // IMPORTANT: Convert empty strings to null for the database
            const submissionData = Object.fromEntries(
                Object.entries(rawData).map(([key, value]) => [
                    key,
                    value === '' ? null : value
                ])
            );

            // Re-ensure company_id is a number
            submissionData.company_id = Number(submissionData.company_id);

            const response = await api.post('/crm/applications/career-guidance', submissionData);

            if (response.status === 201 || response.status === 200) {
                alert('Application submitted successfully!');
                router.push('/platform/crm');
            }
        } catch (err: any) {
            console.error('Career Guidance Submission Error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit application.';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'subcategories') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 crm-theme">
                <div className="max-w-6xl mx-auto text-center">
                    <button onClick={() => router.push('/platform/crm')} className="mb-6 inline-flex items-center text-[#409891] hover:underline font-medium">← Back to Overview</button>
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Career Guidance</h1>
                    <p className="mt-4 text-lg text-slate-600 mb-12">Empowering your future with expert insights and personalized roadmaps.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {careerGuidanceSubCategories.map((sub, idx) => (
                            <div
                                key={sub.id}
                                onClick={() => {
                                    setSelectedCategoryId(sub.id);
                                    setFormData(p => ({ ...p, category: sub.label }));
                                    setView('form');
                                }}
                                className="group bg-white rounded-3xl p-8 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col items-center text-center translate-y-0 hover:-translate-y-2 hero-fade-in"
                                style={{ animationDelay: `${0.1 * idx}s` }}
                            >
                                <div className="mb-6 p-4 bg-[#409891]/10 rounded-2xl group-hover:bg-[#409891] group-hover:text-white transition-all duration-300">
                                    {sub.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{sub.label}</h3>
                                <p className="text-sm text-slate-500 font-medium group-hover:text-[#409891]">Book Session →</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // FORM RENDER
    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 crm-theme">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => setView('subcategories')} className="mb-8 flex items-center text-[#409891] hover:underline font-medium">← Back to Services</button>

                <div className="bg-white rounded-3xl shadow-xl shadow-[#409891]/5 overflow-hidden border border-slate-100">
                    <div className="bg-[#409891] px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold">Career Guidance Application Form</h1>
                        <p className="mt-2 opacity-90">Please fill in all required fields to submit your career guidance application.</p>
                        <div className="mt-4 flex gap-4">
                            <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-sm">
                                <span className="font-semibold">Selected Category:</span> {formData.category}
                            </div>
                            <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-sm">
                                <span className="font-semibold">Date:</span> {new Date(formData.date).toLocaleDateString('en-GB').split('/').join('-')}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
                        {/* ===================================================
                            SUITABILITY TEST SPECIFIC FORM
                           =================================================== */}
                        {selectedCategoryId === 'suitability-test' ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">1. Candidate Name *</label>
                                        <input type="text" name="candidate_name" value={formData.candidate_name} onChange={handleChange} placeholder="Enter candidate name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">2. Age *</label>
                                        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Enter age" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">3. Current Education Level *</label>
                                    <select name="education_level" value={formData.education_level} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                        <option value="">Select an option</option>
                                        {educationLevelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Pincode *</label>
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6 digit pincode" maxLength={6} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">4. City *</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">5. Subjects you perform well in *</label>
                                    <textarea name="well_performing_subjects" value={formData.well_performing_subjects} onChange={handleChange} placeholder="Mention subjects you are good at" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">6. Activities you enjoy most *</label>
                                    <select name="enjoyed_activities" value={formData.enjoyed_activities} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                        <option value="">Select an option</option>
                                        {activityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">7. You prefer working with: *</label>
                                    <select name="prefer_working_with" value={formData.prefer_working_with} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                        <option value="">Select an option</option>
                                        {preferenceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">8. You enjoy solving problems logically *</label>
                                    <select name="solve_problems_logically" value={formData.solve_problems_logically} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                        <option value="">Select an option</option>
                                        {agreementOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">9. You enjoy creative tasks *</label>
                                    <select name="enjoy_creative_tasks" value={formData.enjoy_creative_tasks} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                        <option value="">Select an option</option>
                                        {agreementOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">10. Why are you taking this test? *</label>
                                    <select name="test_reason" value={formData.test_reason} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                        <option value="">Select an option</option>
                                        {testReasonOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">11. Are you comfortable with aptitude & psychometric assessment? *</label>
                                    <select name="comfortable_with_assessments" value={formData.comfortable_with_assessments} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                        <option value="">Select an option</option>
                                        <option value="yes">Yes, definitely</option>
                                        <option value="no">No, I'm nervous</option>
                                        <option value="maybe">Need to know more</option>
                                    </select>
                                </div>
                            </>
                        ) : selectedCategoryId === 'study-abroad-guidance' ? (
                            /* ===================================================
                                STUDY ABROAD GUIDANCE SPECIFIC FORM
                               =================================================== */
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">1. Student Name *</label>
                                        <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} placeholder="Enter student name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">2. Age *</label>
                                        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Enter age" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">3. Current Qualification *</label>
                                        <input type="text" name="current_qualification" value={formData.current_qualification} onChange={handleChange} placeholder="e.g. Final year B.E / 12th Std" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Pincode *</label>
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6 digit pincode" maxLength={6} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">4. City *</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">5. Contact Number *</label>
                                        <input type="tel" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="Enter contact number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">6. Highest qualification completed *</label>
                                        <input type="text" name="highest_qualification_completed" value={formData.highest_qualification_completed} onChange={handleChange} placeholder="e.g. 12th / Diploma / UG" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">7. Academic score / GPA *</label>
                                        <input type="text" name="academic_score_gpa" value={formData.academic_score_gpa} onChange={handleChange} placeholder="e.g. 8.5 CGPA / 90%" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">8. Medium of instruction *</label>
                                    <select name="medium_of_instruction" value={formData.medium_of_instruction} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                        <option value="">Select an option</option>
                                        {mediumOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">9. Preferred country / countries *</label>
                                        <input type="text" name="preferred_country" value={formData.preferred_country} onChange={handleChange} placeholder="e.g. Germany, UK, USA" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">10. Intended level of study *</label>
                                        <select name="intended_level_of_study" value={formData.intended_level_of_study} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                            <option value="">Select an option</option>
                                            {levelOfStudyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">11. Preferred course / field *</label>
                                        <input type="text" name="preferred_course_field" value={formData.preferred_course_field} onChange={handleChange} placeholder="e.g. MS in Data Science" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">12. English test status *</label>
                                        <select name="english_test_status" value={formData.english_test_status} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                            <option value="">Select an option</option>
                                            {englishTestOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">13. Target intake year *</label>
                                        <input type="text" name="target_intake_year" value={formData.target_intake_year} onChange={handleChange} placeholder="e.g. 2025 / 2026" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">14. Budget range (Approx.) *</label>
                                        <input type="text" name="budget_range" value={formData.budget_range} onChange={handleChange} placeholder="e.g. 20-30 Lakhs" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* ===================================================
                               GENERAL BOOKING FORM (For other categories)
                               =================================================== */
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Student Name *</label>
                                        <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Parent / Guardian Name *</label>
                                        <input type="text" name="parent_guardian_name" value={formData.parent_guardian_name} onChange={handleChange} placeholder="Guardian's name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number *</label>
                                        <input type="tel" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="10-digit number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Standard/Year *</label>
                                        <select name="standard_year" value={formData.standard_year} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all bg-white" required>
                                            <option value="">Select</option>
                                            {standardOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Age *</label>
                                        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">City/Location *</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Study Preference</label>
                                        <select name="abroad_local" value={formData.abroad_local} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all bg-white">
                                            <option value="local">Local (India)</option>
                                            <option value="abroad">Abroad</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Mode of Study</label>
                                        <select name="preferred_mode_of_study" value={formData.preferred_mode_of_study} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all bg-white">
                                            <option value="offline">Offline/Classroom</option>
                                            <option value="online">Online</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Remarks / Special Requirements</label>
                                    <textarea name="remarks_notes" value={formData.remarks_notes} onChange={handleChange} placeholder="Tell us about your requirements..." rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#409891]/20 focus:border-[#409891] outline-none transition-all" />
                                </div>
                            </>
                        )}

                        <div className="flex gap-4 pt-6">
                            <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#409891] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#409891]/20 hover:bg-[#327a75] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50">
                                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                            </button>
                            <button type="button" onClick={() => setView('subcategories')} className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
