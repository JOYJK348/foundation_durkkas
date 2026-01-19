"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Video,
    Users,
    FileSignature,
    HelpCircle,
    Bell,
    User,
    Menu,
    X,
    LogOut,
    GraduationCap
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { platformService } from '@/services/platformService';

// Define all possible navigation items
const ALL_NAV_ITEMS = [
    { label: 'Dashboard', href: '/tutor/dashboard', icon: LayoutDashboard, requiredPermission: null },
    { label: 'Courses', href: '/tutor/courses', icon: BookOpen, requiredPermission: 'lms.view' },
    { label: 'Sessions', href: '/tutor/sessions', icon: Video, requiredPermission: 'lms.view' },
    { label: 'Students', href: '/tutor/students', icon: Users, requiredPermission: 'lms.view' },
    { label: 'Assignments', href: '/tutor/assignments', icon: FileSignature, requiredPermission: 'lms.view' },
    { label: 'Doubts', href: '/tutor/doubts', icon: HelpCircle, requiredPermission: 'lms.view' },
    { label: 'Notifications', href: '/tutor/notifications', icon: Bell, requiredPermission: null },
    { label: 'Profile', href: '/tutor/profile', icon: User, requiredPermission: null },
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Permission State
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchPermissions();
        } else {
            setLoadingPermissions(false);
        }
    }, [user?.id]);

    const fetchPermissions = async () => {
        try {
            const perms = await platformService.getUserPermissions(user!.id);
            const permStrings = perms.map((p: any) => p.permission?.name || p.name || p);
            setUserPermissions(permStrings);
        } catch (error) {
            console.error("Failed to fetch sidebar permissions", error);
        } finally {
            setLoadingPermissions(false);
        }
    };

    // Filter Navigation Items
    const navItems = ALL_NAV_ITEMS.filter(item => {
        if (!item.requiredPermission) return true; // Public items
        return userPermissions.some(p => p.includes(item.requiredPermission!));
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Mobile Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 h-16 flex items-center justify-between lg:hidden">
                <div className="flex items-center gap-2 font-bold text-lg text-indigo-600 tracking-tight">
                    <GraduationCap size={24} />
                    <span>Tutor Portal</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors ${pathname === item.href
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        ))}
                        <button
                            onClick={() => logout()}
                            className="flex items-center gap-3 p-3 rounded-xl font-medium text-sm text-rose-600 hover:bg-rose-50 mt-2 border-t border-slate-100"
                        >
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-slate-200 sticky top-0">
                    <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-100 text-indigo-600">
                        <GraduationCap size={28} />
                        <span className="font-black text-lg tracking-tight">Tutor Portal</span>
                    </div>

                    <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                        {loadingPermissions ? (
                            <div className="px-4 py-2 text-xs text-slate-400 animate-pulse">Loading menu...</div>
                        ) : (
                            navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${pathname === item.href
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </Link>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                {user?.display_name?.[0] || 'T'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.display_name}</p>
                                <p className="text-xs text-slate-500 truncate">Academic Staff</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center justify-center gap-2 p-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav (IOS Style) - For primary actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around lg:hidden z-40 pb-safe">
                {navItems.slice(0, 5).map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 ${pathname === item.href ? 'text-indigo-600' : 'text-slate-400'
                            }`}
                    >
                        <item.icon size={20} strokeWidth={pathname === item.href ? 2.5 : 2} />
                        <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
                    </Link>
                ))}
            </div>
            <div className="h-20 lg:hidden" /> {/* Spacer */}
        </div>
    );
}
