"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/navigation/back-button";
import { useToast } from "@/components/ui/use-toast";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { navigateWithLoading } from "@/lib/utils/navigation";
import {
  User,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  Camera,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Shield,
  Bell,
  Lock,
  MapPin,
  GraduationCap,
  Clock,
  CheckCircle2,
  Download,
  FileText,
  CheckCircle,
} from "lucide-react";

export default function OfflineProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "downloads">("profile");
  const { toast } = useToast();
  const user = useAppStore((state) => state.user);
  
  const [profile, setProfile] = useState({
    name: user?.name || "Student Name",
    email: user?.email || "student@example.com",
    phone: "+91 9876543210",
    course: "Web Development - Full Stack",
    enrollmentDate: "Dec 1, 2024",
    studentId: "STU2024001",
    address: "123 Main Street, City, State - 123456",
    dateOfBirth: "Jan 15, 2000",
    gender: "Male",
    accessValidUntil: "Dec 2025",
  });

  const offlineStats = {
    materialsDownloaded: 24,
    attendancePercentage: 85,
    coursesEnrolled: 5,
    totalDownloads: 12,
  };

  const recentDownloads = [
    { name: "Module 1 Notes.pdf", date: "Dec 15, 2024", size: "2.4 MB" },
    { name: "Practice Exercises.zip", date: "Dec 14, 2024", size: "5.2 MB" },
    { name: "Reference Guide.pdf", date: "Dec 12, 2024", size: "1.8 MB" },
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
        <TopNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton />
          </div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
                      <User className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                        <Camera className="h-4 w-4 text-blue-600" />
                      </button>
                    )}
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        {isEditing ? (
                          <Input
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="text-2xl sm:text-3xl font-bold mb-2 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                          />
                        ) : (
                          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{profile.name}</h1>
                        )}
                        <div className="flex items-center gap-2 text-blue-100 text-sm sm:text-base">
                          <CheckCircle className="h-4 w-4" />
                          <span>Offline Learning Portal - Access Valid Until {profile.accessValidUntil}</span>
                        </div>
                      </div>
                      {!isEditing ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="text-white hover:bg-white/20"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSave}
                            className="text-white hover:bg-white/20"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="text-white hover:bg-white/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Materials", value: offlineStats.materialsDownloaded, icon: FileText },
                        { label: "Attendance", value: `${offlineStats.attendancePercentage}%`, icon: CheckCircle2 },
                        { label: "Downloads", value: offlineStats.totalDownloads, icon: Download },
                        { label: "Courses", value: offlineStats.coursesEnrolled, icon: BookOpen },
                      ].map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
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
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "settings", label: "Settings", icon: Shield },
              { id: "downloads", label: "Downloads", icon: Download },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 font-semibold"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Student ID", value: profile.studentId, icon: GraduationCap },
                      { label: "Email", value: profile.email, icon: Mail, editable: true },
                      { label: "Phone", value: profile.phone, icon: Phone, editable: true },
                      { label: "Date of Birth", value: profile.dateOfBirth, icon: Calendar },
                      { label: "Gender", value: profile.gender, icon: User },
                    ].map((field, index) => {
                      const Icon = field.icon;
                      return (
                        <motion.div
                          key={field.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">{field.label}</div>
                            {isEditing && field.editable ? (
                              <Input
                                value={field.value}
                                onChange={(e) => setProfile({ ...profile, [field.label.toLowerCase().replace(" ", "")]: e.target.value })}
                                className="h-8 text-sm"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{field.value}</div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Enrolled Course", value: profile.course, icon: BookOpen },
                      { label: "Enrollment Date", value: profile.enrollmentDate, icon: Calendar },
                      { label: "Access Valid Until", value: profile.accessValidUntil, icon: Award },
                      { label: "Address", value: profile.address, icon: MapPin, editable: true },
                    ].map((field, index) => {
                      const Icon = field.icon;
                      return (
                        <motion.div
                          key={field.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">{field.label}</div>
                            {isEditing && field.editable ? (
                              <Input
                                value={field.value}
                                onChange={(e) => setProfile({ ...profile, [field.label.toLowerCase().replace(" ", "")]: e.target.value })}
                                className="h-8 text-sm"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{field.value}</div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Notifications", description: "Receive email notifications", icon: Bell },
                      { label: "Privacy", description: "Manage your privacy settings", icon: Shield },
                      { label: "Security", description: "Change password and security settings", icon: Lock },
                    ].map((setting, index) => {
                      const Icon = setting.icon;
                      return (
                        <motion.div
                          key={setting.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">{setting.label}</div>
                              <div className="text-sm text-gray-500">{setting.description}</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                            Manage
                          </Button>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "downloads" && (
              <motion.div
                key="downloads"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Recent Downloads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentDownloads.map((download, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">{download.name}</div>
                              <div className="text-xs text-gray-500">{download.date} • {download.size}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50">
                            View
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        navigateWithLoading(router, "/dashboard/offline/student/downloads");
                      }}
                    >
                      View All Downloads
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}

