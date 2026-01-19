"use client";

import React, { useEffect, useState } from "react";
import {
    Bell,
    ShieldAlert,
    Clock,
    ChevronRight,
    Send,
    Info,
    Zap,
    Building,
    MapPin,
    Users,
    Search,
    Filter,
    CheckCheck,
    Volume2,
    VolumeX,
    RefreshCcw,
    Megaphone,
    AlertTriangle,
    CheckCircle2,
    X,
    Loader2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "sonner";
import NotificationComposer from "@/components/notifications/NotificationComposer";

export default function NotificationsView() {
    const { user } = useAuthStore();
    const { soundEnabled, toggleSound, playNotificationSound } = useNotificationStore();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showComposer, setShowComposer] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterType, setFilterType] = useState("");

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await platformService.getNotifications();
            setNotifications(data || []);
        } catch (error: any) {
            console.error('[NotificationsView] Failed to load notifications:', error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await platformService.markNotificationsRead(undefined, true);
            toast.success("All notifications marked as read");
            loadNotifications();
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await platformService.markNotificationsRead([id]);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const testSound = () => {
        playNotificationSound();
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'ALERT': return { icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50", border: 'border-rose-200' };
            case 'ANNOUNCEMENT': return { icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50", border: 'border-blue-200' };
            case 'REMINDER': return { icon: Bell, color: "text-amber-600", bg: "bg-amber-50", border: 'border-amber-200' };
            case 'WARNING': return { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", border: 'border-orange-200' };
            case 'SUCCESS': return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: 'border-emerald-200' };
            default: return { icon: Info, color: "text-slate-600", bg: "bg-slate-50", border: 'border-slate-200' };
        }
    };

    const getTargetBadge = (type: string) => {
        switch (type) {
            case 'GLOBAL': return { label: 'Platform Wide', icon: Zap, color: 'bg-violet-50 text-violet-700 border-violet-200' };
            case 'COMPANY': return { label: 'Company', icon: Building, color: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'BRANCH': return { label: 'Branch', icon: MapPin, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            default: return { label: 'Personal', icon: Users, color: 'bg-slate-50 text-slate-700 border-slate-200' };
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            if (!n.title?.toLowerCase().includes(term) && !n.message?.toLowerCase().includes(term)) {
                return false;
            }
        }
        if (filterCategory && n.category !== filterCategory) return false;
        if (filterType && n.target_type !== filterType) return false;
        return true;
    });

    const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.is_read).length,
        alerts: notifications.filter(n => n.category === 'ALERT').length,
        announcements: notifications.filter(n => n.category === 'ANNOUNCEMENT').length
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterCategory("");
        setFilterType("");
    };

    const hasActiveFilters = searchTerm || filterCategory || filterType;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Bell className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">Notification Center</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Notifications
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            {stats.unread > 0 ? `${stats.unread} unread notifications` : 'All caught up!'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Sound Toggle */}
                        <button
                            onClick={toggleSound}
                            className={`p-3 rounded-xl border transition-all ${soundEnabled
                                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                            title={soundEnabled ? 'Sound On' : 'Sound Off'}
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>

                        {/* Test Sound */}
                        <button
                            onClick={testSound}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                            title="Test Sound"
                        >
                            <Zap className="w-5 h-5" />
                        </button>

                        {/* Refresh */}
                        <button
                            onClick={loadNotifications}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Broadcast (Admin only) */}
                        {user?.role?.level && user.role.level >= 4 && (
                            <button
                                onClick={() => setShowComposer(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 hover:scale-[1.02] transition-all"
                            >
                                <Send className="w-4 h-4" />
                                <span className="hidden sm:inline">Broadcast</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total", value: stats.total, icon: Bell, color: "bg-blue-50", iconColor: "text-blue-600" },
                        { label: "Unread", value: stats.unread, icon: Info, color: "bg-violet-50", iconColor: "text-violet-600" },
                        { label: "Alerts", value: stats.alerts, icon: ShieldAlert, color: "bg-rose-50", iconColor: "text-rose-600" },
                        { label: "Announcements", value: stats.announcements, icon: Megaphone, color: "bg-amber-50", iconColor: "text-amber-600" }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filters</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-[#0066FF] hover:text-[#0052CC] transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear
                                </button>
                            )}
                            {stats.unread > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark All Read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Search */}
                        <div className="relative sm:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500 pointer-events-none z-10" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                <option value="ALERT">Alert</option>
                                <option value="ANNOUNCEMENT">Announcement</option>
                                <option value="REMINDER">Reminder</option>
                                <option value="INFO">Info</option>
                            </select>
                        </div>

                        {/* Target Type Filter */}
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none z-10" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Types</option>
                                <option value="GLOBAL">Platform Wide</option>
                                <option value="COMPANY">Company</option>
                                <option value="BRANCH">Branch</option>
                                <option value="USER">Personal</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notification List */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-10 h-10 text-slate-200" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">No Notifications</h4>
                        <p className="text-sm text-slate-500">
                            {hasActiveFilters ? 'No notifications match your filters.' : 'You\'re all caught up!'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notif) => {
                            const styles = getCategoryStyles(notif.category);
                            const target = getTargetBadge(notif.target_type);
                            const Icon = styles.icon;
                            const TargetIcon = target.icon;

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => handleMarkRead(notif.id)}
                                    className={`bg-white rounded-2xl p-4 md:p-6 border shadow-sm transition-all hover:shadow-md cursor-pointer ${!notif.is_read ? 'border-l-4 border-l-[#0066FF] border-slate-100' : 'border-slate-100'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 md:w-14 md:h-14 ${styles.bg} ${styles.border} border rounded-2xl flex items-center justify-center shrink-0`}>
                                            <Icon className={`w-6 h-6 md:w-7 md:h-7 ${styles.color}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Badges */}
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${styles.bg} ${styles.color} ${styles.border}`}>
                                                    {notif.category || 'INFO'}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${target.color} flex items-center gap-1`}>
                                                    <TargetIcon className="w-3 h-3" />
                                                    {target.label}
                                                </span>
                                                {!notif.is_read && (
                                                    <span className="w-2.5 h-2.5 bg-[#0066FF] rounded-full animate-pulse" />
                                                )}
                                            </div>

                                            {/* Title & Message */}
                                            <h4 className="text-base md:text-lg font-bold text-slate-900 mb-1">{notif.title}</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-3">{notif.message}</p>

                                            {/* Footer */}
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                                                </div>
                                                {notif.sender && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span>by {notif.sender.display_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="hidden md:flex items-center">
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Composer Modal */}
                {showComposer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowComposer(false)} />
                        <div className="relative w-full max-w-2xl">
                            <NotificationComposer
                                userLevel={user?.role?.level || 0}
                                onSuccess={() => loadNotifications()}
                                onClose={() => setShowComposer(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
