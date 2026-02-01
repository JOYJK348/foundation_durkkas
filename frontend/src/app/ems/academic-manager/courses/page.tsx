"use client";

import { useState, useEffect } from "react";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    ArrowLeft,
    X,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Course {
    id: number;
    course_code: string;
    course_name: string;
    course_description: string;
    course_category: string;
    course_level: string;
    duration_hours: number;
    price: number;
    status: string;
    total_lessons: number;
    enrollment_capacity: number;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        course_code: "",
        course_name: "",
        course_description: "",
        course_category: "TECHNOLOGY",
        course_level: "BEGINNER",
        duration_hours: 40,
        price: 0,
        enrollment_capacity: 30,
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        console.log("showCreateForm state changed to:", showCreateForm);
    }, [showCreateForm]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/courses");
            if (response.data.success) {
                setCourses(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/ems/courses", formData);

            if (response.data.success) {
                setShowCreateForm(false);
                fetchCourses();
                // Reset form
                setFormData({
                    course_code: "",
                    course_name: "",
                    course_description: "",
                    course_category: "TECHNOLOGY",
                    course_level: "BEGINNER",
                    duration_hours: 40,
                    price: 0,
                    enrollment_capacity: 30,
                });
            }
        } catch (error) {
            console.error("Error creating course:", error);
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Courses Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Create and manage your course catalog
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            try {
                                console.log("Create Course button clicked!");
                                console.log("Current showCreateForm state:", showCreateForm);
                                setShowCreateForm(true);
                                console.log("Setting showCreateForm to true");
                            } catch (error) {
                                console.error("Error in button click handler:", error);
                            }
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Course
                    </Button>
                </div>

                {/* Search and Filter */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search courses by name or code..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Courses Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading courses...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <BookOpen className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Courses Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Get started by creating your first course
                            </p>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Course
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <BookOpen className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.status === 'PUBLISHED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {course.status}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                            {course.course_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Code: {course.course_code}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {course.course_description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Duration</p>
                                                <p className="font-semibold">{course.duration_hours}h</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Lessons</p>
                                                <p className="font-semibold">{course.total_lessons}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Level</p>
                                                <p className="font-semibold">{course.course_level}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Price</p>
                                                <p className="font-semibold">₹{course.price}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link href={`/ems/academic-manager/courses/${course.id}`} className="flex-1">
                                                <Button size="sm" variant="outline" className="w-full">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
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

            {/* Create Course Modal */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowCreateForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Create New Course
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateCourse} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="course_code">Course Code *</Label>
                                        <Input
                                            id="course_code"
                                            required
                                            placeholder="e.g., WEB101"
                                            value={formData.course_code}
                                            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="course_level">Level *</Label>
                                        <select
                                            id="course_level"
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={formData.course_level}
                                            onChange={(e) => setFormData({ ...formData, course_level: e.target.value })}
                                        >
                                            <option value="BEGINNER">Beginner</option>
                                            <option value="INTERMEDIATE">Intermediate</option>
                                            <option value="ADVANCED">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="course_name">Course Name *</Label>
                                    <Input
                                        id="course_name"
                                        required
                                        placeholder="e.g., Web Development Fundamentals"
                                        value={formData.course_name}
                                        onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="course_description">Description</Label>
                                    <Textarea
                                        id="course_description"
                                        rows={4}
                                        placeholder="Describe what students will learn..."
                                        value={formData.course_description}
                                        onChange={(e) => setFormData({ ...formData, course_description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="course_category">Category</Label>
                                        <select
                                            id="course_category"
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={formData.course_category}
                                            onChange={(e) => setFormData({ ...formData, course_category: e.target.value })}
                                        >
                                            <option value="TECHNOLOGY">Technology</option>
                                            <option value="BUSINESS">Business</option>
                                            <option value="DESIGN">Design</option>
                                            <option value="MARKETING">Marketing</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="duration_hours">Duration (Hours)</Label>
                                        <Input
                                            id="duration_hours"
                                            type="number"
                                            min="1"
                                            value={formData.duration_hours}
                                            onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price">Price (₹)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="enrollment_capacity">Max Students</Label>
                                        <Input
                                            id="enrollment_capacity"
                                            type="number"
                                            min="1"
                                            value={formData.enrollment_capacity}
                                            onChange={(e) => setFormData({ ...formData, enrollment_capacity: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Create Course
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AcademicManagerBottomNav />
        </div>
    );
}
