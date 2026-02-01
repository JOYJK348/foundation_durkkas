"use client";

import { useState, useEffect } from "react";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Users,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Assignment {
    id: number;
    assignment_title: string;
    assignment_description: string;
    course_id: number;
    max_marks: number;
    deadline: string;
    is_active: boolean;
    courses?: {
        course_name: string;
        course_code: string;
    };
    submissions_count?: number;
}

export default function TutorAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/assignments");
            if (response.data.success) {
                setAssignments(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Error fetching assignments:", error);
            toast.error(error.response?.data?.message || "Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter((assignment) =>
        assignment.assignment_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            Assignments
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage student tasks and evaluations
                        </p>
                    </div>
                    <Link href="/ems/tutor/assignments/create">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            New Assignment
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search assignments..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Assignments Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600">Loading assignments...</span>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <FileText className="h-20 w-20 text-blue-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Assignments Found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start by creating an assignment for your courses
                            </p>
                            <Link href="/ems/tutor/assignments/create">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Assignment
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAssignments.map((assignment) => (
                            <motion.div
                                key={assignment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FileText className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${new Date(assignment.deadline) < new Date()
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {new Date(assignment.deadline) < new Date()
                                                    ? "Expired"
                                                    : "Active"}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg mt-3 line-clamp-2">
                                            {assignment.assignment_title}
                                        </CardTitle>
                                        {assignment.courses && (
                                            <p className="text-sm text-blue-600 font-medium">
                                                {assignment.courses.course_name}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 text-orange-500" />
                                                <span>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users className="h-4 w-4 text-purple-500" />
                                                <span>{assignment.submissions_count || 0} Submissions</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Max Marks</span>
                                                <span className="font-bold">{assignment.max_marks}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link href={`/ems/tutor/assignments/${assignment.id}`} className="flex-1">
                                                <Button size="sm" variant="outline" className="w-full">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
