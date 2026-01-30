"use client";

import { motion } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    Search,
    Filter,
    Plus,
    Users,
    BookOpen,
    Edit,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function BranchBatches() {
    const [loading, setLoading] = useState(true);
    const [batches, setBatches] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const res = await api.get('/ems/batches');
            setBatches(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBatches = batches.filter(batch =>
        batch.batch_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.batch_code?.toLowerCase().includes(searchQuery.toLowerCase())
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
                        Batches
                    </h1>
                    <p className="text-gray-600">Manage and track all your batches</p>
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
                            placeholder="Search batches..."
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
                            Add Batch
                        </Button>
                    </div>
                </motion.div>

                {/* Batches Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBatches.map((batch, index) => (
                            <motion.div
                                key={batch.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <Calendar className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${batch.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {batch.status}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                                            {batch.batch_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Code: {batch.batch_code}
                                        </p>
                                        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{batch.current_strength || 0}/{batch.max_students || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                                                View Details
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

                {!loading && filteredBatches.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No batches found</p>
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
