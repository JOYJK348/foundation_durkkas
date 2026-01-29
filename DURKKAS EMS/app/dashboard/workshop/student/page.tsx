"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  FileText,
  Award,
  Download,
  MessageSquare,
  Clock,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function WorkshopStudentDashboard() {
  const router = useRouter();
  const clearUser = useAppStore((state) => state.clearUser);
  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? "Good Morning" : 
                   currentTime.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 sm:p-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {greeting}, Student Name
              </h1>
              <p className="text-orange-100 text-sm sm:text-base">
                Workshop Portal
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Workshop Details */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              AI & Machine Learning Workshop
            </CardTitle>
            <CardDescription>Dec 20, 2024 • 10:00 AM - 4:00 PM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Trainer</div>
                  <div className="font-medium">Dr. John Smith</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">6 Hours</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workshop Materials */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Workshop Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Workshop Slides", type: "PPT" },
                { title: "Handout Notes", type: "PDF" },
                { title: "Code Examples", type: "ZIP" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.type}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certificate & Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Certificate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                <div className="font-medium mb-2">Certificate Available</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Download your workshop completion certificate
                </div>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Share your feedback about the workshop
                </p>
                <Button variant="outline" className="w-full">
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

