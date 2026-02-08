"use client";

import { motion } from "framer-motion";
import { Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export function DashboardHeader({
  onMenuClick,
  onNotificationClick,
  onProfileClick,
  sidebarOpen,
  setSidebarOpen,
}: DashboardHeaderProps) {
  const user = useAppStore((state) => state.user);
  const [unreadCount] = useState(5);

  const userName = user?.name || "Student";
  const greeting = new Date().getHours() < 12
    ? "Good Morning"
    : new Date().getHours() < 18
    ? "Good Afternoon"
    : "Good Evening";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 h-16 sm:h-18"
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left: Menu/Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (setSidebarOpen) {
              setSidebarOpen(!sidebarOpen);
            }
            onMenuClick?.();
          }}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="lg:hidden w-6" /> {/* Spacer for mobile */}

        {/* Center: Greeting */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 text-center lg:text-left lg:pl-0"
        >
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">
            {greeting}, {userName.split(" ")[0]} 👋
          </h1>
        </motion.div>

        {/* Right: Notifications + Avatar */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationClick}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </Button>

          {/* Avatar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onProfileClick}
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg hover:bg-blue-700"
          >
            <User className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

