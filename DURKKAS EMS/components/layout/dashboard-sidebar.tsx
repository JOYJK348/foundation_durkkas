"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardCheck,
  MessageSquare,
  Calendar,
  TrendingUp,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Video,
  Upload,
  Users,
  Settings,
  BarChart3,
  GraduationCap,
  FileCheck,
  HelpCircle,
  CreditCard,
  FolderOpen,
  PlusCircle,
  Eye,
  Shield,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

const studentMenu: SidebarSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard/online/student", icon: LayoutDashboard },
      { label: "Course Content", href: "/dashboard/online/student/courses", icon: BookOpen },
      { label: "Assessments", href: "/dashboard/online/student/assessments", icon: ClipboardCheck },
      { label: "Assignments", href: "/dashboard/online/student/assignments", icon: FileText },
      { label: "Doubt Sessions", href: "/dashboard/online/student/doubts", icon: MessageSquare, badge: 2 },
      { label: "Attendance", href: "/dashboard/online/student/attendance", icon: Calendar },
      { label: "Progress", href: "/dashboard/online/student/progress", icon: TrendingUp },
      { label: "Notifications", href: "/dashboard/online/student/notifications", icon: Bell, badge: 5 },
      { label: "Profile", href: "/dashboard/online/student/profile", icon: User },
    ],
  },
];

const tutorMenu: SidebarSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard/online/tutor", icon: LayoutDashboard },
      { label: "Course Builder", href: "/dashboard/online/tutor/course-builder", icon: FolderOpen },
      { label: "Content Upload", href: "/dashboard/online/tutor/content", icon: Upload },
      { label: "Assessments", href: "/dashboard/online/tutor/assessments", icon: ClipboardCheck },
      { label: "Assignments", href: "/dashboard/online/tutor/assignments", icon: FileText },
      { label: "Doubt Requests", href: "/dashboard/online/tutor/doubts", icon: HelpCircle, badge: 3 },
      { label: "Attendance", href: "/dashboard/online/tutor/attendance", icon: Calendar },
      { label: "Analytics", href: "/dashboard/online/tutor/analytics", icon: BarChart3 },
      { label: "Scheduling", href: "/dashboard/online/tutor/scheduling", icon: Calendar },
      { label: "Notifications", href: "/dashboard/online/tutor/notifications", icon: Bell },
    ],
  },
];

const adminMenu: SidebarSection[] = [
  {
    items: [
      { label: "Master Dashboard", href: "/dashboard/online/admin", icon: LayoutDashboard },
      { label: "Course Management", href: "/dashboard/online/admin/courses", icon: BookOpen },
      { label: "Student Enrollment", href: "/dashboard/online/admin/students", icon: GraduationCap },
      { label: "Tutor Management", href: "/dashboard/online/admin/tutors", icon: Users },
      { label: "Attendance Reports", href: "/dashboard/online/admin/attendance", icon: Calendar },
      { label: "Submissions Monitor", href: "/dashboard/online/admin/submissions", icon: FileCheck },
      { label: "Payments", href: "/dashboard/online/admin/payments", icon: CreditCard },
      { label: "Notifications", href: "/dashboard/online/admin/notifications", icon: Bell },
      { label: "Analytics", href: "/dashboard/online/admin/analytics", icon: BarChart3 },
      { label: "System Logs", href: "/dashboard/online/admin/logs", icon: Activity },
      { label: "Settings", href: "/dashboard/online/admin/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const clearUser = useAppStore((state) => state.clearUser);

  const getMenu = () => {
    if (pathname?.includes("/student")) return studentMenu;
    if (pathname?.includes("/tutor")) return tutorMenu;
    if (pathname?.includes("/admin")) return adminMenu;
    return studentMenu;
  };

  const menu = getMenu();
  const userRole = user?.role || "student";

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (pathname?.startsWith(href) && href !== "/dashboard/online/student") return true;
    return false;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobileOpen ? 0 : "-100%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 lg:z-auto",
          "lg:translate-x-0 lg:block",
          "flex flex-col shadow-xl lg:shadow-sm"
        )}
      >
        {/* Logo & Header */}
        <div className="p-4 border-b border-gray-200/50">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900">DURKKAS EMS</h2>
              <p className="text-xs text-gray-500 capitalize">{userRole} Portal</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menu.map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              {section.title && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (index * 0.05) }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          "hover:bg-primary/5 hover:text-primary",
                          active
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            active ? "text-primary" : "text-gray-500 group-hover:text-primary"
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-white">
                            {item.badge}
                          </span>
                        )}
                        {active && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200/50 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50/50">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "User Name"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || user?.phone || "user@example.com"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.aside>
    </>
  );
}

