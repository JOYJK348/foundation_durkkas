"use client";

import React from 'react';
import { LucidePlus, LucideCalendar, LucideUserPlus, LucideClock } from 'lucide-react';

export default function BatchManagement() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Batches & Schedule</h1>
                    <p className="text-sm text-slate-500">Manage time slots, batch allocation, and tutor assignments.</p>
                </div>
                <button className="btn-primary flex items-center gap-2 h-12 px-6">
                    <LucidePlus size={20} />
                    Create New Batch
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pt-4">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                                <LucideCalendar size={24} />
                            </div>
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Active</span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-1">Morning Batch B1</h3>
                        <p className="text-sm text-primary font-bold mb-6">Full Stack Development</p>

                        <div className="space-y-4 border-t border-slate-50 pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <LucideClock size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-widest">Time Slot</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">09:00 AM - 11:00 AM</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <LucideUserPlus size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-widest">Capacity</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">22 / 30 Student</span>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button className="flex-1 h-12 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-100 transition-colors">
                                Batch Details
                            </button>
                            <button className="flex-1 h-12 bg-primary text-white rounded-2xl font-bold text-xs hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                                Manage Attendance
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
