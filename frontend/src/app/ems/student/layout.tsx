import React from 'react';
import { LucideLayoutDashboard, LucideBookOpen, LucideCalendar, LucideFileText, LucideSettings } from 'lucide-react';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar - Person A can work on this later */}
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
                    <h2 className="text-lg font-semibold text-slate-800">Welcome back, Student!</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent animate-pulse-ring" />
                        <div className="text-right">
                            <p className="text-sm font-medium">Student Name</p>
                            <p className="text-xs text-slate-500">ID: ST-2026-001</p>
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
