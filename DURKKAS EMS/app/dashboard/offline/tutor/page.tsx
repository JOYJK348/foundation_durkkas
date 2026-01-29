"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Calendar, Upload, Eye, EyeOff } from "lucide-react";

export default function OfflineTutorDashboard() {
  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? "Good Morning" : 
                   currentTime.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            {greeting}, Tutor Name
          </h1>
          <p className="text-blue-100 text-sm sm:text-base">
            Offline Portal - Tutor Dashboard
          </p>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Students", value: "85", icon: Users, color: "from-blue-500 to-indigo-500" },
            { label: "Materials", value: "24", icon: FileText, color: "from-blue-500 to-cyan-500" },
            { label: "Attendance", value: "92%", icon: Calendar, color: "from-purple-500 to-pink-500" },
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
            <CardTitle>Content Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Module 1 Notes", visible: true, downloadable: true },
                { title: "Module 2 Slides", visible: true, downloadable: false },
                { title: "Reference Materials", visible: false, downloadable: true },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {item.visible ? (
                      <Eye className="h-4 w-4 text-blue-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span>{item.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      {item.visible ? "Hide" : "Show"}
                    </Button>
                    <Button size="sm" variant="outline">
                      {item.downloadable ? "Disable Download" : "Enable Download"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

