"use client";

import { useState, useEffect } from "react";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus, Search, Mail, Phone, ArrowLeft, X, BookOpen } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Tutor {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    specialization: string;
    courses_assigned: number;
    status: string;
}

export default function TutorsPage() {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        specialization: "",
        employee_code: "",
        password: "",
        gender: "Male",
        date_of_birth: "",
    });

    useEffect(() => {
        fetchTutors();
    }, []);

    const fetchTutors = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/tutors");
            if (response.data.success) {
                setTutors(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching tutors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTutor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/ems/tutors", formData);
            if (response.data.success) {
                setShowAddForm(false);
                fetchTutors();
                setFormData({
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    specialization: "",
                    employee_code: "",
                    password: "",
                    gender: "Male",
                    date_of_birth: ""
                });
            }
        } catch (error) {
            console.error("Error adding tutor:", error);
        }
    };

    const filteredTutors = tutors.filter((tutor) =>
        `${tutor.first_name} ${tutor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerTopNavbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Tutors
                        </h1>
                        <p className="text-gray-600 mt-1">Manage tutors and course assignments</p>
                    </div>
                    <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tutor
                    </Button>
                </div>

                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="search" placeholder="Search tutors..." className="pl-10"
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading tutors...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTutors.map((tutor) => (
                            <Card key={tutor.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                                            {tutor.first_name.charAt(0)}{tutor.last_name.charAt(0)}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${tutor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {tutor.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        {tutor.first_name} {tutor.last_name}
                                    </h3>
                                    <p className="text-sm text-purple-600 font-medium mb-4">{tutor.specialization}</p>
                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span className="truncate">{tutor.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span>{tutor.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-gray-400" />
                                            <span>{tutor.courses_assigned || 0} courses assigned</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/ems/academic-manager/tutors/${tutor.id}/assign-courses`} className="flex-1">
                                            <Button size="sm" variant="outline" className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                                <BookOpen className="h-4 w-4 mr-1" />
                                                Assign Courses
                                            </Button>
                                        </Link>
                                        <Button size="sm" variant="outline">
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowAddForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="border-b px-6 py-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Add Tutor</h2>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <form onSubmit={handleAddTutor} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input id="first_name" required value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input id="last_name" required value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="employee_code">Tutor ID / Menu ID *</Label>
                                        <Input id="employee_code" placeholder="TTR-001" required value={formData.employee_code}
                                            onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Password *</Label>
                                        <Input id="password" type="password" required value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="email">Work Email *</Label>
                                    <Input id="email" type="email" required value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="gender">Gender *</Label>
                                        <select
                                            id="gender"
                                            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        <Input id="date_of_birth" type="date" value={formData.date_of_birth}
                                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">Phone *</Label>
                                        <Input id="phone" required value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label htmlFor="specialization">Specialization *</Label>
                                        <Input id="specialization" required value={formData.specialization}
                                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                                        Create Tutor Account
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
