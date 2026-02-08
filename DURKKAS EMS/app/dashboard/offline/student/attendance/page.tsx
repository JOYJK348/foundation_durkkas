"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { MarkAttendanceSheet } from "@/components/attendance/mark-attendance-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/navigation/back-button";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  CalendarDays,
  BarChart3,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UserCheck,
  MapPin,
  BookOpen,
} from "lucide-react";

export default function OfflineAttendancePage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [todayMarked, setTodayMarked] = useState(false);
  const { toast } = useToast();

  // Generate attendance data
  const generateAttendanceData = () => {
    const data = [];
    const today = new Date();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;

      if (!isWeekend && isPast) {
        data.push({
          date: day,
          status: Math.random() > 0.2 ? "present" : "absent",
          time: Math.random() > 0.2 ? `${9 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")} AM` : null,
          class: "Offline Class",
          location: "Room 201",
        });
      } else if (isToday) {
        data.push({
          date: day,
          status: todayMarked ? "present" : "pending",
          time: todayMarked ? new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : null,
          class: "Offline Class",
          location: "Room 201",
        });
      }
    }
    return data;
  };

  const attendanceData = generateAttendanceData();
  const presentCount = attendanceData.filter((a) => a.status === "present").length;
  const absentCount = attendanceData.filter((a) => a.status === "absent").length;
  const totalClasses = attendanceData.length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                  Attendance Tracker
                </h1>
                <p className="text-gray-600">Track your attendance for offline classes</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={() => setShowMarkAttendance(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  disabled={todayMarked}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {todayMarked ? "Already Marked Today" : "Mark Attendance"}
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  List View
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className={viewMode === "calendar" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Classes", value: totalClasses, icon: Calendar, color: "from-blue-500 to-cyan-500" },
                { label: "Present", value: presentCount, icon: CheckCircle2, color: "from-blue-500 to-indigo-500" },
                { label: "Absent", value: absentCount, icon: XCircle, color: "from-red-500 to-pink-500" },
                { label: "Attendance", value: `${attendancePercentage}%`, icon: TrendingUp, color: "from-purple-500 to-indigo-500" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-4 sm:p-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Attendance List View */}
          {viewMode === "list" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Attendance Records</CardTitle>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attendanceData
                      .filter((record) =>
                        searchQuery === "" ||
                        record.date.toString().includes(searchQuery) ||
                        record.class.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((record, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            record.status === "present"
                              ? "bg-blue-50 border-blue-200"
                              : record.status === "absent"
                              ? "bg-red-50 border-red-200"
                              : "bg-yellow-50 border-yellow-200"
                          }`}
                        >
                          <div className="flex items-center gap-4 mb-3 sm:mb-0">
                            <div
                              className={`p-3 rounded-lg ${
                                record.status === "present"
                                  ? "bg-blue-100 text-blue-700"
                                  : record.status === "absent"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {record.status === "present" ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : record.status === "absent" ? (
                                <XCircle className="h-5 w-5" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 mb-1">
                                {monthNames[selectedMonth]} {record.date}, {selectedYear}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{record.class}</span>
                                </div>
                                {record.time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{record.time}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{record.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                record.status === "present"
                                  ? "bg-blue-100 text-blue-700"
                                  : record.status === "absent"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {record.status === "present"
                                ? "Present"
                                : record.status === "absent"
                                ? "Absent"
                                : "Pending"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Calendar View */}
          {viewMode === "calendar" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Calendar View</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousMonth}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 font-semibold min-w-[200px] text-center">
                        {monthNames[selectedMonth]} {selectedYear}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextMonth}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }).map((_, i) => {
                      const day = i + 1;
                      const record = attendanceData.find((r) => r.date === day);
                      const isToday =
                        day === new Date().getDate() &&
                        selectedMonth === new Date().getMonth() &&
                        selectedYear === new Date().getFullYear();

                      return (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.01 }}
                          className={`aspect-square p-2 rounded-lg border-2 flex flex-col items-center justify-center text-sm ${
                            record?.status === "present"
                              ? "bg-blue-100 border-blue-300"
                              : record?.status === "absent"
                              ? "bg-red-100 border-red-300"
                              : record?.status === "pending"
                              ? "bg-yellow-100 border-yellow-300"
                              : "bg-gray-50 border-gray-200"
                          } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                        >
                          <span className={`font-semibold ${isToday ? "text-blue-600" : ""}`}>{day}</span>
                          {record && (
                            <div className="mt-1">
                              {record.status === "present" ? (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              ) : record.status === "absent" ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-blue-300 bg-blue-50" />
                      <span className="text-sm text-gray-600">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-red-300 bg-red-50" />
                      <span className="text-sm text-gray-600">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-yellow-300 bg-yellow-50" />
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-50" />
                      <span className="text-sm text-gray-600">Today</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

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
        </div>
      </div>
    </DashboardLayout>
  );
}

