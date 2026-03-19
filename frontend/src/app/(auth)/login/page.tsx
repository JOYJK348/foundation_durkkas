"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Building2, Server } from "lucide-react";
import Cookie from "js-cookie";

import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useNotificationStore } from "@/store/useNotificationStore";
import api from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const completeLogin = (user: any, tokens: any, selectedRole: any) => {
        const displayName = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.display_name || "User";

        // Store tokens and user info in Cookies (with explicit path and domain safety)
        const cookieOptions = { expires: 1, path: '/', sameSite: 'Lax' as const };

        Cookie.set("access_token", tokens.accessToken, cookieOptions);
        Cookie.set("user_role", selectedRole.name || "GUEST", cookieOptions);
        Cookie.set("user_role_level", (selectedRole.level ?? 0).toString(), cookieOptions);
        Cookie.set("user_display_name", displayName, cookieOptions);

        // CRITICAL: Store active branch ID and Company ID for middleware and hydration
        if (selectedRole.company_id) {
            Cookie.set("x-company-id", selectedRole.company_id.toString(), cookieOptions);
        }
        if (selectedRole.branch_id) {
            Cookie.set("x-branch-id", selectedRole.branch_id.toString(), cookieOptions);
        } else {
            Cookie.remove("x-branch-id", { path: '/' });
        }

        // Set User in Zustand Store
        setUser({
            id: user.id.toString(),
            email: user.email,
            display_name: displayName,
            role: {
                name: selectedRole.name || "GUEST",
                level: selectedRole.level ?? 0
            },
            company_id: selectedRole.company_id?.toString(),
            branch_id: selectedRole.branch_id
        });

        // Add Success Notification
        addNotification({
            title: "Login Successful",
            message: `Welcome back, ${displayName}! You have successfully accessed your dashboard.`,
            type: "success"
        });

        toast.success("Welcome back!", {
            description: `Signed in as ${displayName}`
        });

        // Role-based Redirect
        const roleLevel = selectedRole.level ?? 0;
        const roleName = selectedRole.name || "";

        // ========================================
        // EMS ROLE-SPECIFIC REDIRECTS (Priority)
        // ========================================
        if (roleName === "STUDENT") {
            router.push("/ems/student/dashboard");
        } else if (roleName === "TUTOR") {
            router.push("/ems/tutor/dashboard");
        } else if (roleName === "ACADEMIC_MANAGER") {
            router.push("/ems/academic-manager/dashboard");
        } else if (roleName === "EMPLOYEE") {
            router.push("/hrms/employee/dashboard");
        }
        // ========================================
        // GENERIC LEVEL-BASED REDIRECTS
        // ========================================
        else if (roleLevel >= 5) {
            router.push("/platform/dashboard");
        } else if (roleLevel >= 4) {
            router.push("/workspace/dashboard");
        } else if (roleLevel >= 1 || roleLevel === 0) {
            router.push("/ems/academic-manager/dashboard");
        } else {
            router.push("/dashboard");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        console.log("🚀 [Login] Submit triggered");
        setIsLoading(true);
        setError("");

        try {
            console.log("📡 [Login] Sending request to:", api.defaults.baseURL + '/auth/login');
            // Use the centralized api instance instead of hardcoded fetch
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;
            console.log("📥 [Login] Response received:", data.success ? "Success" : "Failure");

            if (!data.success) {
                throw new Error(data.error?.message || "Login failed - check credentials");
            }

            const { user, tokens } = data.data;
            if (!user || !tokens) throw new Error("Invalid response from server - missing data");

            const roles = user.roles || user.user_roles || [];
            // Handle different roles structures
            const primaryRole = Array.isArray(roles) && roles.length > 0
                ? (roles[0].roles || roles[0])
                : { name: "GUEST", level: 0 };

            console.log("👤 [Login] Authenticated as:", user.email, "Role:", primaryRole.name);

            // Double check student restriction
            if (primaryRole.name === "STUDENT") {
                setError("Students must login at /ems/student/login");
                toast.error("Wrong Login Page", {
                    description: "Students must use the dedicated student login page"
                });
                setIsLoading(false);
                return;
            }

            completeLogin(user, tokens, {
                ...primaryRole,
                company_id: roles[0]?.company_id,
                branch_id: roles[0]?.branch_id
            });
        } catch (err: any) {
            console.error("❌ [Login] Error:", err.message, err.response?.data);
            const errorMessage = err.response?.data?.error?.message || err.message || "An unexpected error occurred during login";
            setError(errorMessage);
            toast.error("Login Failed", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />

            <div className="w-full max-w-md animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20 transition-transform hover:scale-105 duration-300">
                        <Server className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Durkkas ERP</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-widest">Enterprise Ecosystem</p>
                </div>

                <div className="premium-glass rounded-3xl p-8 md:p-10">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-primary">Welcome Back</h2>
                        <p className="text-muted-foreground text-sm mt-1">Please enter your credentials to access your workspace.</p>
                    </div>

                    <form
                        method="POST"
                        onSubmit={handleLogin}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-primary/70 ml-1">WORK EMAIL</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    className="input-premium pl-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-semibold text-primary/70 uppercase">Password</label>
                                <Link href="/forgot-password" className="text-xs font-medium text-accent hover:underline decoration-2 underline-offset-4 pointer-events-none opacity-50">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="input-premium pl-11 pr-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full h-12 text-base font-semibold transition-all hover:translate-y-[-2px] shadow-lg shadow-primary/20"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : "Sign In to Ecosystem"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border flex flex-col items-center">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-tighter">
                            <Building2 className="w-3 h-3" />
                            <span>Multi-Tenant Powered by Durkkas</span>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-xs text-muted-foreground">
                    &copy; 2026 Durkkas Innovations. All rights reserved.
                </p>
            </div>
        </div>
    );
}
