"use client";

import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    Search,
    Clock,
    Award,
    Play,
    CheckCircle2,
    ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "enrolled" | "available">("all");

    const enrolledCourses = [
        {
            id: 1,
            title: "Web Development - Full Stack",
            progress: 68,
            instructor: "Dr. John Smith",
            duration: "12 weeks",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
        },
        {
            id: 2,
            title: "Data Science Basics",
            progress: 45,
            instructor: "Dr. Jane Doe",
            duration: "10 weeks",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        },
    ];

    const availableCourses = [
        {
            id: 3,
            title: "Mobile App Development",
            instructor: "Prof. Mike Johnson",
            duration: "14 weeks",
            image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
        },
    ];

    const filteredEnrolled = enrolledCourses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAvailable = availableCourses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Back Button */}
                <div className="mb-4">
                    <Link href="/ems/student/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">My Courses</h1>
                    <p className="text-gray-600">Continue your learning journey</p>
                </motion.div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(["all", "enrolled", "available"] as const).map((f) => (
                            <Button
                                key={f}
                                variant={filter === f ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(f)}
                                className={filter === f ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Enrolled Courses */}
                {(filter === "all" || filter === "enrolled") && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Enrolled Courses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredEnrolled.map((course, index) => (
                                <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Enrolled
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                {course.instructor}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {course.duration}
                                            </span>
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">Progress</span>
                                                <span className="text-sm font-bold text-blue-600">{course.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                            <Play className="h-4 w-4 mr-2" />
                                            Continue Learning
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Available Courses */}
                {(filter === "all" || filter === "available") && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Available Courses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAvailable.map((course) => (
                                <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                {course.instructor}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {course.duration}
                                            </span>
                                        </div>
                                        <Button variant="outline" className="w-full">
                                            View Details
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
