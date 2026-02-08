"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  Activity,
} from "lucide-react";

export default function OnlineAdminDashboard() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {greeting}, Admin!
          </h1>
          <p className="text-muted-foreground">Master dashboard and system overview</p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: "1,234", icon: Users, color: "from-blue-500 to-cyan-500" },
            { label: "Active Courses", value: "45", icon: BookOpen, color: "from-purple-500 to-pink-500" },
            { label: "Revenue", value: "₹2.5L", icon: DollarSign, color: "from-green-500 to-emerald-500" },
            { label: "Growth", value: "+12%", icon: TrendingUp, color: "from-orange-500 to-red-500" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Analytics & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <BarChart3 className="h-16 w-16" />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

