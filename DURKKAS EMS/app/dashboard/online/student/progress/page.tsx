"use client";

import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/navigation/back-button";
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Target,
  BarChart3,
  Calendar,
} from "lucide-react";

export default function ProgressPage() {
  const overallProgress = 68;
  const moduleProgress = [
    { name: "Introduction", progress: 100, completed: true },
    { name: "Fundamentals", progress: 85, completed: false },
    { name: "Advanced Topics", progress: 45, completed: false },
    { name: "Projects", progress: 20, completed: false },
  ];

  const assessmentScores = [
    { name: "Module 1 Assessment", score: 85, maxScore: 100 },
    { name: "Module 2 Assessment", score: 92, maxScore: 100 },
    { name: "Final Assessment", score: 0, maxScore: 100, pending: true },
  ];

  const averageScore = assessmentScores
    .filter((a) => !a.pending)
    .reduce((acc, a) => acc + (a.score / a.maxScore) * 100, 0) / 
    assessmentScores.filter((a) => !a.pending).length || 0;

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
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
              Progress Tracking
            </h1>
            <p className="text-gray-600">Monitor your learning journey and achievements</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
                      <p className="text-3xl font-bold text-blue-600">{overallProgress}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
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
                      <p className="text-sm text-gray-600 mb-1">Modules Completed</p>
                      <p className="text-3xl font-bold text-green-600">
                        {moduleProgress.filter((m) => m.completed).length}/{moduleProgress.length}
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
                      <p className="text-3xl font-bold text-purple-600">{Math.round(averageScore)}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-600" />
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
                      <p className="text-sm text-gray-600 mb-1">Assessments</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {assessmentScores.filter((a) => !a.pending).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Overall Progress Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="relative w-64 h-64">
                    <svg className="transform -rotate-90 w-64 h-64">
                      <circle
                        cx="128"
                        cy="128"
                        r="112"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200"
                      />
                      <motion.circle
                        cx="128"
                        cy="128"
                        r="112"
                        stroke="#2563eb"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 112}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 112 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 112 * (1 - overallProgress / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1, type: "spring" }}
                          className="text-5xl font-bold text-blue-600 mb-2"
                        >
                          {overallProgress}%
                        </motion.div>
                        <div className="text-sm text-gray-600">Overall Progress</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 flex-1 max-w-md">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Course Completion</span>
                        <span className="font-semibold text-gray-900">{overallProgress}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${overallProgress}%` }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Modules</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {moduleProgress.filter((m) => m.completed).length}/{moduleProgress.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Assessments</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {assessmentScores.filter((a) => !a.pending).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Module Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  Module Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {moduleProgress.map((module, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {module.completed ? (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                          </div>
                        )}
                        <span className="font-semibold text-lg text-gray-900">{module.name}</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{module.progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${module.progress}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Assessment Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  Assessment Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessmentScores.map((assessment, index) => {
                  const scorePercent = assessment.pending ? 0 : (assessment.score / assessment.maxScore) * 100;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="p-5 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-gray-900 mb-1">
                            {assessment.name}
                          </div>
                          {assessment.pending ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Pending</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Score: {assessment.score}/{assessment.maxScore}</span>
                              <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 font-medium">
                                {scorePercent >= 80 ? "Excellent" : scorePercent >= 60 ? "Good" : "Needs Improvement"}
                              </span>
                            </div>
                          )}
                        </div>
                        {!assessment.pending && (
                          <div className="flex flex-col items-end">
                            <div className="text-3xl font-bold text-purple-600 mb-1">
                              {assessment.score}%
                            </div>
                            <div className="w-16 h-16 relative">
                              <svg className="transform -rotate-90 w-16 h-16">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  className="text-gray-200"
                                />
                                <motion.circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke={scorePercent >= 80 ? "#10b981" : scorePercent >= 60 ? "#3b82f6" : "#f59e0b"}
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 28}`}
                                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                                  animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - scorePercent / 100) }}
                                  transition={{ duration: 1, delay: 1.3 + index * 0.1 }}
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {!assessment.pending && (
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${scorePercent}%` }}
                            transition={{ duration: 1, delay: 1.3 + index * 0.1 }}
                            className={`h-full rounded-full ${
                              scorePercent >= 80 ? "bg-green-600" : scorePercent >= 60 ? "bg-blue-600" : "bg-orange-600"
                            }`}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

