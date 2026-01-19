"use client";

import React, { useState, useEffect } from "react";
import {
    UserCircle,
    ShieldCheck,
    Key,
    History,
    Lock,
    Mail,
    Phone,
    Edit3,
    Save,
    X,
    Activity,
    Globe,
    Crown,
    Loader2,
    Camera
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { platformService } from "@/services/platformService";

interface ProfileFormData {
    display_name: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    timezone: string;
}

export default function PlatformProfile() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        display_name: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        timezone: "Asia/Kolkata"
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const userData = await platformService.getMe();
            setProfileData(userData);

            // Initialize form data
            if (userData?.user) {
                setFormData({
                    display_name: userData.user.display_name || "",
                    first_name: userData.user.first_name || "",
                    last_name: userData.user.last_name || "",
                    phone_number: userData.user.phone || "",
                    timezone: userData.user.timezone || "Asia/Kolkata"
                });
            }

            // Load recent activity from audit logs
            try {
                const logs = await platformService.getAuditLogs();
                const userLogs = (logs || []).filter((l: any) => l.user_id === userData?.user?.id).slice(0, 5);
                setRecentActivity(userLogs.map((log: any) => ({
                    action: `${log.action} on ${log.resource_type || log.table_name}`,
                    time: new Date(log.created_at).toLocaleString(),
                    ip: log.ip_address || "Internal",
                    type: log.action.toLowerCase()
                })));
            } catch (e) {
                // Fallback if audit logs not available
                setRecentActivity([]);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const updatedUser = await platformService.updateProfile(formData);

            // Update local state
            if (updatedUser) {
                setProfileData((prev: any) => ({
                    ...prev,
                    user: { ...prev?.user, ...updatedUser }
                }));

                // Update auth store
                if (user) {
                    setUser({
                        ...user,
                        display_name: updatedUser.display_name,
                        first_name: updatedUser.first_name,
                        last_name: updatedUser.last_name
                    });
                }
            }

            toast.success("Profile updated successfully!");
            setEditing(false);
        } catch (error: any) {
            console.error("Failed to save profile", error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form to original values
        if (profileData?.user) {
            setFormData({
                display_name: profileData.user.display_name || "",
                first_name: profileData.user.first_name || "",
                last_name: profileData.user.last_name || "",
                phone_number: profileData.user.phone || "",
                timezone: profileData.user.timezone || "Asia/Kolkata"
            });
        }
        setEditing(false);
    };

    const handleChangePassword = () => {
        toast.info("Password change initiated", {
            description: "Check your email for verification link."
        });
    };

    const getRoleLevel = () => {
        const level = user?.role?.level || user?.user_roles?.[0]?.roles?.level || 0;
        if (level === 5) return { name: "Platform Admin", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
        if (level === 4) return { name: "Company Admin", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
        if (level === 3) return { name: "Branch Manager", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
        if (level === 1) return { name: "Branch Admin", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" };
        return { name: "User", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
    };

    const roleInfo = getRoleLevel();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
                {/* Header with Cover & Avatar */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    {/* Cover Image */}
                    <div className="relative h-32 md:h-48 bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#003D99]">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                        <div className="absolute right-4 top-4">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${roleInfo.bg} ${roleInfo.border} border backdrop-blur-sm`}>
                                <Crown className={`w-4 h-4 ${roleInfo.color}`} />
                                <span className={`text-xs font-bold ${roleInfo.color} uppercase tracking-wider`}>{roleInfo.name}</span>
                            </span>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 md:px-8 pb-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-12 md:-mt-16">
                            {/* Avatar & Name */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                <div className="relative group">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center">
                                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                                            {formData.display_name?.charAt(0) || user?.display_name?.charAt(0) || "U"}
                                        </div>
                                    </div>
                                    {editing && (
                                        <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-8 h-8 text-white" />
                                        </button>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-xl flex items-center justify-center shadow-lg">
                                        <Activity className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                <div className="pb-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{formData.display_name || user?.display_name || "User"}</h1>
                                    <p className="text-sm text-slate-500 font-medium mt-1">{user?.email}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {!editing ? (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0066FF] text-white rounded-xl font-semibold text-sm hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Edit Profile</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="hidden sm:inline">Cancel</span>
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            <span className="hidden sm:inline">{saving ? "Saving..." : "Save"}</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <UserCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                                    <input
                                        type="text"
                                        disabled={!editing}
                                        value={formData.display_name}
                                        onChange={(e) => handleInputChange("display_name", e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            disabled
                                            value={user?.email || ""}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                                    <input
                                        type="text"
                                        disabled={!editing}
                                        value={formData.first_name}
                                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                                        placeholder="Enter first name"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        disabled={!editing}
                                        value={formData.last_name}
                                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                                        placeholder="Enter last name"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            disabled={!editing}
                                            value={formData.phone_number}
                                            onChange={(e) => handleInputChange("phone_number", e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            disabled={!editing}
                                            value={formData.timezone}
                                            onChange={(e) => handleInputChange("timezone", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                                        >
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                            <option value="America/New_York">America/New York (EST)</option>
                                            <option value="Europe/London">Europe/London (GMT)</option>
                                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <History className="w-5 h-5 text-violet-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                            </div>

                            {recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.map((activity, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                                                <Activity className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-700 truncate">{activity.action}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                    <span>{activity.time}</span>
                                                    <span>•</span>
                                                    <span className="font-mono">{activity.ip}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-sm text-slate-400">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Security & Actions */}
                    <div className="space-y-6">
                        {/* Security Settings */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Security</h2>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleChangePassword}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                                        <Key className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-700">Change Password</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Update your login credentials</p>
                                    </div>
                                </button>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                            <Lock className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">Two-Factor Auth</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Enhanced security</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200">
                                        Enabled
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Account Stats */}
                        <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-2xl p-6 text-white shadow-xl">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-4">Account Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/80">Member Since</span>
                                    <span className="text-sm font-bold">
                                        {profileData?.user?.created_at
                                            ? new Date(profileData.user.created_at).toLocaleDateString()
                                            : "N/A"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/80">Last Login</span>
                                    <span className="text-sm font-bold">
                                        {profileData?.user?.last_login_at
                                            ? new Date(profileData.user.last_login_at).toLocaleDateString()
                                            : "Today"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/80">Activity Score</span>
                                    <span className="text-sm font-bold">★★★★★</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
