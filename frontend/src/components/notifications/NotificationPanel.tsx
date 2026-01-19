"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Info,
    AlertTriangle,
    X,
    CheckCheck,
    Volume2,
    VolumeX,
    ExternalLink,
    Zap,
    ShieldAlert,
    Megaphone
} from "lucide-react";
import { useNotificationStore, NotificationType } from "@/store/useNotificationStore";
import Link from "next/link";

const icons: Record<NotificationType, any> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
    system: Zap,
};

const colors: Record<NotificationType, { icon: string; bg: string; border: string }> = {
    success: { icon: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    error: { icon: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
    info: { icon: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    warning: { icon: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    system: { icon: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
};

const categoryIcons: Record<string, any> = {
    ALERT: ShieldAlert,
    ANNOUNCEMENT: Megaphone,
    REMINDER: Bell,
};

interface NotificationPanelProps {
    onClose: () => void;
    isMobile?: boolean;
}

export default function NotificationPanel({ onClose, isMobile = false }: NotificationPanelProps) {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        soundEnabled,
        toggleSound
    } = useNotificationStore();

    return (
        <div className={`
            ${isMobile
                ? 'fixed inset-0 z-[100] bg-white'
                : 'absolute right-0 mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]'
            }
            animate-in ${isMobile ? 'slide-in-from-bottom-5' : 'slide-in-from-top-5'} duration-300
        `}>
            {/* Header */}
            <div className={`${isMobile ? 'p-4' : 'p-4'} border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
                            <p className="text-xs text-slate-500">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Sound Toggle */}
                        <button
                            onClick={toggleSound}
                            className={`p-2 rounded-xl transition-all ${soundEnabled
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                            title={soundEnabled ? 'Sound On' : 'Sound Off'}
                        >
                            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={markAllAsRead}
                            className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark All Read
                        </button>
                        <Link
                            href="/platform/notifications"
                            onClick={onClose}
                            className="flex-1 py-2 px-3 bg-[#0066FF] text-white rounded-xl text-xs font-bold hover:bg-[#0052CC] transition-all flex items-center justify-center gap-1.5"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View All
                        </Link>
                    </div>
                )}
            </div>

            {/* Notification List */}
            <div className={`${isMobile ? 'h-[calc(100vh-180px)]' : 'max-h-[400px]'} overflow-y-auto`}>
                {notifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                            <Bell className="w-8 h-8 text-slate-200" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900">All caught up!</p>
                            <p className="text-sm text-slate-500 mt-1">No new notifications right now.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.slice(0, 10).map((n) => {
                            const Icon = categoryIcons[n.category || ''] || icons[n.type] || Info;
                            const colorClass = colors[n.type] || colors.info;

                            return (
                                <div
                                    key={n.id}
                                    className={`p-4 hover:bg-slate-50 transition-all cursor-pointer group ${!n.read ? 'bg-blue-50/30 border-l-4 border-l-[#0066FF]' : ''
                                        }`}
                                    onClick={() => markAsRead(n.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`p-2.5 rounded-xl ${colorClass.bg} ${colorClass.border} border shrink-0`}>
                                            <Icon className={`w-4 h-4 ${colorClass.icon}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className={`text-sm font-bold leading-tight ${!n.read ? 'text-slate-900' : 'text-slate-600'
                                                    }`}>
                                                    {n.title}
                                                </p>
                                                {!n.read && (
                                                    <span className="w-2.5 h-2.5 bg-[#0066FF] rounded-full animate-pulse shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {n.category && (
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${colorClass.bg} ${colorClass.icon}`}>
                                                        {n.category}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                        onClick={clearAll}
                        className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        Clear History
                    </button>
                    <span className="text-xs text-slate-400">
                        Showing {Math.min(notifications.length, 10)} of {notifications.length}
                    </span>
                </div>
            )}
        </div>
    );
}
