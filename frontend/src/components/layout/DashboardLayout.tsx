"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronRight,
    ShieldCheck,
    CreditCard,
    Briefcase,
    ArrowLeft,
    FileText,
    CalendarCheck,
    MailCheck,
    UserCircle,
    Building,
    UserCog,
    ActivitySquare,
    ClipboardCheck,
    Lock,
    Users2,
    History,
    Palette,
    Monitor,
    Box,
    LayoutGrid,
    MonitorPlay,
    Database
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { useNotificationStore } from "@/store/useNotificationStore";
import NotificationPanel from "../notifications/NotificationPanel";
import Cookie from "js-cookie";
import { platformService } from "@/services/platformService";
import api from "@/lib/api";
import { useBranding } from "@/hooks/useBranding";

interface NavItem {
    id: string;
    label: string;
    icon: any;
    href: string;
    roles: number[];
    module?: string; // Module requirement (e.g. 'HR', 'CRM')
}

const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "DYNAMIC_DASHBOARD", roles: [1, 2, 3, 4, 5] },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛡️ PLATFORM ADMIN (Level 5) - SYSTEM ONLY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    { id: "companies", label: "Companies", icon: Building2, href: "/platform/core/companies", roles: [5] },
    { id: "modules", label: "Modules", icon: Box, href: "/platform/modules", roles: [5] },
    { id: "admins_overview", label: "Admins Overview", icon: ShieldCheck, href: "/platform/admins", roles: [5] },
    { id: "subscription_plans", label: "Subscription", icon: CreditCard, href: "/platform/subscriptions", roles: [5] },
    { id: "system_settings", label: "System Settings", icon: Monitor, href: "/platform/settings", roles: [5] },
    { id: "audit_logs", label: "Audit Logs", icon: History, href: "/platform/audit-logs", roles: [5] },
    { id: "branding_platform", label: "Branding", icon: Palette, href: "/platform/branding", roles: [5] },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏢 COMPANY / BRANCH ADMIN (Level 1-4) - BUSINESS OPERATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Core Organization (Always visible for Company Admin)
    { id: "branches", label: "Branches", icon: Building, href: "/workspace/branches", roles: [4] },
    { id: "departments", label: "Departments", icon: LayoutGrid, href: "/workspace/settings?tab=DEPARTMENTS", roles: [4] },
    { id: "designations", label: "Designations", icon: Users2, href: "/workspace/settings?tab=DESIGNATIONS", roles: [4] },

    // HR Module (Requires HR)
    { id: "employees", label: "Employees", icon: Users, href: "DYNAMIC_EMPLOYEES", roles: [1, 2, 3, 4, 5], module: "HR" },

    // Attendance Module (Requires ATTENDANCE)
    { id: "attendance", label: "Attendance", icon: CalendarCheck, href: "DYNAMIC_ATTENDANCE", roles: [1, 2, 3, 4], module: "ATTENDANCE" },
    { id: "leaves", label: "Leaves", icon: MailCheck, href: "DYNAMIC_LEAVES", roles: [1, 2, 3, 4], module: "ATTENDANCE" },

    // Payroll Module (Requires PAYROLL)
    { id: "payroll", label: "Payroll", icon: Briefcase, href: "/workspace/payroll", roles: [4], module: "PAYROLL" },

    // CRM Module
    { id: "crm", label: "CRM", icon: LayoutGrid, href: "/workspace/crm", roles: [4, 1], module: "CRM" },

    // LMS Module  
    { id: "lms", label: "LMS", icon: MonitorPlay, href: "/workspace/lms", roles: [4, 1], module: "LMS" },

    // Finance Module
    { id: "finance", label: "Finance", icon: CreditCard, href: "/workspace/finance", roles: [4, 1], module: "FINANCE" },

    // Reports (Always visible)
    { id: "reports", label: "Reports", icon: FileText, href: "DYNAMIC_REPORTS", roles: [1, 2, 3, 4] },

    // Settings & Admin Tools
    { id: "access", label: "Access Control", icon: Lock, href: "/workspace/access", roles: [4] },
    { id: "subscription", label: "Subscription", icon: CreditCard, href: "/workspace/subscription", roles: [4] },
    { id: "company_settings", label: "Settings", icon: Settings, href: "/workspace/settings", roles: [4] },

    // Shared - User Centric
    { id: "notifications", label: "Notifications", icon: Bell, href: "DYNAMIC_NOTIFICATIONS", roles: [1, 2, 3, 4, 5] },
    { id: "profile", label: "Profile", icon: UserCircle, href: "DYNAMIC_PROFILE", roles: [1, 2, 3, 4, 5] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams(); // Add this line
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, setUser, logout } = useAuthStore();
    const { unreadCount } = useNotificationStore();
    const [menuConfig, setMenuConfig] = useState<Record<string, boolean> | null>(null);
    const [myModules, setMyModules] = useState<string[] | null>(null);
    const [myPlan, setMyPlan] = useState<string | null>(null);
    const [myPermissions, setMyPermissions] = useState<string[]>([]);
    const [branchName, setBranchName] = useState<string | null>(null);
    const [branchModules, setBranchModules] = useState<string[]>([]);
    const [branchMenus, setBranchMenus] = useState<number[]>([]);
    // const { branding } = useBranding(); // 🎨 Dynamic branding - Temporarily disabled

    // Check if we can go back (not on platform or workspace dashboard root)
    const canGoBack = pathname !== "/platform/dashboard" && pathname !== "/workspace/dashboard";

    // Hydrate user from cookies if store is empty
    useEffect(() => {
        if (!user) {
            const roleName = Cookie.get("user_role");
            const roleLevel = parseInt(Cookie.get("user_role_level") || "0");
            const displayName = Cookie.get("user_display_name");

            if (roleName) {
                setUser({
                    id: "local",
                    email: "",
                    display_name: displayName || "User",
                    role: { name: roleName, level: roleLevel }
                });
            }
        }
    }, [user, setUser]);

    const userLevel = user?.role?.level || 0;
    const userRoleName = user?.role?.name || "GUEST";



    // FETCH MENU PERMISSIONS
    useEffect(() => {
        const fetchPermissions = async () => {
            // Only fetch if NOT Platform Admin (Level 5 has full access)
            if (userLevel < 5 && userLevel > 0) {
                try {
                    const res = await api.get('/auth/company-menus');
                    const data = res.data;
                    if (data.data) {
                        const roleKey = userLevel === 4 ? "COMPANY_ADMIN" : (userLevel === 1 ? "BRANCH_ADMIN" : "EMPLOYEE");

                        // Apply config if user is NOT Company Admin (Level 4) AND NOT Platform (5).
                        if (userLevel < 4) {
                            setMenuConfig(data.data[roleKey] || {});
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch menu permissions", e);
                }
            }
        };

        if (user) {
            fetchPermissions();
        }
    }, [user, userLevel]);

    // FETCH BRANCH NAME IF BRANCH ADMIN
    useEffect(() => {
        const fetchBranch = async () => {
            if (userLevel > 0 && userLevel < 4) {
                try {
                    const branches = await platformService.getBranches();
                    if (branches && branches.length > 0) {
                        setBranchName(branches[0].name);
                    }
                } catch (error) {
                    console.error("Failed to fetch branch name", error);
                }
            }
        };
        fetchBranch();
    }, [userLevel]);

    // FETCH COMPANY MODULES (COMPANY ADMIN & BRANCH ADMIN)
    useEffect(() => {
        const fetchCompanyModules = async () => {
            // Level 4 (Company Admin) or Level 1 (Branch Admin)
            if ((userLevel === 4 || userLevel === 1) && user) {
                try {
                    // Get current user scope to find company ID
                    let companyId;
                    if (userLevel === 4) {
                        const me = await platformService.getMe();
                        if (me?.permissions) setMyPermissions(me.permissions);
                        companyId = me?.scope?.companyId;
                    } else if (userLevel === 1) {
                        // Branch Admins
                        const me = await platformService.getMe();
                        if (me?.permissions) setMyPermissions(me.permissions);
                        companyId = me?.scope?.companyId;
                    }

                    if (companyId) {
                        const companyData = await platformService.getCompany(companyId.toString());

                        // Set Plan (Critical for Trial/All-Access fallback)
                        setMyPlan(companyData?.subscription_plan || 'TRIAL');

                        let activeModules: string[] = [];
                        const rawModules = companyData?.enabled_modules;

                        if (Array.isArray(rawModules)) {
                            activeModules = rawModules;
                        } else if (typeof rawModules === 'string') {
                            try { activeModules = JSON.parse(rawModules); } catch (e) { }
                        }

                        setMyModules(activeModules);

                        // If user is Branch Level (1-3), also check branch specific modules/menus
                        if (userLevel < 4 && userLevel > 0) {
                            try {
                                const me = await platformService.getMe();
                                const branches = await platformService.getBranches();
                                const bId = me?.scope?.branchId;

                                console.log(`🔍 [BranchScope] Checking branch ${bId} for modules...`);
                                // Find branch by ID or fallback to first available
                                let curBranch = branches?.find((b: any) => String(b.id) === String(bId));
                                if (!curBranch && branches?.length > 0) {
                                    curBranch = branches[0];
                                    console.log(`⚠️ [BranchScope] Scoped branch ${bId} not found, falling back to ${curBranch.id}`);
                                }

                                if (curBranch) {
                                    let bModules: string[] = [];
                                    if (curBranch.enabled_modules) {
                                        bModules = Array.isArray(curBranch.enabled_modules)
                                            ? curBranch.enabled_modules
                                            : JSON.parse(curBranch.enabled_modules);
                                    }

                                    // Fallback to core business modules if none enabled for branch
                                    if (bModules.length === 0) {
                                        bModules = ['HR', 'ATTENDANCE'];
                                    }

                                    console.log(`✅ [BranchScope] Found modules:`, bModules);
                                    setBranchModules(bModules);

                                    if (curBranch.allowed_menu_ids) {
                                        const bMenus = Array.isArray(curBranch.allowed_menu_ids)
                                            ? curBranch.allowed_menu_ids
                                            : JSON.parse(curBranch.allowed_menu_ids);
                                        setBranchMenus(bMenus);
                                    }
                                } else {
                                    // Safety global fallback if no branches at all
                                    setBranchModules(['HR', 'ATTENDANCE']);
                                    console.warn(`❌ [BranchScope] No branches found at all for user.`);
                                }
                            } catch (err) {
                                console.error(`❌ [BranchScope] Fetch error:`, err);
                            }
                        }
                    } else {
                        // Fallback if no company scope
                        setMyModules([]);
                        setMyPlan('TRIAL');
                    }
                } catch (e) {
                    console.error("Failed to fetch company modules", e);
                    setMyModules([]); // Set to empty on error to stop loading state
                    setMyPlan('TRIAL');
                }
            }
        };
        fetchCompanyModules();
    }, [user, userLevel]);

    // 🔔 SYNC NOTIFICATIONS (POLLING)
    useEffect(() => {
        if (user) {
            useNotificationStore.getState().fetchNotifications();
            const interval = setInterval(() => {
                useNotificationStore.getState().fetchNotifications();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleLogout = () => {
        Cookie.remove("access_token");
        Cookie.remove("user_role");
        Cookie.remove("user_role_level");
        Cookie.remove("user_display_name");
        logout();
        router.push("/login");
    };

    const getDashboardHref = () => {
        if (userLevel === 5) return "/platform/dashboard";
        if (userLevel === 4) return "/workspace/dashboard";
        return "/branch/dashboard";
    };

    const getEmployeesHref = () => {
        if (userLevel === 5) return "/platform/core/employees";
        return "/workspace/employees";
    };

    const getAttendanceHref = () => {
        if (userLevel === 5) return "/platform/reports/attendance";
        if (userLevel === 4) return "/workspace/attendance";
        return "/branch/attendance";
    };

    const getLeavesHref = () => {
        if (userLevel === 5) return "/platform/reports/leaves";
        if (userLevel === 4) return "/workspace/leaves";
        return "/branch/leaves";
    };

    const getReportsHref = () => {
        if (userLevel === 5) return "/platform/reports";
        if (userLevel === 4) return "/workspace/reports";
        return "/branch/reports";
    };

    const getNotificationsHref = () => {
        if (userLevel === 5) return "/platform/notifications";
        if (userLevel === 4) return "/workspace/notifications";
        return "/branch/notifications";
    };

    const getProfileHref = () => {
        if (userLevel === 5) return "/platform/profile";
        if (userLevel === 4) return "/workspace/profile";
        return "/branch/profile";
    };

    // Filter Logic
    const filteredNav = navItems.filter(item => {
        // 1. Base Role Check
        if (!item.roles.includes(userLevel)) return false;

        // 2. Dynamic Config Check (Only for Sub-Admins)
        if (menuConfig && userLevel < 4) {
            const isAllowed = menuConfig[item.id];
            if (isAllowed === false) return false;
        }

        // 3. Module Check (For Company Admin & Branch Admin)
        if ((userLevel === 4 || userLevel === 1) && item.module) {
            // 🏢 BRANCH ADMIN: Strict Filtering
            if (userLevel === 1) {
                // If branch configuration is not yet loaded, wait (don't show to avoid flickering)
                if (branchModules.length === 0 && userLevel === 1) return false;

                const bModules = branchModules.map(m => m.toUpperCase());
                const moduleKey = item.module.toUpperCase();

                let hasModule = bModules.includes(moduleKey);
                if (moduleKey === "HR") {
                    hasModule = bModules.includes("HR") || bModules.includes("HRMS") || bModules.includes("ATTENDANCE") || bModules.includes("PAYROLL");
                }

                if (!hasModule) return false;
            }

            // 🏢 COMPANY ADMIN: Plan Based Access
            if (userLevel === 4) {
                // SAFE-FAIL: Trials/Enterprise show all by default
                if (myPlan === 'TRIAL' || myPlan === 'ENTERPRISE') return true;

                // While modules are loading, show item
                if (myModules === null) return true;

                const purchasedModules = myModules.map(m => m.toUpperCase());
                const moduleKey = item.module.toUpperCase();

                let hasCompanyModule = purchasedModules.includes(moduleKey);
                if (moduleKey === "HR") {
                    hasCompanyModule = purchasedModules.includes("HR") ||
                        purchasedModules.includes("HRMS") ||
                        purchasedModules.includes("PAYROLL") ||
                        purchasedModules.includes("ATTENDANCE");
                }

                if (!hasCompanyModule) return false;
            }
        }

        // 4. BRANCH ADMIN SPECIFIC PERMISSION CHECK (GRANULAR SUB-MENUS)
        if (userLevel === 1) {
            const granularMap: Record<string, string> = {
                'employees': 'hrms.employees',
                'attendance': 'hrms.attendance',
                'leaves': 'hrms.leaves',
                'lms': 'lms.courses',
                'finance': 'finance.invoices',
                'crm': 'crm.leads'
            };

            const requiredPerm = granularMap[item.id];
            if (requiredPerm && myPermissions.length > 0 && !myPermissions.includes(requiredPerm)) {
                return false;
            }
        }

        return true;
    });

    const finalNav = filteredNav.map(item => {
        let href = item.href;
        if (href === "DYNAMIC_DASHBOARD") href = getDashboardHref();
        if (href === "DYNAMIC_EMPLOYEES") href = getEmployeesHref();
        if (href === "DYNAMIC_ATTENDANCE") href = getAttendanceHref();
        if (href === "DYNAMIC_LEAVES") href = getLeavesHref();
        if (href === "DYNAMIC_REPORTS") href = getReportsHref();
        if (href === "DYNAMIC_NOTIFICATIONS") href = getNotificationsHref();
        if (href === "DYNAMIC_PROFILE") href = getProfileHref();

        return { ...item, href };
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-['Inter',_'Poppins',_sans-serif]">
            <Toaster position="top-right" expand={false} richColors />

            {/* Desktop Sidebar - Vibrant Blue Theme */}
            <aside className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-[#0066FF] to-[#0052CC] z-40 transition-transform duration-300 hidden lg:block shadow-2xl`}>
                <div className="flex flex-col h-full p-6">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 px-3 mb-10 mt-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl tracking-tight text-white">Durkkas</span>
                            {userLevel === 5 && (
                                <span className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">Platform Admin</span>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {finalNav.map((item) => {
                            // Enhanced Active State Logic for Query Params
                            let isActive = pathname === item.href;
                            if (item.href.includes('?')) {
                                const [path, query] = item.href.split('?');
                                const itemSearchParams = new URLSearchParams(query);
                                const itemTab = itemSearchParams.get('tab');
                                const currentTab = searchParams?.get('tab');
                                if (pathname === path && itemTab && currentTab === itemTab) {
                                    isActive = true;
                                }
                            } else if (item.href !== pathname && pathname.startsWith(item.href) && item.href !== "/" && item.href !== "/workspace/dashboard" && item.href !== "/platform/dashboard") {
                                // Partial match for sub-pages (e.g. /workspace/employees/new matches /workspace/employees)
                                isActive = true;
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? "bg-white text-[#0066FF] shadow-lg shadow-black/10"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? "text-[#0066FF]" : "group-hover:scale-110 transition-transform"}`} />
                                    <span className="font-semibold text-sm">{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#0066FF]/50" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="pt-6 border-t border-white/10 mt-auto">
                        <button
                            onClick={handleLogout}
                            suppressHydrationWarning
                            className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all font-semibold text-sm group"
                        >
                            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:ml-72 min-h-screen flex flex-col pb-20 lg:pb-0">
                {/* Top Header - Clean & Modern */}
                <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 px-4 md:px-6 lg:px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <div className="flex items-center gap-3 lg:hidden">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                suppressHydrationWarning
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <Menu className="w-6 h-6 text-slate-700" />
                            </button>
                            <Link href={getDashboardHref()} className="font-bold text-lg tracking-tight text-slate-900 hover:text-[#0066FF] transition-colors">
                                Durkkas
                            </Link>
                        </div>

                        {/* Back Button */}
                        {canGoBack && (
                            <button
                                onClick={() => router.back()}
                                suppressHydrationWarning
                                className="hidden lg:flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-600 hover:text-slate-900 group"
                                title="Go Back"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                <span className="text-sm font-semibold">Back</span>
                            </button>
                        )}
                    </div>

                    {/* Search Bar - Desktop Only */}
                    <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-8">
                        {userLevel < 4 && branchName ? (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl shadow-sm">
                                <Building className="w-4 h-4 text-[#0066FF]" />
                                <span className="text-sm font-bold text-slate-900 tracking-tight">{branchName}</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2"></span>
                            </div>
                        ) : (
                            <div className="w-full relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0066FF] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search here..."
                                    className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] focus:bg-white transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Section - Notifications & Profile */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                suppressHydrationWarning
                                className={`relative p-2.5 rounded-xl transition-all duration-200 group ${showNotifications
                                    ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30'
                                    : unreadCount > 0
                                        ? 'bg-blue-50 text-[#0066FF] hover:bg-blue-100'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <Bell className={`w-5 h-5 transition-transform ${unreadCount > 0 ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`} />
                                {unreadCount > 0 && (
                                    <>
                                        {/* Ping animation */}
                                        <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full animate-ping opacity-75" />
                                        {/* Badge */}
                                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    </>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="hidden lg:block">
                                    <NotificationPanel onClose={() => setShowNotifications(false)} />
                                </div>
                            )}
                        </div>

                        {/* Settings Icon - Desktop Only */}
                        <button className="hidden md:flex p-2.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>

                        {/* Divider */}
                        <div className="w-px h-8 bg-slate-200 mx-1 hidden md:block"></div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-1">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold leading-none text-slate-900">{user?.display_name || "User"}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{userRoleName}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] p-[2px] shadow-md">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.display_name}`}
                                        alt="Avatar"
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-4 md:p-6 lg:p-8 flex-1">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation - iOS Style */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 lg:hidden z-40 shadow-2xl">
                <div className="flex items-center justify-around h-full px-2 pb-safe">
                    {filteredNav.slice(0, 4).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive
                                    ? "text-[#0066FF]"
                                    : "text-slate-500"
                                    }`}
                            >
                                <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-red-500 transition-all"
                    >
                        <LogOut className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Exit</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <aside className="w-[85%] max-w-sm h-full bg-gradient-to-b from-[#0066FF] to-[#0052CC] shadow-2xl p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Mobile Sidebar Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">D</span>
                                </div>
                                <span className="font-bold text-xl tracking-tight text-white">Durkkas</span>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="space-y-2">
                            {filteredNav.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive
                                            ? "bg-white text-[#0066FF] shadow-lg"
                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-semibold text-base">{item.label}</span>
                                    </Link>
                                );
                            })}

                            {/* Mobile Logout */}
                            <div className="pt-6 border-t border-white/10 mt-6">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all font-semibold text-base"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </nav>
                    </aside>
                </div>
            )}

            {/* Mobile Notification Drawer Overlay */}
            {showNotifications && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] lg:hidden" onClick={() => setShowNotifications(false)}>
                    <div className="flex justify-end h-full w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="animate-in slide-in-from-right duration-300 h-full w-full max-w-[400px]">
                            <NotificationPanel onClose={() => setShowNotifications(false)} isMobile={true} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
