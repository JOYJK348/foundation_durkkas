'use client';

import { useState, useEffect } from 'react';
import { TopNavbar } from '@/components/ems/dashboard/top-navbar';
import { BottomNav } from '@/components/ems/dashboard/bottom-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    FileText,
    Video,
    FileCode,
    Download,
    Search,
    Folder,
    Loader2,
    BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Material {
    id: number;
    material_name: string;
    material_type: string;
    file_url: string;
    file_size_mb: number;
    course: {
        id: number;
        course_name: string;
        course_code: string;
    };
    uploaded_at: string;
}

export default function StudentMaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            // Fetch materials for courses the student is enrolled in
            const response = await api.get('/ems/students/my-materials');
            if (response.data.success) {
                setMaterials(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
            toast.error('Failed to load materials');
        } finally {
            setLoading(false);
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.course.course_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'VIDEO':
                return <Video className="w-6 h-6" />;
            case 'CODE':
                return <FileCode className="w-6 h-6" />;
            default:
                return <FileText className="w-6 h-6" />;
        }
    };

    const getFileColor = (type: string) => {
        switch (type.toUpperCase()) {
            case 'VIDEO':
                return 'bg-purple-100 text-purple-600';
            case 'CODE':
                return 'bg-green-100 text-green-600';
            default:
                return 'bg-blue-100 text-blue-600';
        }
    };

    // Group materials by course
    const materialsByCourse = filteredMaterials.reduce((acc, material) => {
        const courseId = material.course.id;
        if (!acc[courseId]) {
            acc[courseId] = {
                course: material.course,
                materials: []
            };
        }
        acc[courseId].materials.push(material);
        return acc;
    }, {} as Record<number, { course: Material['course']; materials: Material[] }>);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                        Learning Materials
                    </h1>
                    <p className="text-gray-600">
                        Access course resources and study materials
                    </p>
                </motion.div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search materials or courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Materials</p>
                                    <p className="text-3xl font-bold">{materials.length}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Courses</p>
                                    <p className="text-3xl font-bold">
                                        {Object.keys(materialsByCourse).length}
                                    </p>
                                </div>
                                <BookOpen className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Videos</p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {materials.filter(m => m.material_type === 'VIDEO').length}
                                    </p>
                                </div>
                                <Video className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Materials by Course */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
                        <p className="text-gray-500">Loading materials...</p>
                    </div>
                ) : Object.keys(materialsByCourse).length === 0 ? (
                    <Card className="border-0 shadow-lg p-12 text-center">
                        <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No Materials Available
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Your instructors haven\'t uploaded any materials yet'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {Object.values(materialsByCourse).map(({ course, materials: courseMaterials }) => (
                            <div key={course.id}>
                                <div className="flex items-center mb-4">
                                    <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {course.course_code} - {course.course_name}
                                    </h2>
                                    <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                                        {courseMaterials.length} {courseMaterials.length === 1 ? 'item' : 'items'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {courseMaterials.map((material, index) => (
                                        <motion.div
                                            key={material.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                                <CardContent className="p-4 sm:p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div
                                                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${getFileColor(
                                                                    material.material_type
                                                                )}`}
                                                            >
                                                                {getFileIcon(material.material_type)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-gray-900">
                                                                    {material.material_name}
                                                                </h3>
                                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                                                    <span className="uppercase text-xs font-semibold">
                                                                        {material.material_type}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>{material.file_size_mb || '0'} MB</span>
                                                                    <span>•</span>
                                                                    <span>
                                                                        {new Date(material.uploaded_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => window.open(material.file_url, '_blank')}
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
