"use client";

import React from 'react';
import { LucideSearch, LucideUserPlus, LucideFilter, LucideDownload, LucideCheckCircle, LucideXCircle, LucideMoreHorizontal } from 'lucide-react';

export default function StudentManagement() {
    const students = [
        { id: '1', name: 'Rajesh Kumar Sharma', code: 'DIPL2026001', course: 'Full Stack Web Dev', joinDate: 'Jan 15, 2026', status: 'Active' },
        { id: '2', name: 'Priya Mani', code: 'DIPL2026042', course: 'UI/UX Design', joinDate: 'Jan 20, 2026', status: 'Active' },
        { id: '3', name: 'Arun V.', code: 'DIPL2026085', course: 'Digital Marketing', joinDate: 'Jan 10, 2026', status: 'Inactive' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
                    <p className="text-sm text-slate-500">Manage student admissions and academic profiles.</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-12 px-5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <LucideDownload size={18} /> Export
                    </button>
                    <button className="btn-primary flex items-center gap-2 h-12 px-6">
                        <LucideUserPlus size={20} />
                        New Admission
                    </button>
                </div>
            </div>

            {/* Utilities */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <LucideSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by student name or code..."
                        className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
                <button className="h-12 px-5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <LucideFilter size={18} /> Filters
                </button>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Join Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-primary text-xs uppercase">
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{student.code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-semibold text-slate-600">{student.course}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-medium text-slate-500">{student.joinDate}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${student.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {student.status === 'Active' ? <LucideCheckCircle size={10} /> : <LucideXCircle size={10} />}
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-white rounded-lg border border-transparent hover:border-slate-100">
                                            <LucideMoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Showing 1-3 of 1,280 Students</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 shadow-sm border-primary/20">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
