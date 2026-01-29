"use client";

import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    FileText,
    Clock,
    CheckCircle2,
    Upload,
    Search,
    ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AssignmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");

    const assignments = [
        { id: 1, title: "React Component Assignment", dueDate: "Dec 22, 2024", status: "pending", course: "Web Development" },
        { id: 2, title: "API Integration Project", dueDate: "Dec 25, 2024", status: "pending", course: "Web Development" },
        { id: 3, title: "Data Analysis Report", dueDate: "Dec 20, 2024", status: "submitted", course: "Data Science" },
        { id: 4, title: "Database Design", dueDate: "Dec 15, 2024", status: "graded", score: 85, course: "Web Development" },
    ];

    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "all" || a.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-orange-100 text-orange-700 border-orange-200";
            case "submitted": return "bg-blue-100 text-blue-700 border-blue-200";
            case "graded": return "bg-green-100 text-green-700 border-green-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const handleUpload = () => {
        toast.success("Assignment Submitted", {
            description: "Your assignment has been uploaded successfully",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-4">
                    <Link href="/ems/student/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">Assignments</h1>
                    <p className="text-gray-600">Track and submit your assignments</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search assignments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {(["all", "pending", "submitted", "graded"] as const).map((f) => (
                            <Button
                                key={f}
                                variant={filter === f ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(f)}
                                className={`whitespace-nowrap ${filter === f ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredAssignments.map((assignment, index) => (
                        <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${assignment.status === "graded" ? "bg-green-100" :
                                                    assignment.status === "submitted" ? "bg-blue-100" : "bg-orange-100"
                                                }`}>
                                                <FileText className={`h-6 w-6 ${assignment.status === "graded" ? "text-green-600" :
                                                        assignment.status === "submitted" ? "text-blue-600" : "text-orange-600"
                                                    }`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{assignment.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{assignment.course}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        Due: {assignment.dueDate}
                                                    </span>
                                                    {assignment.status === "graded" && assignment.score && (
                                                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Score: {assignment.score}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                            </span>
                                            {assignment.status === "pending" && (
                                                <Button size="sm" onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Submit
                                                </Button>
                                            )}
                                            {assignment.status !== "pending" && (
                                                <Button size="sm" variant="outline">
                                                    View Details
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
