"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Video,
  Settings,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  HelpCircle,
} from "lucide-react";

export default function OnlineTutorDashboard() {
  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? "Good Morning" : 
                   currentTime.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {greeting}, Tutor!
          </h1>
          <p className="text-muted-foreground">Manage your courses and students</p>
        </motion.div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Students", value: "142", icon: Users, color: "from-purple-500 to-pink-500" },
            { label: "Courses", value: "8", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
            { label: "Assignments", value: "24", icon: FileText, color: "from-green-500 to-emerald-500" },
            { label: "Live Classes", value: "5", icon: Video, color: "from-orange-500 to-red-500" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Content Visibility Control */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Content Visibility Control
            </CardTitle>
            <CardDescription>
              Control what students can see and when they can access content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Example Syllabus Block */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold mb-3">1.1 Introduction</div>
                <div className="space-y-2 ml-4">
                  {[
                    { id: "1.1.1", title: "Getting Started", visible: true },
                    { id: "1.1.2", title: "Basic Concepts", visible: false },
                    { id: "1.1.3", title: "Advanced Topics", visible: true, scheduled: "2024-12-20" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div className="flex items-center gap-2">
                        {item.visible ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">{item.id} → {item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.scheduled && (
                          <span className="text-xs text-orange-600">Scheduled: {item.scheduled}</span>
                        )}
                        <Button size="sm" variant="outline">
                          {item.visible ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Pending Grading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <div className="font-medium">Assignment {i}</div>
                    <div className="text-sm text-muted-foreground">12 submissions pending</div>
                  </div>
                  <Button size="sm">Grade</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Student Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Student {i}</span>
                      <span className="font-semibold">{60 + i * 5}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${60 + i * 5}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

