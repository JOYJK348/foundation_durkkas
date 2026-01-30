"use client";

import { motion } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    Search,
    Filter,
    Plus,
    Play,
    Edit,
    Trash2,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function BranchCourses() {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/ems/courses');
            setCourses(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_category?.toLowerCase().includes(searchQuery.toLowerCase())
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
                        My Courses
                    </h1>
                    <p className="text-gray-600">Manage and track all your courses</p>
                </motion.div>

                {/* Search and Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 mb-6"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search courses..."
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
                            Add Course
                        </Button>
                    </div>
                </motion.div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-white font-bold text-lg mb-1">
                                                {course.course_name}
                                            </h3>
                                            <p className="text-white/90 text-sm">
                                                {course.course_category} • {course.course_level}
                                            </p>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users className="h-4 w-4" />
                                                <span>{course.total_lessons || 0} lessons</span>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600">
                                                ₹{course.price}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                                                <Play className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No courses found</p>
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
