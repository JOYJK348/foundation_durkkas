"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft,
    BookOpen,
    Search,
    Save,
    Loader2,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Course {
    id: number;
    course_code: string;
    course_name: string;
    course_description: string;
    course_level: string;
    duration_hours: number;
    tutor_id: number | null;
    is_published: boolean;
}

interface Tutor {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    specialization: string;
}

export default function AssignCoursesPage() {
    const params = useParams();
    const router = useRouter();
    const tutorId = params.id as string;

    const [tutor, setTutor] = useState<Tutor | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, [tutorId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tutorRes, coursesRes] = await Promise.all([
                api.get(`/ems/tutors/${tutorId}`),
                api.get("/ems/courses"),
            ]);

            if (tutorRes.data.success) {
                setTutor(tutorRes.data.data);
            }

            if (coursesRes.data.success) {
                const allCourses = coursesRes.data.data || [];
                setCourses(allCourses);

                // Pre-select courses already assigned to this tutor
                const assignedCourseIds = allCourses
                    .filter((c: Course) => c.tutor_id === parseInt(tutorId))
                    .map((c: Course) => c.id);
                setSelectedCourses(new Set(assignedCourseIds));
            }
        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast.error(error.response?.data?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCourse = (courseId: number) => {
        const newSelected = new Set(selectedCourses);
        if (newSelected.has(courseId)) {
            newSelected.delete(courseId);
        } else {
            newSelected.add(courseId);
        }
        setSelectedCourses(newSelected);
    };

    const handleSaveAssignments = async () => {
        try {
            setSaving(true);

            // Update each course's tutor_id
            const updatePromises = courses.map(async (course) => {
                const shouldBeAssigned = selectedCourses.has(course.id);
                const isCurrentlyAssigned = course.tutor_id === parseInt(tutorId);

                // Only update if assignment status changed
                if (shouldBeAssigned !== isCurrentlyAssigned) {
                    return api.patch(`/ems/courses/${course.id}`, {
                        tutor_id: shouldBeAssigned ? parseInt(tutorId) : null,
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(updatePromises);

            toast.success("Course assignments updated successfully!");
            router.push("/ems/academic-manager/tutors");
        } catch (error: any) {
            console.error("Error saving assignments:", error);
            toast.error(error.response?.data?.message || "Failed to save assignments");
        } finally {
            setSaving(false);
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <AcademicManagerTopNavbar />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="ml-3 text-gray-600">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/ems/academic-manager/tutors">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Tutors
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Assign Courses
                    </h1>
                    {tutor && (
                        <p className="text-gray-600 mt-1">
                            Managing course assignments for{" "}
                            <span className="font-semibold text-purple-600">
                                {tutor.first_name} {tutor.last_name}
                            </span>{" "}
                            ({tutor.specialization})
                        </p>
                    )}
                </div>

                {/* Summary Card */}
                <Card className="mb-6 border-0 shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Selected Courses</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {selectedCourses.size}
                                </p>
                            </div>
                            <Button
                                onClick={handleSaveAssignments}
                                disabled={saving}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Assignments
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Search */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search courses by name or code..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Courses List */}
                <div className="space-y-3">
                    {filteredCourses.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <BookOpen className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    No Courses Found
                                </h3>
                                <p className="text-gray-600">
                                    {searchQuery
                                        ? "Try adjusting your search query"
                                        : "No courses available for assignment"}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredCourses.map((course, index) => {
                            const isSelected = selectedCourses.has(course.id);
                            const isAssignedToOther =
                                course.tutor_id !== null &&
                                course.tutor_id !== parseInt(tutorId);

                            return (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card
                                        className={`border-0 shadow-md hover:shadow-lg transition-all cursor-pointer ${isSelected
                                                ? "ring-2 ring-purple-500 bg-purple-50"
                                                : ""
                                            }`}
                                        onClick={() => handleToggleCourse(course.id)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex items-center pt-1">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() =>
                                                            handleToggleCourse(course.id)
                                                        }
                                                        className="h-5 w-5"
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">
                                                                {course.course_name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                Code: {course.course_code}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {isSelected && (
                                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    Assigned
                                                                </span>
                                                            )}
                                                            {isAssignedToOther && (
                                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                                                                    <XCircle className="h-3 w-3" />
                                                                    Assigned to Other
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${course.is_published
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                                    }`}
                                                            >
                                                                {course.is_published
                                                                    ? "Published"
                                                                    : "Draft"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                        {course.course_description ||
                                                            "No description"}
                                                    </p>

                                                    <div className="flex gap-4 text-sm text-gray-500">
                                                        <span>Level: {course.course_level}</span>
                                                        <span>•</span>
                                                        <span>
                                                            Duration: {course.duration_hours}h
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <AcademicManagerBottomNav />
        </div>
    );
}
