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
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Search,
  Filter,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useState } from "react";

export default function AssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed" | "upcoming">("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null);
  const { toast } = useToast();
  
  const assessments = [
    {
      id: 1,
      title: "Module 1 Assessment - Fundamentals",
      type: "MCQ",
      duration: "30 minutes",
      status: "completed",
      score: "85/100",
      dueDate: "Dec 20, 2024",
    },
    {
      id: 2,
      title: "Module 2 Assessment - Advanced Concepts",
      type: "MCQ + Short Answer",
      duration: "45 minutes",
      status: "active",
      dueDate: "Dec 25, 2024",
    },
    {
      id: 3,
      title: "Final Assessment",
      type: "Case Study",
      duration: "60 minutes",
      status: "upcoming",
      dueDate: "Jan 5, 2025",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "upcoming":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5" />;
      case "active":
        return <Clock className="h-5 w-5" />;
      case "upcoming":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || assessment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
                Assessments
              </h1>
              <p className="text-gray-600">Test your knowledge and track your progress</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "active", "completed", "upcoming"] as const).map((status) => (
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
                      <p className="text-sm text-gray-600 mb-1">Total Assessments</p>
                      <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <ClipboardCheck className="h-6 w-6 text-blue-600" />
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
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-3xl font-bold text-green-600">
                        {assessments.filter((a) => a.status === "completed").length}
                      </p>
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
                      <p className="text-sm text-gray-600 mb-1">Average Score</p>
                      <p className="text-3xl font-bold text-blue-600">85%</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Assessments List */}
          <div className="space-y-4">
            {filteredAssessments.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No assessments found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredAssessments.map((assessment, index) => (
                <motion.div
                  key={assessment.id}
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
                              assessment.status === "completed" 
                                ? "bg-green-100" 
                                : assessment.status === "active"
                                ? "bg-blue-100"
                                : "bg-orange-100"
                            }`}>
                              <ClipboardCheck className={`h-7 w-7 ${
                                assessment.status === "completed" 
                                  ? "text-green-600" 
                                  : assessment.status === "active"
                                  ? "text-blue-600"
                                  : "text-orange-600"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {assessment.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" />
                                  {assessment.duration}
                                </span>
                                <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-medium">
                                  {assessment.type}
                                </span>
                                <span>Due: {assessment.dueDate}</span>
                              </div>
                              {assessment.status === "completed" && assessment.score && (
                                <div className="flex items-center gap-2 text-green-600 font-semibold">
                                  <CheckCircle2 className="h-5 w-5" />
                                  <span>Score: {assessment.score}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-end sm:items-end gap-3">
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 whitespace-nowrap ${getStatusColor(
                              assessment.status
                            )}`}
                          >
                            {getStatusIcon(assessment.status)}
                            {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                          </span>
                          {assessment.status === "active" && assessment.type.includes("Short Answer") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAssessment(assessment.id);
                                setShowUploadModal(true);
                              }}
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Answer
                            </Button>
                          )}
                          <Button
                            variant={assessment.status === "active" ? "default" : "outline"}
                            disabled={assessment.status === "upcoming"}
                            className={assessment.status === "active" ? "bg-blue-600 hover:bg-blue-700" : ""}
                            size="sm"
                          >
                            {assessment.status === "completed"
                              ? "View Results"
                              : assessment.status === "active"
                              ? "Start Assessment"
                              : "Not Available"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* File Upload Modal for Assessments */}
          <FileUploadModal
            isOpen={showUploadModal}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedAssessment(null);
            }}
            onSubmit={async (files) => {
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 2000));
              
              // In production, send files to backend
              console.log("Submitting assessment:", selectedAssessment, files);
              
              toast({
                title: "Assessment Submitted!",
                description: `Your assessment answers have been uploaded successfully with ${files.length} file(s)`,
              });
            }}
            title="Upload Assessment Answers"
            description="Upload your assessment answer files (PDF, Word, or images)"
            acceptedFileTypes={[".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]}
            maxFileSize={10}
            maxFiles={3}
            allowMultiple={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

