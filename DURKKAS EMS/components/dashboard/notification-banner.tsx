"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  time?: string;
}

interface NotificationBannerProps {
  notifications?: Notification[];
  autoHide?: boolean;
  duration?: number;
}

export function NotificationBanner({
  notifications = [],
  autoHide = true,
  duration = 5000,
}: NotificationBannerProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>(notifications);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    if (autoHide && visibleNotifications.length > 0) {
      const timer = setTimeout(() => {
        setVisibleNotifications((prev) => prev.slice(1));
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visibleNotifications, autoHide, duration]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 sm:px-6 pt-4 pointer-events-none">
      <div className="max-w-4xl mx-auto space-y-2">
        <AnimatePresence>
          {visibleNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`pointer-events-auto rounded-lg border shadow-lg ${getBgColor(
                notification.type
              )}`}
            >
              <div className="p-4 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  {notification.time && (
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => {
                    setVisibleNotifications((prev) =>
                      prev.filter((n) => n.id !== notification.id)
                    );
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

