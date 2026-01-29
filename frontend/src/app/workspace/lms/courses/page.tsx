"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Search, BookOpen, MoreVertical, X, Loader2 } from 'lucide-react';
import { emsService } from '@/services/emsService';
import { toast } from 'sonner';

interface Course {
    id: number;
    name: string;
    code: string;
    description: string;
    category?: string;
    level?: string;
    duration_weeks?: number;
    fee?: number;
    is_active?: boolean;
}

export default function LmsCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [newCourse, setNewCourse] = useState({
        name: '',
        code: '',
        description: '',
        category: 'Technology',
        level: 'BEGINNER',
        duration_weeks: 12,
        fee: 0
    });

    const fetchCourses = async () => {
        try {
            const data = await emsService.getCourses();
            setCourses(data.data || []);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await emsService.createCourse(newCourse);
            toast.success("Course created successfully!");
            setIsCreateModalOpen(false);
            fetchCourses(); // Refresh list
            setNewCourse({ name: '', code: '', description: '', category: 'Technology', level: 'BEGINNER', duration_weeks: 12, fee: 0 }); // Reset
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create course");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
                    <p className="text-sm text-slate-500">Manage your academy curriculum and content.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-12 px-6 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    Create New Course
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search courses by name or code..."
                        className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
                <select className="h-12 px-6 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-600">
                    <option>All Categories</option>
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Arts & Design</option>
                </select>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                {/* Create New Card (Always Visible) */}
                <div
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                >
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <Plus size={32} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">New Course</h4>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Ready to teach something new?</p>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="col-span-1 md:col-span-2 flex items-center justify-center h-[400px]">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                )}

                {/* Real Data Rendering */}
                {!isLoading && courses.map((course) => (
                    <div key={course.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all hover:translate-y-[-4px]">
                        <div className="h-48 bg-slate-100 relative">
                            {/* Random Gradient based on ID */}
                            <div className={`absolute inset-0 bg-gradient-to-tr ${course.id % 2 === 0 ? 'from-blue-600 to-purple-600' : 'from-emerald-500 to-teal-700'}`} />
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                                    {course.category || 'General'}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                                <span className="text-white text-xs font-bold bg-black/20 backdrop-blur-md px-2 py-1 rounded-md">
                                    {course.code || `CRS-${course.id}`}
                                </span>
                                <span className="text-white text-xs font-bold">
                                    {course.level}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
                                    {course.name}
                                </h3>
                                <button className="text-slate-400 hover:text-slate-600">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8">
                                {course.description || "No description provided."}
                            </p>
                            <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                                <div className="flex items-center gap-1 text-slate-600">
                                    <BookOpen size={14} />
                                    <span className="text-xs font-bold">{course.duration_weeks} Weeks</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">
                                    {course.fee ? `₹${course.fee.toLocaleString()}` : 'Free'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Create New Course</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Name</label>
                                <input
                                    required
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                    placeholder="e.g. Advanced React Patterns"
                                    value={newCourse.name}
                                    onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Code</label>
                                    <input
                                        required
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        placeholder="e.g. REACT-101"
                                        value={newCourse.code}
                                        onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                    <select
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium bg-white"
                                        value={newCourse.category}
                                        onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                                    >
                                        <option>Technology</option>
                                        <option>Business</option>
                                        <option>Design</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                <textarea
                                    className="w-full h-24 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none"
                                    placeholder="Brief overview of what students will learn..."
                                    value={newCourse.description}
                                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fee (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        placeholder="0"
                                        value={newCourse.fee}
                                        onChange={e => setNewCourse({ ...newCourse, fee: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Weeks)</label>
                                    <input
                                        type="number"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={newCourse.duration_weeks}
                                        onChange={e => setNewCourse({ ...newCourse, duration_weeks: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Create Course"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
