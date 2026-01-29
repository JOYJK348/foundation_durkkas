"use client";

import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { FileUploadModal } from "@/components/submissions/file-upload-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/navigation/back-button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Search,
  Calendar,
  Award,
} from "lucide-react";
import { useState } from "react";

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "pending" | "not_started">("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const { toast } = useToast();
  
  const assignments = [
    {
      id: 1,
      title: "React Component Assignment",
      description: "Create a reusable React component with props and state management",
      status: "submitted",
      dueDate: "Dec 18, 2024",
      submittedDate: "Dec 17, 2024",
      grade: "A",
    },
    {
      id: 2,
      title: "API Integration Project",
      description: "Build a project that integrates with a REST API",
      status: "pending",
      dueDate: "Dec 22, 2024",
    },
    {
      id: 3,
      title: "Database Design Assignment",
      description: "Design and implement a database schema for an e-commerce application",
      status: "not_started",
      dueDate: "Dec 28, 2024",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "not_started":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = assignments.filter((a) => a.status === "pending" || a.status === "not_started").length;
  const submittedCount = assignments.filter((a) => a.status === "submitted").length;

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
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                Assignments
              </h1>
              <p className="text-gray-600">Download, complete, and submit your assignments</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "submitted", "pending", "not_started"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={filterStatus === status ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {status === "not_started" ? "Not Started" : status.charAt(0).toUpperCase() + status.slice(1)}
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
                      <p className="text-sm text-gray-600 mb-1">Total Assignments</p>
                      <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Submitted</p>
                      <p className="text-3xl font-bold text-green-600">{submittedCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {filteredAssignments.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No assignments found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
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
                              assignment.status === "submitted" 
                                ? "bg-green-100" 
                                : assignment.status === "pending"
                                ? "bg-orange-100"
                                : "bg-gray-100"
                            }`}>
                              <FileText className={`h-7 w-7 ${
                                assignment.status === "submitted" 
                                  ? "text-green-600" 
                                  : assignment.status === "pending"
                                  ? "text-orange-600"
                                  : "text-gray-600"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {assignment.title}
                              </h3>
                              <p className="text-gray-600 mb-4 leading-relaxed">{assignment.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  Due: {assignment.dueDate}
                                </span>
                                {assignment.status === "submitted" && (
                                  <>
                                    <span className="flex items-center gap-1.5 text-green-600 font-medium">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Submitted: {assignment.submittedDate}
                                    </span>
                                    {assignment.grade && (
                                      <span className="flex items-center gap-1.5 font-semibold text-blue-600">
                                        <Award className="h-4 w-4" />
                                        Grade: {assignment.grade}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-end sm:items-end gap-3">
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 whitespace-nowrap ${getStatusColor(
                              assignment.status
                            )}`}
                          >
                            {assignment.status === "submitted" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : assignment.status === "pending" ? (
                              <Clock className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            {assignment.status
                              .split("_")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            {assignment.status !== "submitted" && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                  setSelectedAssignment(assignment.id);
                                  setShowUploadModal(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Submit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* File Upload Modal */}
          <FileUploadModal
            isOpen={showUploadModal}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedAssignment(null);
            }}
            onSubmit={async (files) => {
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 2000));
              
              // In production, send files to backend
              console.log("Submitting assignment:", selectedAssignment, files);
              
              toast({
                title: "Assignment Submitted!",
                description: `Your assignment has been submitted successfully with ${files.length} file(s)`,
              });
            }}
            title="Submit Assignment"
            description="Upload your completed assignment files"
            acceptedFileTypes={[".pdf", ".doc", ".docx", ".zip", ".rar", ".jpg", ".jpeg", ".png"]}
            maxFileSize={20}
            maxFiles={5}
            allowMultiple={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

