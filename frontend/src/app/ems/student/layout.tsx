"use client";

import React, { useEffect, useState } from 'react';
import { LucideLayoutDashboard, LucideBookOpen, LucideCalendar, LucideFileText, LucideSettings, LucideUser } from 'lucide-react';
import { emsService } from '@/services/emsService';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Since getCurrentProfile might not be fully implemented on backend yet, 
                // we'll try to get dashboard data which includes student info
                const response = await emsService.getStudentDashboard();
                if (response.success) {
                    setProfile(response.data.student);
                }
            } catch (error) {
                console.error('Failed to load layout profile:', error);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-primary">Student Portal</h1>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    <NavItem icon={<LucideLayoutDashboard size={20} />} label="Dashboard" active />
                    <NavItem icon={<LucideBookOpen size={20} />} label="My Courses" />
                    <NavItem icon={<LucideCalendar size={20} />} label="Schedule" />
                    <NavItem icon={<LucideFileText size={20} />} label="Assignments" />
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <NavItem icon={<LucideSettings size={20} />} label="Settings" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {profile ? `Welcome back, ${profile.first_name}!` : 'Welcome back!'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <LucideUser size={20} />
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">
                                {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                                {profile ? `ID: ${profile.student_code}` : 'ST-XXXX'}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-primary/10 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
            {icon}
            <span>{label}</span>
        </div>
    );
}
