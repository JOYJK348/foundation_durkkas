"use client";

import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/navigation/back-button";
import {
  Bell,
  ClipboardCheck,
  FileText,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      type: "assessment",
      title: "New Assessment Available",
      message: "Module 2 Assessment is now available. Complete it before Dec 25, 2024",
      time: "2 hours ago",
      read: false,
      link: "/dashboard/online/student/assessments",
    },
    {
      id: 2,
      type: "doubt",
      title: "Doubt Session Scheduled",
      message: "Your doubt session on React Hooks has been scheduled for Dec 20, 2024 at 4:00 PM",
      time: "5 hours ago",
      read: false,
      link: "/dashboard/online/student/doubts",
    },
    {
      id: 3,
      type: "content",
      title: "New Content Uploaded",
      message: "Module 3 materials have been uploaded. Check the course content section",
      time: "1 day ago",
      read: true,
      link: "/dashboard/online/student/courses",
    },
    {
      id: 4,
      type: "assignment",
      title: "Assignment Due Reminder",
      message: "API Integration Project is due in 2 days. Don't forget to submit!",
      time: "2 days ago",
      read: true,
      link: "/dashboard/online/student/assignments",
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "assessment":
        return <ClipboardCheck className="h-5 w-5 text-blue-600" />;
      case "doubt":
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case "content":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "assignment":
        return <FileText className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <TopNavbar />
        <div className="p-4 sm:p-6 space-y-6">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton />
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-blue-700">
              Notifications
            </h1>
            <p className="text-muted-foreground">Stay updated with all your course activities</p>
          </motion.div>

          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={notification.link}>
                  <Card
                    className={`border-0 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                      !notification.read
                        ? "bg-white border-l-4 border-blue-600"
                        : "bg-white"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-500">
                                {notification.time}
                              </span>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0">
                                <span className="w-2 h-2 rounded-full bg-blue-600 block"></span>
                              </div>
                            )}
                            {notification.read && (
                              <div className="flex-shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

