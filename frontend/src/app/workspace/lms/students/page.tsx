"use client";

import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Filter, Download, CheckCircle, XCircle, MoreHorizontal, Loader2, X } from 'lucide-react';
import { emsService } from '@/services/emsService';
import { toast } from 'sonner';

export default function LmsStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [newStudent, setNewStudent] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: 'Male',
        date_of_birth: '',
        course_id: '',
        batch_id: '',
        admission_date: new Date().toISOString().split('T')[0],
        status: 'Active'
    });

    const fetchData = async () => {
        try {
            const [studentData, courseData, batchData] = await Promise.all([
                emsService.getAllStudents(),
                emsService.getCourses(),
                emsService.getBatches()
            ]);
            setStudents(studentData.data || []);
            setCourses(courseData.data || []);
            setBatches(batchData.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdmission = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...newStudent,
                course_id: newStudent.course_id ? Number(newStudent.course_id) : null,
                batch_id: newStudent.batch_id ? Number(newStudent.batch_id) : null
            };
            await emsService.createStudent(payload);
            toast.success("Student admitted successfully!");
            setIsAdmissionModalOpen(false);
            fetchData();
            setNewStudent({
                first_name: '', last_name: '', email: '', phone: '', gender: 'Male',
                date_of_birth: '', course_id: '', batch_id: '',
                admission_date: new Date().toISOString().split('T')[0], status: 'Active'
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to admit student");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCourseName = (id: number) => courses.find(c => c.id === id)?.name || '-';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
                    <p className="text-sm text-slate-500">Manage student admissions and academic profiles.</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-12 px-5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <Download size={18} /> Export
                    </button>
                    <button
                        onClick={() => setIsAdmissionModalOpen(true)}
                        className="h-12 px-6 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <UserPlus size={20} />
                        New Admission
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by student name or code..."
                        className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
                <button className="h-12 px-5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm min-h-[300px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-primary w-8 h-8" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course / Batch</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-slate-500 text-sm">No students found. Add a new admission.</td>
                                    </tr>
                                ) : students.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-primary text-xs uppercase">
                                                    {(student.first_name?.[0] || '') + (student.last_name?.[0] || '')}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{student.first_name} {student.last_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{student.admission_number || student.code || `#${student.id}`}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-semibold text-slate-600">{student.email}</p>
                                            <p className="text-xs text-slate-400">{student.phone}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-primary">{getCourseName(student.course_id)}</p>
                                            <p className="text-xs text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">
                                                {student.batch_id ? `Batch #${student.batch_id}` : 'No Batch'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${student.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {student.status === 'Active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {student.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ADMISSION MODAL */}
            {isAdmissionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">New Student Admission</h2>
                            <button onClick={() => setIsAdmissionModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleAdmission} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                                    <input required className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={newStudent.first_name} onChange={e => setNewStudent({ ...newStudent, first_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                                    <input required className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={newStudent.last_name} onChange={e => setNewStudent({ ...newStudent, last_name: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                    <input type="email" required className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                                    <input type="tel" required className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={newStudent.phone} onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                                    <input type="date" required className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={newStudent.date_of_birth} onChange={e => setNewStudent({ ...newStudent, date_of_birth: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                                    <select className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium bg-white"
                                        value={newStudent.gender} onChange={e => setNewStudent({ ...newStudent, gender: e.target.value })}>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                                <h3 className="text-sm font-bold text-slate-900">Academic Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Course</label>
                                        <select className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium bg-white"
                                            value={newStudent.course_id} onChange={e => setNewStudent({ ...newStudent, course_id: e.target.value })}>
                                            <option value="">-- Select Course --</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Batch</label>
                                        <select className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium bg-white"
                                            value={newStudent.batch_id} onChange={e => setNewStudent({ ...newStudent, batch_id: e.target.value })}>
                                            <option value="">-- Select Batch --</option>
                                            {batches.filter(b => !newStudent.course_id || String(b.course_id) === String(newStudent.course_id)).map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Complete Admission"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
