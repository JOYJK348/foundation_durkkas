"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import Link from "next/link";
import {
    Search,
    Folder,
    Plus,
    Download,
    Trash2,
    Upload,
    ArrowLeft,
    X,
    Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar";
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav";


interface Material {
    id: number;
    material_name: string;
    material_description: string;
    course_id?: number;
    menu_id?: number;
    file_url: string;
    material_type: string;
    file_size_mb: number;
    course?: {
        course_name: string;
        course_code: string;
    };
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
        batch_id: "",
        menu_id: "",
        is_public: true,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [handbookType, setHandbookType] = useState<'TUTOR_HANDBOOK' | 'STUDENT_HANDBOOK' | 'GENERAL_RESOURCE'>('STUDENT_HANDBOOK');

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
            toast.error("Failed to load materials");
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

    const fetchBatches = async (courseId: string) => {
        if (!courseId) {
            setBatches([]);
            return;
        }
        try {
            const response = await api.get(`/ems/batches?course_id=${courseId}`);
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
            setBatches([]);
        }
    };

    const fetchMenus = async () => {
        try {
            const response = await api.get("/auth/menus");
            if (response.data.success) {
                const flatten = (items: any[]): any[] => {
                    return items.reduce((acc, item) => {
                        const current = {
                            id: item.id,
                            display_name: item.display_name,
                            product: item.product,
                            parent_id: item.parent_id
                        };
                        return [...acc, current, ...(item.children ? flatten(item.children) : [])];
                    }, []);
                };
                const flatMenus = flatten(response.data.data.menus || []);
                setMenus(flatMenus);
            }
        } catch (error) {
            console.error("Error fetching menus:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            // Auto-fill title if empty
            if (!formData.material_title) {
                const name = e.target.files[0].name.split('.').slice(0, -1).join('.');
                setFormData(prev => ({ ...prev, material_title: name }));
            }
        }
    };

    const handleUploadMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a file first");
            return;
        }

        try {
            setUploading(true);

            // Determine target audience based on handbook type
            const targetAudience = handbookType === 'TUTOR_HANDBOOK' ? 'TUTORS' :
                handbookType === 'STUDENT_HANDBOOK' ? 'STUDENTS' : 'BOTH';

            const body: any = {
                material_name: formData.material_title,
                material_description: formData.material_description,
                handbook_type: handbookType,
                target_audience: targetAudience,
                is_active: formData.is_public,
                // In a real app, this would be the actual uploaded file path from S3/Supabase Storage
                file_url: `https://cdn.durkkas.com/ems/materials/${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`,
                material_type: selectedFile.type.includes('video') ? 'VIDEO' :
                    selectedFile.type.includes('pdf') ? 'PDF' :
                        selectedFile.type.includes('image') ? 'IMAGE' : 'DOCUMENT',
                file_size_mb: parseFloat((selectedFile.size / (1024 * 1024)).toFixed(2))
            };

            if (uploadType === 'course') {
                if (!formData.course_id) throw new Error("Please select a course");
                body.course_id = parseInt(formData.course_id);

                // Add batch if selected (optional)
                if (formData.batch_id) {
                    body.batch_id = parseInt(formData.batch_id);
                }
            } else if (uploadType === 'menu') {
                if (!formData.menu_id) throw new Error("Please select a target menu");
                body.menu_id = parseInt(formData.menu_id);
                body.course_id = null; // Important: Clear course_id for menu resources
            }

            const response = await api.post("/ems/materials", body);

            if (response.data.success) {
                toast.success(`${handbookType.replace('_', ' ')} uploaded successfully!`);
                setShowUploadForm(false);
                fetchMaterials();
                setFormData({
                    material_title: "",
                    material_description: "",
                    course_id: "",
                    batch_id: "",
                    menu_id: "",
                    is_public: true,
                });
                setSelectedFile(null);
                setBatches([]);
                setHandbookType('STUDENT_HANDBOOK');
            }
        } catch (error: any) {
            console.error("Error uploading material:", error);
            toast.error(error.message || error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this material?")) return;
        try {
            const response = await api.delete(`/ems/materials/${id}`);
            if (response.data.success) {
                toast.success("Material deleted");
                fetchMaterials();
            }
        } catch (error) {
            toast.error("Failed to delete material");
        }
    };

    const filteredMaterials = (materials || []).filter((material) =>
        material.material_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (fileType: string) => {
        const type = fileType?.toUpperCase();
        if (type === 'PDF') return "📄";
        if (type === 'VIDEO') return "🎥";
        if (type === 'IMAGE') return "️";
        return "📁";
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
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
                            Content & Media Center
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Organize repository materials by Course or Sidebar Menu
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowUploadForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Add New Content
                    </Button>
                </div>

                <Card className="mb-8 border-0 shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search by title, category, or file type..."
                                className="pl-10 h-12 bg-white border-gray-100 focus:ring-purple-500 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <Button
                        variant={searchQuery === '' ? 'secondary' : 'ghost'}
                        onClick={() => setSearchQuery('')}
                        className={`rounded-full px-6 ${searchQuery === '' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'text-gray-500'}`}
                    >
                        All Assets
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setSearchQuery('menu_resource')}
                        className={`rounded-full px-6 ${searchQuery === 'menu_resource' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'text-gray-500'}`}
                    >
                        Portal Resources
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setSearchQuery('course_resource')}
                        className={`rounded-full px-6 ${searchQuery === 'course_resource' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-gray-500'}`}
                    >
                        Course Materials
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4 font-medium">Synchronizing repository...</p>
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-20 text-center">
                            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Folder className="h-12 w-12 text-purple-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Digital Library Empty
                            </h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                Start uploading tutorials, handbooks, or specific menu resources to build your institute's knowledge base.
                            </p>
                            <Button
                                onClick={() => setShowUploadForm(true)}
                                className="bg-purple-600 hover:bg-purple-700 px-8 py-6 rounded-2xl h-auto text-lg font-bold"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Upload First Asset
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMaterials
                            .filter(m => {
                                if (searchQuery === 'menu_resource') return m.menu_id;
                                if (searchQuery === 'course_resource') return m.course_id;
                                return true;
                            })
                            .map((material) => {
                                const menu = menus.find(m => m.id === material.menu_id);
                                return (
                                    <motion.div
                                        key={material.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="border-0 shadow-lg hover:shadow-2xl transition-all group bg-white rounded-2xl overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                                            {getFileIcon(material.material_type)}
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${material.menu_id ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {material.menu_id ? 'Menu Entry' : 'Course Asset'}
                                                            </span>
                                                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                                                                {material.file_size_mb} MB • {material.material_type}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                                                        {material.material_name}
                                                    </h3>

                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                        <span className="text-xs font-bold text-gray-500">
                                                            Linked to: <span className="text-gray-900">
                                                                {material.menu_id ? (menu?.display_name || `Menu ID: ${material.menu_id}`) :
                                                                    (material.course?.course_name || `Course: ${material.course_id}`)}
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px]">
                                                        {material.material_description || "No description provided for this resource."}
                                                    </p>

                                                    <div className="flex gap-3">
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 bg-gray-900 hover:bg-black text-white rounded-xl font-bold py-5"
                                                            onClick={() => setSelectedMaterial(material)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Button>
                                                        {/* Optional: Keep download button if needed, or maybe just View is enough as requested */}
                                                        {/* 
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl px-3"
                                                            onClick={() => window.open(material.file_url, '_blank')}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button> 
                                                        */}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:bg-red-50 rounded-xl px-3"
                                                            onClick={() => handleDelete(material.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* View Material Modal */}
            <AnimatePresence>
                {selectedMaterial && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setSelectedMaterial(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-2 rounded-lg">
                                        {selectedMaterial.material_type === 'PDF' && <span className="text-xl">📄</span>}
                                        {selectedMaterial.material_type === 'VIDEO' && <span className="text-xl">🎥</span>}
                                        {selectedMaterial.material_type === 'IMAGE' && <span className="text-xl">🖼️</span>}
                                        {selectedMaterial.material_type === 'DOCUMENT' && <span className="text-xl">📁</span>}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                            {selectedMaterial.material_name}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {selectedMaterial.file_size_mb} MB • {selectedMaterial.material_type}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(selectedMaterial.file_url, '_blank')}
                                        className="hidden sm:flex"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full hover:bg-white"
                                        onClick={() => setSelectedMaterial(null)}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
                                {selectedMaterial.material_type === 'PDF' ? (
                                    <iframe
                                        src={`${selectedMaterial.file_url}#toolbar=0`}
                                        className="w-full h-full rounded-xl shadow-sm bg-white min-h-[60vh]"
                                        title="PDF Preview"
                                    />
                                ) : selectedMaterial.material_type === 'VIDEO' ? (
                                    <video
                                        controls
                                        className="max-w-full max-h-full rounded-xl shadow-lg"
                                        src={selectedMaterial.file_url}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : selectedMaterial.material_type === 'IMAGE' ? (
                                    <img
                                        src={selectedMaterial.file_url}
                                        alt={selectedMaterial.material_name}
                                        className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                                    />
                                ) : (
                                    <div className="text-center p-12">
                                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <span className="text-4xl">📁</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Preview Not Available</h3>
                                        <p className="text-gray-500 mb-6">
                                            This file type ({selectedMaterial.material_type}) cannot be previewed directly.
                                        </p>
                                        <Button
                                            onClick={() => window.open(selectedMaterial.file_url, '_blank')}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download to View
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 bg-white border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {selectedMaterial.material_description || "No description provided."}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showUploadForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowUploadForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-purple-50/30">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">
                                        Asset Deployment
                                    </h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                        Upload content to repository
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-white"
                                    onClick={() => setShowUploadForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleUploadMaterial} className="p-8 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setUploadType('course')}
                                        className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${uploadType === 'course' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-500'}`}
                                    >
                                        Course Material
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadType('menu')}
                                        className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${uploadType === 'menu' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-500'}`}
                                    >
                                        Sidebar Menu Item
                                    </button>
                                </div>

                                {/* Handbook Type Selector - NEW */}
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-gray-400">Handbook Type</Label>
                                    <div className="grid grid-cols-3 gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setHandbookType('STUDENT_HANDBOOK')}
                                            className={`py-2.5 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${handbookType === 'STUDENT_HANDBOOK'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            📚 Student
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHandbookType('TUTOR_HANDBOOK')}
                                            className={`py-2.5 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${handbookType === 'TUTOR_HANDBOOK'
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            👨‍🏫 Tutor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHandbookType('GENERAL_RESOURCE')}
                                            className={`py-2.5 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${handbookType === 'GENERAL_RESOURCE'
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            📁 General
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        {handbookType === 'STUDENT_HANDBOOK' && '✓ Visible to enrolled students'}
                                        {handbookType === 'TUTOR_HANDBOOK' && '✓ Visible to assigned tutors only'}
                                        {handbookType === 'GENERAL_RESOURCE' && '✓ Visible to both tutors and students'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="material_title" className="text-[10px] font-black uppercase text-gray-400">Title</Label>
                                        <Input
                                            id="material_title"
                                            required
                                            className="h-12 border-gray-200 rounded-xl focus:border-purple-500"
                                            placeholder="Asset name"
                                            value={formData.material_title}
                                            onChange={(e) => setFormData({ ...formData, material_title: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-gray-400">Target Mapping</Label>
                                        {uploadType === 'course' ? (
                                            <select
                                                id="course_id"
                                                required
                                                className="w-full h-12 px-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-0 text-sm font-bold"
                                                value={formData.course_id}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, course_id: e.target.value, batch_id: "" });
                                                    fetchBatches(e.target.value);
                                                }}
                                            >
                                                <option value="">Select Course...</option>
                                                {courses.map((course) => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.course_name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <select
                                                id="menu_id"
                                                required
                                                className="w-full h-12 px-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-0 text-sm font-bold"
                                                value={formData.menu_id}
                                                onChange={(e) => setFormData({ ...formData, menu_id: e.target.value })}
                                            >
                                                <option value="">Select Target Menu...</option>
                                                {menus.filter(m => m.display_name).map((menu) => (
                                                    <option key={menu.id} value={menu.id}>
                                                        {menu.display_name} • {menu.product}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* Batch Selector - Only show when course is selected */}
                                {uploadType === 'course' && formData.course_id && batches.length > 0 && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-gray-400">
                                            Batch (Optional)
                                        </Label>
                                        <select
                                            className="w-full h-12 px-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-0 text-sm font-bold"
                                            value={formData.batch_id || ""}
                                            onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                                        >
                                            <option value="">All Batches (Course-wide)</option>
                                            {batches.map((batch) => (
                                                <option key={batch.id} value={batch.id}>
                                                    {batch.batch_name} • {batch.batch_code}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-500">
                                            Leave empty to make available for all batches in this course
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="material_description" className="text-[10px] font-black uppercase text-gray-400">Description</Label>
                                    <Textarea
                                        id="material_description"
                                        rows={2}
                                        className="border-gray-200 rounded-xl focus:border-purple-500 resize-none"
                                        placeholder="Brief summary of this resource..."
                                        value={formData.material_description}
                                        onChange={(e) => setFormData({ ...formData, material_description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-gray-400">Local Repository Source</Label>
                                    <div className="relative group">
                                        <label
                                            htmlFor="file"
                                            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${selectedFile ? 'border-purple-500 bg-purple-50/30' : 'border-gray-200 bg-gray-50 group-hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${selectedFile ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-400 shadow-sm'
                                                    }`}>
                                                    <Upload className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-700">
                                                    {selectedFile ? selectedFile.name : 'Choose file to deploy'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Max size: 50MB (PDF, DOCX, MP4)'}
                                                </p>
                                            </div>
                                            <input
                                                id="file"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-14 rounded-2xl font-bold border-gray-100"
                                        onClick={() => setShowUploadForm(false)}
                                        disabled={uploading}
                                    >
                                        Abort
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-14 bg-purple-600 hover:bg-purple-700 rounded-2xl font-bold shadow-lg shadow-purple-100"
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Deploying...</span>
                                            </div>
                                        ) : "Confirm Upload"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AcademicManagerBottomNav />
        </div >
    );
}
