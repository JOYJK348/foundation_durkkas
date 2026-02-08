"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  Bell,
  User,
  Search,
  BookOpen,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export function TopNavbar() {
  const pathname = usePathname();
  const user = useAppStore((state) => state.user);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount] = useState(5);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Determine portal and role from pathname
  const isOffline = pathname?.includes("/offline");
  const isWorkshop = pathname?.includes("/workshop");
  const isOnline = !isOffline && !isWorkshop;
  const isStudent = pathname?.includes("/student");
  const isTutor = pathname?.includes("/tutor");
  const isAdmin = pathname?.includes("/admin");

  // Get base path
  const getBasePath = () => {
    if (isOffline) return "/dashboard/offline/student";
    if (isWorkshop) return "/dashboard/workshop/student";
    return "/dashboard/online/student";
  };

  const basePath = getBasePath();

  // Online portal links
  const onlineLinks = [
    { href: "/dashboard/online/student", label: "Dashboard" },
    { href: "/dashboard/online/student/courses", label: "My Courses" },
    { href: "/dashboard/online/student/assignments", label: "Assignments" },
    { href: "/dashboard/online/student/doubts", label: "Doubts" },
    { href: "/dashboard/online/student/progress", label: "Progress" },
    { href: "/dashboard/online/student/profile", label: "Profile" },
  ];

  // Offline portal links
  const offlineLinks = [
    { href: "/dashboard/offline/student", label: "Dashboard" },
    { href: "/dashboard/offline/student/courses", label: "Materials" },
    { href: "/dashboard/offline/student/attendance", label: "Attendance" },
    { href: "/dashboard/offline/student/downloads", label: "Downloads" },
    { href: "/dashboard/offline/student/progress", label: "Progress" },
    { href: "/dashboard/offline/student/profile", label: "Profile" },
  ];

  // Workshop portal links
  const workshopLinks = [
    { href: "/dashboard/workshop/student", label: "Dashboard" },
    { href: "/dashboard/workshop/student/courses", label: "Workshops" },
    { href: "/dashboard/workshop/student/progress", label: "Progress" },
    { href: "/dashboard/workshop/student/profile", label: "Profile" },
  ];

  const quickLinks = isOffline ? offlineLinks : isWorkshop ? workshopLinks : onlineLinks;

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo */}
          <Link href={basePath} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
              isOffline 
                ? "bg-gradient-to-br from-green-600 to-emerald-600"
                : isWorkshop
                ? "bg-gradient-to-br from-orange-600 to-red-600"
                : "bg-gradient-to-br from-blue-600 to-blue-700"
            }`}>
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg text-gray-900 hidden sm:inline">DURKKAS EMS</span>
          </Link>

          {/* Center: Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search courses, materials..."
                className="w-full h-9 pl-9 text-sm border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <div className="px-3 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name || "Student"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || "student@example.com"}</p>
                    </div>
                    <div className="py-1">
                      {quickLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 py-1">
                      <Link
                        href="/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden pb-3 border-t border-gray-200"
            >
              <div className="relative pt-3">
                <Search className="absolute left-3 top-6 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search courses, materials..."
                  className="w-full h-9 pl-9 text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </nav>
  );
}

