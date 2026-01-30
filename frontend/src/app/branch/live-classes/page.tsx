"use client";

import { motion } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Video,
    Search,
    Filter,
    Plus,
    Clock,
    Users,
    Play,
    Edit,
    Trash2,
    Calendar,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BranchLiveClasses() {
    const [searchQuery, setSearchQuery] = useState("");

    // Mock data - replace with API call
    const liveClasses = [
        {
            id: 1,
            title: "React Advanced Patterns",
            course: "Full Stack Development",
            scheduledTime: "2026-01-30T14:00:00",
            duration: "2 hours",
            students: 22,
            status: "Upcoming",
            meetingLink: "https://meet.google.com/abc-defg-hij"
        },
        {
            id: 2,
            title: "Data Visualization with Python",
            course: "Data Science",
            scheduledTime: "2026-01-31T10:00:00",
            duration: "1.5 hours",
            students: 18,
            status: "Upcoming",
            meetingLink: "https://meet.google.com/xyz-uvwx-yz"
        },
        {
            id: 3,
            title: "Figma Design Workshop",
            course: "UI/UX Design",
            scheduledTime: "2026-01-29T15:00:00",
            duration: "2 hours",
            students: 15,
            status: "Completed",
            meetingLink: "https://meet.google.com/pqr-stuv-wxy"
        },
    ];

    const filteredClasses = liveClasses.filter(cls =>
        cls.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.course?.toLowerCase().includes(searchQuery.toLowerCase())
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
                        Live Classes
                    </h1>
                    <p className="text-gray-600">Schedule and manage your live sessions</p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total", value: "24", icon: Video, color: "blue" },
                        { label: "Upcoming", value: "6", icon: Clock, color: "orange" },
                        { label: "Today", value: "2", icon: Calendar, color: "purple" },
                        { label: "Completed", value: "18", icon: Play, color: "green" },
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
                            placeholder="Search live classes..."
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
                            Schedule Class
                        </Button>
                    </div>
                </motion.div>

                {/* Live Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredClasses.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                        >
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                            <Video className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls.status === 'Upcoming'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {cls.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                                        {cls.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">{cls.course}</p>
                                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(cls.scheduledTime).toLocaleString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {cls.duration}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {cls.students} students
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {cls.status === 'Upcoming' ? (
                                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Join Class
                                            </Button>
                                        ) : (
                                            <Button className="flex-1" variant="outline" size="sm">
                                                <Play className="h-4 w-4 mr-2" />
                                                View Recording
                                            </Button>
                                        )}
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

                {filteredClasses.length === 0 && (
                    <div className="text-center py-12">
                        <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No live classes found</p>
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
