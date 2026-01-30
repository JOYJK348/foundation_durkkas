"use client";

import { motion } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    GraduationCap,
    Search,
    Filter,
    Plus,
    Mail,
    Phone,
    Edit,
    Trash2,
    User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function BranchStudents() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/ems/students');
            setStudents(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
                        Students
                    </h1>
                    <p className="text-gray-600">Manage and track all your students</p>
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
                            placeholder="Search students..."
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
                            Add Student
                        </Button>
                    </div>
                </motion.div>

                {/* Students List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredStudents.map((student, index) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                                                <User className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    {student.first_name} {student.last_name}
                                                </h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600 mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {student.email}
                                                    </div>
                                                    {student.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {student.phone}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Code: {student.student_code} • {student.status}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
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
                )}

                {!loading && filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                        <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No students found</p>
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
