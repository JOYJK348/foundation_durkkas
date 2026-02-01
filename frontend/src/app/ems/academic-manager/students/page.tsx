"use client";

import { useState, useEffect } from "react";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Users,
    Plus,
    Search,
    UserPlus,
    Mail,
    Phone,
    ArrowLeft,
    X,
    Edit,
    Trash2,
    Eye,
    BookOpen,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Student {
    id: number;
    student_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
    date_of_birth: string;
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

interface Batch {
    id: number;
    batch_name: string;
    batch_code: string;
    course_id: number;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEnrollForm, setShowEnrollForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [studentFormData, setStudentFormData] = useState({
        student_code: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "MALE",
    });

    const [enrollFormData, setEnrollFormData] = useState({
        student_id: "",
        course_id: "",
        batch_id: "",
        payment_status: "PENDING",
    });

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/students");
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get("/ems/courses");
            if (response.data.success) {
                setCourses(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const fetchBatchesByCourse = async (courseId: string) => {
        try {
            const response = await api.get(`/ems/batches?course_id=${courseId}`);
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/ems/students", studentFormData);

            if (response.data.success) {
                setShowCreateForm(false);
                fetchStudents();
                // Reset form
                setStudentFormData({
                    student_code: "",
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    date_of_birth: "",
                    gender: "MALE",
                });
            }
        } catch (error) {
            console.error("Error creating student:", error);
        }
    };

    const handleEnrollStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/ems/enrollments", {
                ...enrollFormData,
                student_id: parseInt(enrollFormData.student_id),
                course_id: parseInt(enrollFormData.course_id),
                batch_id: parseInt(enrollFormData.batch_id),
            });

            if (response.data.success) {
                setShowEnrollForm(false);
                setSelectedStudent(null);
                // Reset form
                setEnrollFormData({
                    student_id: "",
                    course_id: "",
                    batch_id: "",
                    payment_status: "PENDING",
                });
            }
        } catch (error) {
            console.error("Error enrolling student:", error);
        }
    };

    const openEnrollForm = (studentId: number) => {
        setSelectedStudent(studentId);
        setEnrollFormData({ ...enrollFormData, student_id: studentId.toString() });
        setShowEnrollForm(true);
    };

    const filteredStudents = students.filter((student) =>
        student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_code.toLowerCase().includes(searchQuery.toLowerCase())
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
                            Students Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage student records and enrollments
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                    </Button>
                </div>

                {/* Search */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search students by name, email, or code..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Students List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading students...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Users className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Students Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Add your first student to get started
                            </p>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Student
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg group-hover:scale-110 transition-transform">
                                                {student.first_name.charAt(0)}{student.last_name?.charAt(0)}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {student.first_name} {student.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            ID: {student.student_code}
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span className="truncate">{student.email || 'No email'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{student.phone || 'No phone'}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                onClick={() => openEnrollForm(student.id)}
                                            >
                                                <UserPlus className="h-4 w-4 mr-1" />
                                                Enroll
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Student Modal */}
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
                                    Add New Student
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateStudent} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="student_code">Student Code *</Label>
                                        <Input
                                            id="student_code"
                                            required
                                            placeholder="e.g., STU001"
                                            value={studentFormData.student_code}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, student_code: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">Gender *</Label>
                                        <select
                                            id="gender"
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={studentFormData.gender}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value })}
                                        >
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            required
                                            placeholder="John"
                                            value={studentFormData.first_name}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            placeholder="Doe"
                                            value={studentFormData.last_name}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="student@example.com"
                                            value={studentFormData.email}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+91 9876543210"
                                            value={studentFormData.phone}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={studentFormData.date_of_birth}
                                        onChange={(e) => setStudentFormData({ ...studentFormData, date_of_birth: e.target.value })}
                                    />
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
                                        Add Student
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enroll Student Modal */}
            <AnimatePresence>
                {showEnrollForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowEnrollForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Enroll Student
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowEnrollForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleEnrollStudent} className="p-6 space-y-6">
                                <div>
                                    <Label htmlFor="enroll_course_id">Select Course *</Label>
                                    <select
                                        id="enroll_course_id"
                                        required
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={enrollFormData.course_id}
                                        onChange={(e) => {
                                            setEnrollFormData({ ...enrollFormData, course_id: e.target.value, batch_id: "" });
                                            fetchBatchesByCourse(e.target.value);
                                        }}
                                    >
                                        <option value="">Choose a course...</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="enroll_batch_id">Select Batch *</Label>
                                    <select
                                        id="enroll_batch_id"
                                        required
                                        disabled={!enrollFormData.course_id}
                                        className="w-full h-10 px-3 rounded-md border border-gray-300 disabled:bg-gray-100"
                                        value={enrollFormData.batch_id}
                                        onChange={(e) => setEnrollFormData({ ...enrollFormData, batch_id: e.target.value })}
                                    >
                                        <option value="">Choose a batch...</option>
                                        {batches.map((batch) => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.batch_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="payment_status">Payment Status *</Label>
                                    <select
                                        id="payment_status"
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={enrollFormData.payment_status}
                                        onChange={(e) => setEnrollFormData({ ...enrollFormData, payment_status: e.target.value })}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PAID">Paid</option>
                                        <option value="PARTIAL">Partial</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowEnrollForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Enroll Student
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
