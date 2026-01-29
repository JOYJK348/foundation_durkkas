"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { RaiseDoubtSheet } from "@/components/dashboard/raise-doubt-sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/navigation/back-button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

export default function DoubtSessionsPage() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDoubtSheet, setShowDoubtSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "scheduled" | "completed" | "pending">("all");

  const doubtSessions = [
    {
      id: 1,
      topic: "React Hooks - useState vs useEffect",
      type: "live",
      status: "scheduled",
      scheduledTime: "Dec 20, 2024 at 4:00 PM",
      tutor: "Dr. John Smith",
    },
    {
      id: 2,
      topic: "API Integration Best Practices",
      type: "chat",
      status: "completed",
      completedDate: "Dec 15, 2024",
      tutor: "Dr. Jane Doe",
    },
    {
      id: 3,
      topic: "Database Optimization",
      type: "request",
      status: "pending",
      requestedDate: "Dec 18, 2024",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredSessions = doubtSessions.filter((session) => {
    const matchesSearch = session.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (session.tutor && session.tutor.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === "all" || session.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = doubtSessions.filter((s) => s.status === "pending").length;
  const scheduledCount = doubtSessions.filter((s) => s.status === "scheduled").length;

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
                  Doubt Sessions
                </h1>
                <p className="text-gray-600">Request and attend live doubt clearing sessions</p>
              </div>
              <Button 
                onClick={() => setShowDoubtSheet(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Session
              </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search doubts, tutors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "scheduled", "completed", "pending"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={filterStatus === status ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                      <p className="text-3xl font-bold text-gray-900">{doubtSessions.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
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
                      <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                      <p className="text-3xl font-bold text-blue-600">{scheduledCount}</p>
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
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending</p>
                      <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Doubt Sessions List */}
          <div className="space-y-4">
            {filteredSessions.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No doubt sessions found matching your criteria.</p>
                  <Button 
                    onClick={() => setShowDoubtSheet(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Request New Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white group">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              session.type === "live" 
                                ? "bg-red-100" 
                                : session.type === "chat"
                                ? "bg-blue-100"
                                : "bg-orange-100"
                            }`}>
                              {session.type === "live" ? (
                                <Video className="h-7 w-7 text-red-600" />
                              ) : session.type === "chat" ? (
                                <MessageSquare className="h-7 w-7 text-blue-600" />
                              ) : (
                                <AlertCircle className="h-7 w-7 text-orange-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {session.topic}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                {session.status === "scheduled" && (
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {session.scheduledTime}
                                  </span>
                                )}
                                {session.status === "completed" && (
                                  <span className="flex items-center gap-1.5 text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Completed: {session.completedDate}
                                  </span>
                                )}
                                {session.status === "pending" && (
                                  <span className="flex items-center gap-1.5 text-orange-600">
                                    <Clock className="h-4 w-4" />
                                    Requested: {session.requestedDate}
                                  </span>
                                )}
                                {session.tutor && (
                                  <span className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" />
                                    {session.tutor}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  session.type === "live" 
                                    ? "bg-red-100 text-red-700" 
                                    : session.type === "chat"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}>
                                  {session.type === "live" ? "Live Video" : session.type === "chat" ? "Chat Based" : "Request"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-end sm:items-end gap-3">
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 whitespace-nowrap ${getStatusColor(
                              session.status
                            )}`}
                          >
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </span>
                          {session.status === "scheduled" && (
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Video className="h-4 w-4 mr-2" />
                              Join Session
                            </Button>
                          )}
                          {session.status === "pending" && (
                            <Button variant="outline" disabled className="border-gray-300">
                              <Clock className="h-4 w-4 mr-2" />
                              Waiting for Approval
                            </Button>
                          )}
                          {session.status === "completed" && (
                            <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Raise Doubt Sheet */}
      <RaiseDoubtSheet
        isOpen={showDoubtSheet}
        onClose={() => setShowDoubtSheet(false)}
        onSubmit={(data) => {
          console.log("Doubt submitted:", data);
          setShowDoubtSheet(false);
        }}
      />
    </DashboardLayout>
  );
}

