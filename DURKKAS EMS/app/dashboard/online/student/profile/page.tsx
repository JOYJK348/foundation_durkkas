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
  Globe,
  MapPin,
  GraduationCap,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "activity">("profile");
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    course: "Web Development - Full Stack",
    enrollmentDate: "Dec 1, 2024",
    studentId: "STU2024001",
    address: "123 Main Street, City, State - 123456",
    dateOfBirth: "Jan 15, 2000",
    gender: "Male",
  });

  const stats = {
    coursesCompleted: 3,
    assignmentsSubmitted: 12,
    assessmentsCompleted: 8,
    attendancePercentage: 85,
  };

  const recentActivity = [
    { action: "Submitted Assignment", item: "React Component Assignment", time: "2 hours ago", type: "assignment" },
    { action: "Completed Assessment", item: "Module 2 Assessment", time: "1 day ago", type: "assessment" },
    { action: "Marked Attendance", item: "Today's Class", time: "2 days ago", type: "attendance" },
    { action: "Raised Doubt", item: "React Hooks Question", time: "3 days ago", type: "doubt" },
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
    // Reset to original values if needed
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
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
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
                      <User className="h-16 w-16 text-white" />
                    </div>
                    {isEditing && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                      >
                        <Camera className="h-5 w-5 text-white" />
                      </motion.button>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{profile.name}</h1>
                        <p className="text-blue-100 text-lg mb-1">{profile.course}</p>
                        <p className="text-blue-200 text-sm">Student ID: {profile.studentId}</p>
                      </div>
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            className="bg-white text-blue-600 hover:bg-blue-50"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
                        <div className="text-sm text-blue-100">Courses</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold">{stats.assignmentsSubmitted}</div>
                        <div className="text-sm text-blue-100">Assignments</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold">{stats.assessmentsCompleted}</div>
                        <div className="text-sm text-blue-100">Assessments</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold">{stats.attendancePercentage}%</div>
                        <div className="text-sm text-blue-100">Attendance</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "settings", label: "Settings", icon: Shield },
              { id: "activity", label: "Activity", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
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
                className="space-y-6"
              >
                {/* Personal Information */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</label>
                        {isEditing ? (
                          <Input
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="border-gray-300 focus:border-blue-600"
                          />
                        ) : (
                          <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                            {profile.name}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </label>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="border-gray-300 focus:border-blue-600"
                          />
                        ) : (
                          <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                            {profile.email}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </label>
                        {isEditing ? (
                          <Input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="border-gray-300 focus:border-blue-600"
                          />
                        ) : (
                          <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                            {profile.phone}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </label>
                        {isEditing ? (
                          <Input
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            className="border-gray-300 focus:border-blue-600"
                          />
                        ) : (
                          <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                            {profile.address}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date of Birth
                        </label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={profile.dateOfBirth}
                            onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                            className="border-gray-300 focus:border-blue-600"
                          />
                        ) : (
                          <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                            {profile.dateOfBirth}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Gender</label>
                        {isEditing ? (
                          <Input
                            value={profile.gender}
                            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                            className="border-gray-300 focus:border-blue-600"
                          />
                        ) : (
                          <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                            {profile.gender}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                      </div>
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Current Course
                        </label>
                        <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                          {profile.course}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Enrollment Date
                        </label>
                        <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                          {profile.enrollmentDate}
                        </div>
                      </div>
                    </div>
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
                className="space-y-6"
              >
                {/* Notification Settings */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Bell className="h-6 w-6 text-green-600" />
                      </div>
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Email Notifications", description: "Receive updates via email" },
                      { label: "Push Notifications", description: "Get instant alerts on your device" },
                      { label: "Assignment Reminders", description: "Reminders for upcoming assignments" },
                      { label: "Assessment Alerts", description: "Notifications for new assessments" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-blue-600 relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-red-600" />
                      </div>
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      Privacy Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "activity" && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            activity.type === "assignment" ? "bg-blue-100" :
                            activity.type === "assessment" ? "bg-green-100" :
                            activity.type === "attendance" ? "bg-purple-100" :
                            "bg-orange-100"
                          }`}>
                            {activity.type === "assignment" ? (
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            ) : activity.type === "assessment" ? (
                              <Award className="h-5 w-5 text-green-600" />
                            ) : activity.type === "attendance" ? (
                              <CheckCircle2 className="h-5 w-5 text-purple-600" />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.item}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
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

