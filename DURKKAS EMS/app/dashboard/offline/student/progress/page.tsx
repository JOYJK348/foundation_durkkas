"use client";

import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/navigation/back-button";
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Target,
  BarChart3,
  Calendar,
  Download,
  FileText,
  Clock,
  Award as AwardIcon,
} from "lucide-react";

export default function OfflineProgressPage() {
  const overallProgress = 68;
  const attendanceProgress = 85;
  
  const moduleProgress = [
    { name: "Introduction", progress: 100, completed: true, materialsDownloaded: 5 },
    { name: "Fundamentals", progress: 85, completed: false, materialsDownloaded: 8 },
    { name: "Advanced Topics", progress: 45, completed: false, materialsDownloaded: 3 },
    { name: "Projects", progress: 20, completed: false, materialsDownloaded: 1 },
  ];

  const attendanceStats = [
    { month: "Dec 2024", present: 18, absent: 2, percentage: 90 },
    { month: "Nov 2024", present: 20, absent: 0, percentage: 100 },
    { month: "Oct 2024", present: 19, absent: 1, percentage: 95 },
  ];

  const downloadStats = [
    { category: "PDF Documents", count: 12, size: "24.5 MB" },
    { category: "Practice Files", count: 8, size: "15.2 MB" },
    { category: "Reference Materials", count: 4, size: "8.3 MB" },
  ];

  const achievements = [
    { title: "Material Master", description: "Downloaded 20+ materials", icon: Download, unlocked: true },
    { title: "Perfect Attendance", description: "100% attendance in a month", icon: CheckCircle2, unlocked: true },
    { title: "Course Explorer", description: "Enrolled in 5+ courses", icon: BookOpen, unlocked: false },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
        <TopNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton />
          </div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
              Progress Tracking
            </h1>
            <p className="text-gray-600">Monitor your offline learning journey and achievements</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Overall Progress</p>
                      <p className="text-3xl font-bold">{overallProgress}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Target className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Attendance</p>
                      <p className="text-3xl font-bold">{attendanceProgress}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-100 mb-1">Materials Downloaded</p>
                      <p className="text-3xl font-bold">
                        {moduleProgress.reduce((acc, m) => acc + m.materialsDownloaded, 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Download className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-100 mb-1">Modules Completed</p>
                      <p className="text-3xl font-bold">
                        {moduleProgress.filter((m) => m.completed).length}/{moduleProgress.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <AwardIcon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Module Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Module Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleProgress.map((module, index) => (
                    <motion.div
                      key={module.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            module.completed ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                          }`}>
                            {module.completed ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{module.name}</div>
                            <div className="text-xs text-gray-500">
                              {module.materialsDownloaded} materials downloaded
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{module.progress}%</div>
                          <div className="text-xs text-gray-500">Complete</div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${module.progress}%` }}
                          transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                          className={`h-full rounded-full ${
                            module.completed
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                              : "bg-gradient-to-r from-blue-400 to-indigo-400"
                          }`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendance History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Attendance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceStats.map((stat, index) => (
                    <motion.div
                      key={stat.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{stat.month}</div>
                        <div className="text-sm text-gray-600">
                          Present: {stat.present} • Absent: {stat.absent}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{stat.percentage}%</div>
                        <div className="text-xs text-gray-500">Attendance</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Download Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Download Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {downloadStats.map((stat, index) => (
                    <motion.div
                      key={stat.category}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                      className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
                    >
                      <div className="font-semibold text-gray-900 mb-2">{stat.category}</div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">{stat.count}</div>
                      <div className="text-sm text-gray-600">{stat.size}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <motion.div
                        key={achievement.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.6 + index * 0.1 }}
                        className={`p-4 rounded-lg border-2 ${
                          achievement.unlocked
                            ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
                            : "bg-gray-50 border-gray-200 opacity-60"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                          achievement.unlocked
                            ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                            : "bg-gray-300"
                        }`}>
                          <Icon className={`h-6 w-6 ${achievement.unlocked ? "text-white" : "text-gray-500"}`} />
                        </div>
                        <div className="font-semibold text-gray-900 mb-1">{achievement.title}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                        {achievement.unlocked && (
                          <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Unlocked
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

