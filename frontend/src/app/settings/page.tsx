
"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, Shield, Lock, Bell, Palette, Globe } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Cookie from "js-cookie";

export default function SettingsPage() {
    const { user } = useAuthStore();
    const roleLevel = user?.role?.level || parseInt(Cookie.get('user_role_level') || '0');

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your account and organization preferences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Settings */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="font-bold text-lg text-slate-900">My Profile</h2>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">Manage your personal information, password, and avatar.</p>
                        <button className="btn-outline w-full justify-center">Edit Profile</button>
                    </div>

                    {/* Security - ALL */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h2 className="font-bold text-lg text-slate-900">Security</h2>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">Update password and 2FA settings.</p>
                        <button className="btn-outline w-full justify-center">Security Settings</button>
                    </div>

                    {/* COMPANY ADMIN ONLY - Access Control */}
                    {roleLevel === 4 && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield className="w-24 h-24 text-purple-600 rotate-12" />
                            </div>
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h2 className="font-bold text-lg text-slate-900">Access Control</h2>
                            </div>
                            <p className="text-sm text-slate-500 mb-6 relative z-10">
                                Configure menu visibility and permissions for Branch Admins and Employees.
                            </p>
                            <Link href="/workspace/settings/menu-access" className="btn-primary w-full justify-center relative z-10 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>Manage Menu Access</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
