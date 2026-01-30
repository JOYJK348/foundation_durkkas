"use client";

import { motion } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FileText,
    Search,
    Filter,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BranchAssignments() {
    const [searchQuery, setSearchQuery] = useState("");

    // Mock data - replace with API call
    const assignments = [
        {
            id: 1,
            title: "React Hooks Assignment",
            course: "Full Stack Development",
            dueDate: "2026-02-05",
            submissions: 15,
            totalStudents: 22,
            status: "Active"
        },
        {
            id: 2,
            title: "Python Data Analysis Project",
            course: "Data Science",
            dueDate: "2026-02-08",
            submissions: 8,
            totalStudents: 18,
            status: "Active"
        },
        {
            id: 3,
            title: "UI/UX Design Challenge",
            course: "UI/UX Design",
            dueDate: "2026-01-28",
            submissions: 12,
            totalStudents: 12,
            status: "Completed"
        },
    ];

    const filteredAssignments = assignments.filter(assignment =>
        assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.course?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Assignments
                    </h1>
                    <p className="text-gray-600">Manage and track all your assignments</p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total", value: "12", icon: FileText, color: "blue" },
                        { label: "Active", value: "8", icon: Clock, color: "orange" },
                        { label: "Completed", value: "4", icon: CheckCircle, color: "green" },
                        { label: "Overdue", value: "0", icon: XCircle, color: "red" },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                                            <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Search and Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 mb-6"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search assignments..."
                            className="pl-10 h-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            Create Assignment
                        </Button>
                    </div>
                </motion.div>

                {/* Assignments List */}
                <div className="space-y-4">
                    {filteredAssignments.map((assignment, index) => (
                        <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                        >
                            <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">
                                                        {assignment.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{assignment.course}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${assignment.status === 'Active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {assignment.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4" />
                                                    {assignment.submissions}/{assignment.totalStudents} submitted
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                                                View Submissions
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredAssignments.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No assignments found</p>
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
