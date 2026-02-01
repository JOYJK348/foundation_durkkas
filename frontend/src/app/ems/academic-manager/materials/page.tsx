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
    FileText,
    Plus,
    Search,
    Download,
    Eye,
    Trash2,
    Upload,
    File,
    ArrowLeft,
    X,
    Folder,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Material {
    id: number;
    material_name: string;
    material_description: string;
    course_id: number;
    menu_id?: number;
    file_url: string;
    material_type: string;
    file_size_mb: number;
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [menus, setMenus] = useState<any[]>([]);
    const [uploadType, setUploadType] = useState<'course' | 'menu'>('course');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        material_title: "",
        material_description: "",
        course_id: "",
        menu_id: "",
        is_public: true,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchMaterials();
        fetchCourses();
        fetchMenus();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/materials");
            if (response.data.success) {
                setMaterials(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching materials:", error);
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

    const fetchMenus = async () => {
        try {
            const response = await api.get("/auth/menus");
            if (response.data.success) {
                const flatten = (items: any[]): any[] => {
                    return items.reduce((acc, item) => {
                        return [...acc, item, ...(item.children ? flatten(item.children) : [])];
                    }, []);
                };
                setMenus(flatten(response.data.data.menus || []));
            }
        } catch (error) {
            console.error("Error fetching menus:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        try {
            setUploading(true);
            const body: any = {
                material_name: formData.material_title,
                material_description: formData.material_description,
                is_published: formData.is_public,
                file_url: "https://placeholder.com/file.pdf",
                material_type: selectedFile.type.includes('video') ? 'VIDEO' : 'DOCUMENT',
                file_size_mb: (selectedFile.size / (1024 * 1024)).toFixed(2)
            };

            if (uploadType === 'course') body.course_id = formData.course_id;
            else if (uploadType === 'menu') body.menu_id = formData.menu_id;

            const response = await api.post("/ems/materials", body);

            if (response.data.success) {
                setShowUploadForm(false);
                fetchMaterials();
                setFormData({
                    material_title: "",
                    material_description: "",
                    course_id: "",
                    menu_id: "",
                    is_public: true,
                });
                setSelectedFile(null);
            }
        } catch (error) {
            console.error("Error uploading material:", error);
        } finally {
            setUploading(false);
        }
    };

    const filteredMaterials = (materials || []).filter((material) =>
        material.material_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (fileType: string) => {
        if (!fileType) return "�";
        if (fileType.includes("pdf")) return "📄";
        if (fileType.includes("video") || fileType === 'VIDEO') return "🎥";
        if (fileType.includes("image")) return "�️";
        return "📁";
    };

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
                            Course & Menu Materials
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Upload materials to courses or link them to sidebar menus
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowUploadForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Material
                    </Button>
                </div>

                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search materials..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading materials...</p>
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Folder className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Materials Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Upload your first study material to get started
                            </p>
                            <Button
                                onClick={() => setShowUploadForm(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload First Material
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMaterials.map((material) => (
                            <motion.div
                                key={material.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="text-4xl">
                                                {getFileIcon(material.material_type)}
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
                                                {material.menu_id ? 'Menu Resource' : 'Course Resource'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                            {material.material_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {material.material_description}
                                        </p>

                                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4 pb-4 border-b">
                                            <span>{material.file_size_mb} MB</span>
                                            <span>{material.material_type}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                onClick={() => window.open(material.file_url, '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
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

            <AnimatePresence>
                {showUploadForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowUploadForm(false)}
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
                                    Upload Material
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowUploadForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleUploadMaterial} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setUploadType('course')}
                                        className={`py-2 text-sm font-bold rounded-md transition-all ${uploadType === 'course' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Course Material
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadType('menu')}
                                        className={`py-2 text-sm font-bold rounded-md transition-all ${uploadType === 'menu' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Menu Content
                                    </button>
                                </div>

                                <div>
                                    <Label htmlFor="material_title">Material Title *</Label>
                                    <Input
                                        id="material_title"
                                        required
                                        placeholder="e.g., Tutor Handbook 2026"
                                        value={formData.material_title}
                                        onChange={(e) => setFormData({ ...formData, material_title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="material_description">Description</Label>
                                    <Textarea
                                        id="material_description"
                                        rows={3}
                                        placeholder="Describe the content..."
                                        value={formData.material_description}
                                        onChange={(e) => setFormData({ ...formData, material_description: e.target.value })}
                                    />
                                </div>

                                {uploadType === 'course' ? (
                                    <div>
                                        <Label htmlFor="course_id">Select Course *</Label>
                                        <select
                                            id="course_id"
                                            required
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={formData.course_id}
                                            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                        >
                                            <option value="">Choose a course...</option>
                                            {courses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.course_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <Label htmlFor="menu_id">Select Target Menu *</Label>
                                        <select
                                            id="menu_id"
                                            required
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={formData.menu_id}
                                            onChange={(e) => setFormData({ ...formData, menu_id: e.target.value })}
                                        >
                                            <option value="">Choose a menu category...</option>
                                            {menus.map((menu) => (
                                                <option key={menu.id} value={menu.id}>
                                                    {menu.display_name} ({menu.product})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="file">Upload File *</Label>
                                    <div className="mt-2">
                                        <label
                                            htmlFor="file"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span>
                                                </p>
                                            </div>
                                            <input
                                                id="file"
                                                type="file"
                                                className="hidden"
                                                required
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        {selectedFile && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                Selected: {selectedFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowUploadForm(false)}
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                        disabled={uploading}
                                    >
                                        {uploading ? "Uploading..." : "Save Material"}
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
