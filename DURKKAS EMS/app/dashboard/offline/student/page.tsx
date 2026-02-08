"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AssignmentsCard } from "@/components/dashboard/assignments-card";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MarkAttendanceSheet } from "@/components/attendance/mark-attendance-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Download,
  Calendar,
  CheckCircle2,
  FileText,
  Award,
  Clock,
  Users,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { navigateWithLoading } from "@/lib/utils/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";

export default function OfflineStudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [todayMarked, setTodayMarked] = useState(false);
  const user = useAppStore((state) => state.user);

  // Mock data for offline courses - Different from online portal
  const continueCourses = [
    {
      id: "1",
      title: "Digital Marketing Fundamentals",
      module: "Module 2: SEO & Content Marketing",
      progress: 72,
      cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    },
    {
      id: "2",
      title: "Graphic Design Essentials",
      module: "Module 1: Design Principles",
      progress: 58,
      cover: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    },
    {
      id: "3",
      title: "Business Communication Skills",
      module: "Module 1: Professional Writing",
      progress: 35,
      cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
    },
  ];

  const myCourses = [
    {
      id: "1",
      title: "Digital Marketing Fundamentals",
      progress: 72,
      nextLesson: "SEO Best Practices",
    },
    {
      id: "2",
      title: "Graphic Design Essentials",
      progress: 58,
      nextLesson: "Color Theory & Typography",
    },
    {
      id: "3",
      title: "Photography & Videography",
      progress: 42,
      nextLesson: "Camera Settings Guide",
    },
    {
      id: "4",
      title: "Content Writing Mastery",
      progress: 30,
      nextLesson: "Blog Writing Templates",
    },
  ];

  // Offline-specific stats
  const offlineStats = {
    materials: 24,
    attendance: 85,
    downloads: 12,
    courses: 5,
  };

  // Recent attendance records
  const recentAttendance = [
    { date: "Dec 15, 2024", status: "Present", time: "9:00 AM", class: "Web Development" },
    { date: "Dec 14, 2024", status: "Present", time: "9:00 AM", class: "Data Science" },
    { date: "Dec 13, 2024", status: "Absent", time: "-", class: "UI/UX Design" },
    { date: "Dec 12, 2024", status: "Present", time: "9:15 AM", class: "Web Development" },
  ];

  const handleMarkAttendance = () => {
    setShowMarkAttendance(true);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Main Content - Scrollable */}
        <div className="overflow-y-auto">
          {/* Hero Card - Offline Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-4 sm:mx-6 mb-6"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4"
                    >
                      <Award className="h-4 w-4" />
                      <span className="text-xs font-semibold">Offline Learning Portal</span>
                    </motion.div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                      {user?.name || "Student"}
                    </h2>
                    <p className="text-blue-100 text-sm sm:text-base">
                      1 Year Free Access - Valid Until Dec 2025
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: "Materials", value: offlineStats.materials, icon: FileText },
                    { label: "Attendance", value: `${offlineStats.attendance}%`, icon: CheckCircle2 },
                    { label: "Downloads", value: offlineStats.downloads, icon: Download },
                    { label: "Courses", value: offlineStats.courses, icon: BookOpen },
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30"
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                        <div className="text-xl sm:text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-xs text-blue-100">{stat.label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Attendance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-4 sm:mx-6 mb-6"
          >
            <Card className="border-2 border-blue-500/30 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Mark Attendance</CardTitle>
                      <p className="text-sm text-muted-foreground">Mark your attendance for offline classes</p>
                    </div>
                  </div>
                  {todayMarked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                    >
                      Marked Today
                    </motion.div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Mark Attendance Button */}
                  <Button
                    onClick={handleMarkAttendance}
                    disabled={todayMarked}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    size="lg"
                  >
                    <UserCheck className="h-5 w-5 mr-2" />
                    {todayMarked ? "Attendance Already Marked" : "Mark Attendance"}
                  </Button>

                  {/* Quick Info */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Attendance Guidelines</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Mark attendance during class hours (9:00 AM - 5:00 PM)</li>
                          <li>• QR code scanning required for verification</li>
                          <li>• Location and photo verification enabled</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Continue Learning Carousel - Offline Version */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold mb-4 px-4 sm:px-6">Continue Learning</h3>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 pb-4">
              {continueCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex-shrink-0 w-[280px] snap-center"
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="h-32 sm:h-36 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600">
                      {course.cover ? (
                        <>
                          <Image
                            src={course.cover}
                            alt={course.title}
                            fill
                            sizes="(max-width: 640px) 280px, 280px"
                            className="object-cover"
                            priority={index === 0}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-md z-10">
                        <span className="text-xs font-bold text-gray-700">{course.progress}%</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-sm mb-1 line-clamp-1">{course.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{course.module}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-blue-600 rounded-full"
                          />
                        </div>
                        <span className="text-xs font-medium ml-2 text-gray-600">{course.progress}%</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full" 
                        variant="outline" 
                        onClick={() => {
                          navigateWithLoading(router, `/dashboard/offline/student/courses?course=${course.id}`);
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Materials
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions Grid - Offline Version */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-6 px-4 sm:px-6"
          >
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Materials", icon: BookOpen, href: "/dashboard/offline/student/courses", color: "from-blue-500 to-indigo-500" },
                { label: "Attendance", icon: Calendar, href: "/dashboard/offline/student/attendance", badge: null, color: "from-blue-500 to-cyan-500" },
                { label: "Downloads", icon: Download, href: "/dashboard/offline/student/downloads", color: "from-purple-500 to-pink-500" },
                { label: "Certificates", icon: Award, href: "#", color: "from-orange-500 to-red-500" },
                { label: "Profile", icon: Users, href: "/dashboard/offline/student/profile", color: "from-indigo-500 to-purple-500" },
                { label: "Progress", icon: TrendingUp, href: "/dashboard/offline/student/progress", color: "from-blue-500 to-indigo-500" },
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-20 sm:h-24 flex flex-col items-center justify-center gap-2 relative"
                      onClick={() => {
                        if (action.href !== "#") {
                          navigateWithLoading(router, action.href);
                        }
                      }}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* My Courses */}
          <div className="mb-6 px-4 sm:px-6">
            <h3 className="text-lg font-semibold mb-4">My Courses</h3>
            <div className="space-y-3">
              {myCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div
                    onClick={() => {
                      navigateWithLoading(router, `/dashboard/offline/student/courses?course=${course.id}`);
                    }}
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 line-clamp-1">{course.title}</h4>
                      {course.nextLesson && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          Next: {course.nextLesson}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-blue-600 rounded-full"
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{course.progress}%</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Attendance Record */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6 px-4 sm:px-6"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Recent Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAttendance.map((record, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            record.status === "Present"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {record.status === "Present" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{record.date}</div>
                          <div className="text-sm text-gray-600">{record.class}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">{record.time}</div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            record.status === "Present"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    navigateWithLoading(router, "/dashboard/offline/student/attendance");
                  }}
                >
                  View Full Attendance Record
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Materials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6 px-4 sm:px-6"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Materials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Module 1 Notes", type: "PDF", downloadable: true },
                    { title: "Module 2 Slides", type: "PPT", downloadable: true },
                    { title: "Reference Materials", type: "PDF", downloadable: false },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="p-4 border rounded-lg hover:shadow-md transition-all"
                    >
                      <FileText className="h-8 w-8 text-blue-600 mb-2" />
                      <div className="font-medium mb-1">{item.title}</div>
                      <div className="text-sm text-muted-foreground mb-3">{item.type}</div>
                      {item.downloadable && (
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Mark Attendance Sheet */}
        <MarkAttendanceSheet
          isOpen={showMarkAttendance}
          onClose={() => setShowMarkAttendance(false)}
          onSuccess={(data) => {
            setTodayMarked(true);
            toast({
              title: "Attendance Marked Successfully!",
              description: `Your attendance has been recorded at ${new Date(data.timestamp).toLocaleTimeString()}`,
            });
          }}
        />

        {/* Chat Widget */}
        <ChatWidget />
      </div>
    </DashboardLayout>
  );
}
