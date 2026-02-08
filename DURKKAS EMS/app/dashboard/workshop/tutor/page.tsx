"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, Award } from "lucide-react";

export default function WorkshopTutorDashboard() {
  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? "Good Morning" : 
                   currentTime.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 sm:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            {greeting}, Tutor Name
          </h1>
          <p className="text-orange-100 text-sm sm:text-base">
            Workshop Portal - Tutor Dashboard
          </p>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Participants", value: "45", icon: Users, color: "from-orange-500 to-red-500" },
            { label: "Workshops", value: "3", icon: Calendar, color: "from-blue-500 to-cyan-500" },
            { label: "Materials", value: "12", icon: FileText, color: "from-purple-500 to-pink-500" },
            { label: "Certificates", value: "38", icon: Award, color: "from-green-500 to-emerald-500" },
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
            <CardTitle>Upcoming Workshops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Workshop {i}</div>
                  <div className="text-sm text-muted-foreground">Dec {20 + i}, 2024</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

