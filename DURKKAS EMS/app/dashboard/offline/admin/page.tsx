"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp } from "lucide-react";

export default function OfflineAdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-100">Offline Portal</p>
        </div>
      </div>
      <div className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Offline Portal Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">45</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">92%</div>
                <div className="text-sm text-muted-foreground">Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

