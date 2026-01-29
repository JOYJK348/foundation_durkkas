"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { MarkAttendanceSheet } from "@/components/attendance/mark-attendance-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/navigation/back-button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

export default function AttendancePage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [todayMarked, setTodayMarked] = useState(false);
  const { toast } = useToast();

  // Generate more comprehensive attendance data
  const generateAttendanceData = () => {
    const data = [];
    const today = new Date();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(selectedYear, selectedMonth, i);
      if (date > today) break; // Don't show future dates
      
      const dayOfWeek = date.getDay();
      // Skip weekends for demo (you can adjust this)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      const status = Math.random() > 0.15 ? "present" : "absent";
      const time = status === "present" ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM` : "-";
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        status,
        time,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    
    return data.reverse(); // Most recent first
  };

  const attendanceData = generateAttendanceData();

  const stats = {
    total: 30,
    present: 25,
    absent: 5,
    percentage: 83.3,
    onTime: 22,
    late: 3,
  };

  const monthlyStats = {
    total: attendanceData.length,
    present: attendanceData.filter((a) => a.status === "present").length,
    absent: attendanceData.filter((a) => a.status === "absent").length,
    percentage: attendanceData.length > 0 
      ? (attendanceData.filter((a) => a.status === "present").length / attendanceData.length) * 100 
      : 0,
  };

  const filteredData = attendanceData.filter((item) =>
    item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.day.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (selectedMonth === 11) {
      if (selectedYear < today.getFullYear() || (selectedYear === today.getFullYear() && selectedMonth < today.getMonth())) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      }
    } else {
      if (selectedYear < today.getFullYear() || (selectedYear === today.getFullYear() && selectedMonth < today.getMonth())) {
        setSelectedMonth(selectedMonth + 1);
      }
    }
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
                <p className="text-gray-600">View your daily attendance and statistics</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={() => setShowMarkAttendance(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
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
                  Calendar View
                </Button>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                className="border-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {monthNames[selectedMonth]} {selectedYear}
                </h2>
                <p className="text-sm text-gray-600">Current Month</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()}
                className="border-gray-300 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by date or day..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
          </motion.div>

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Classes</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
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
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Present</p>
                      <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
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
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Absent</p>
                      <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-red-600" />
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
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Attendance %</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.percentage}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Monthly Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                  {monthNames[selectedMonth]} {selectedYear} Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{monthlyStats.total}</div>
                    <div className="text-sm text-gray-600">Total Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">{monthlyStats.present}</div>
                    <div className="text-sm text-gray-600">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{Math.round(monthlyStats.percentage)}%</div>
                    <div className="text-sm text-gray-600">Attendance Rate</div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Monthly Progress</span>
                    <span className="text-sm font-semibold text-gray-900">{Math.round(monthlyStats.percentage)}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${monthlyStats.percentage}%` }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendance List/Calendar View */}
          {viewMode === "list" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    Attendance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredData.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No attendance records found.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredData.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          className="flex items-center justify-between p-5 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              item.status === "present" 
                                ? "bg-green-100 group-hover:bg-green-200" 
                                : "bg-red-100 group-hover:bg-red-200"
                            } transition-colors`}>
                              {item.status === "present" ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-semibold text-lg text-gray-900">{item.date}</span>
                                <span className="text-sm text-gray-500">({item.day})</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                {item.status === "present" ? (
                                  <>
                                    <Clock className="h-4 w-4" />
                                    <span>Marked at {item.time}</span>
                                  </>
                                ) : (
                                  <span className="text-red-600">Absent</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                              item.status === "present"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                            }`}
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CalendarDays className="h-6 w-6 text-blue-600" />
                    </div>
                    Calendar View
                  </CardTitle>
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
                    {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }).map((_, i) => {
                      const date = new Date(selectedYear, selectedMonth, i + 1);
                      const today = new Date();
                      const isToday = date.toDateString() === today.toDateString();
                      const isFuture = date > today;
                      const attendanceRecord = attendanceData.find(
                        (a) => a.fullDate && a.fullDate.toDateString() === date.toDateString()
                      );
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + i * 0.01 }}
                          className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 ${
                            isToday
                              ? "border-blue-600 bg-blue-50"
                              : attendanceRecord
                              ? attendanceRecord.status === "present"
                                ? "border-green-300 bg-green-50"
                                : "border-red-300 bg-red-50"
                              : isFuture
                              ? "border-gray-200 bg-gray-50 opacity-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <span className={`text-sm font-semibold mb-1 ${
                            isToday ? "text-blue-600" : "text-gray-700"
                          }`}>
                            {i + 1}
                          </span>
                          {attendanceRecord && (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-green-300 bg-green-50" />
                      <span className="text-sm text-gray-600">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-red-300 bg-red-50" />
                      <span className="text-sm text-gray-600">Absent</span>
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
              // Refresh attendance data
              window.location.reload();
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

