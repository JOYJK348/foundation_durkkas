"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, UserPlus, Loader2, X } from 'lucide-react';
import { emsService } from '@/services/emsService';
import { toast } from 'sonner';

interface Batch {
    id: number;
    name: string;
    course_id?: number | null;
    start_date?: string;
    end_date?: string;
    description?: string | null;
    max_students?: number;
    status: string;
}

export default function LmsBatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);

    // Form State
    const [newBatch, setNewBatch] = useState({
        name: '',
        course_id: '',
        start_date: '',
        end_date: '',
        max_students: 30,
        status: 'UPCOMING'
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [batchData, courseData] = await Promise.all([
                emsService.getBatches(),
                emsService.getCourses()
            ]);
            setBatches(batchData.data || []);
            setCourses(courseData.data || []);
        } catch (error) {
            console.error("Failed to fetch batches", error);
            // toast.error("Failed to load batches"); // Avoid hydration toast
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...newBatch,
                course_id: newBatch.course_id ? Number(newBatch.course_id) : null
            };
            await emsService.createBatch(payload);
            toast.success("Batch created successfully!");
            setIsCreateModalOpen(false);
            fetchData(); // Refresh list
            setNewBatch({ name: '', course_id: '', start_date: '', end_date: '', max_students: 30, status: 'UPCOMING' }); // Reset
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create batch");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCourseName = (id?: number | null) => {
        if (!id) return "General";
        return courses.find(c => c.id === id)?.name || "Unknown Course";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Batches & Schedule</h1>
                    <p className="text-sm text-slate-500">Manage time slots and batch allocation.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-12 px-6 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    Create New Batch
                </button>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-primary w-10 h-10" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pt-4">
                    {/* Create New Card */}
                    <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-100 hover:border-primary/30 transition-all cursor-pointer group min-h-[250px]"
                    >
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-primary">
                            <Plus size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Add New Batch</h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Schedule a session</p>
                    </div>

                    {/* Batch Cards */}
                    {batches.map((batch) => (
                        <div key={batch.id} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                                    <Calendar size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${batch.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {batch.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">{batch.name}</h3>
                            <p className="text-sm text-primary font-bold mb-6">{getCourseName(batch.course_id)}</p>

                            <div className="space-y-4 border-t border-slate-50 pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock size={16} />
                                        <span className="text-xs font-semibold uppercase tracking-widest">Start Date</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'TBD'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <UserPlus size={16} />
                                        <span className="text-xs font-semibold uppercase tracking-widest">Capacity</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">0 / {batch.max_students}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Create New Batch</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBatch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batch Name</label>
                                <input
                                    required
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                    placeholder="e.g. Morning Batch B1"
                                    value={newBatch.name}
                                    onChange={e => setNewBatch({ ...newBatch, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Course</label>
                                <select
                                    required
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium bg-white"
                                    value={newBatch.course_id}
                                    onChange={e => setNewBatch({ ...newBatch, course_id: e.target.value })}
                                >
                                    <option value="">-- Select a Course --</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={newBatch.start_date}
                                        onChange={e => setNewBatch({ ...newBatch, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={newBatch.end_date}
                                        onChange={e => setNewBatch({ ...newBatch, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Students</label>
                                    <input
                                        type="number"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={newBatch.max_students}
                                        onChange={e => setNewBatch({ ...newBatch, max_students: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                    <select
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium bg-white"
                                        value={newBatch.status}
                                        onChange={e => setNewBatch({ ...newBatch, status: e.target.value })}
                                    >
                                        <option value="UPCOMING">Upcoming</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Create Batch"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
