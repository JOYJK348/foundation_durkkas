"use client";

import { useState, useEffect } from "react";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Video,
    FileCode,
    MoreVertical,
    Download,
    Eye,
    Plus,
    FolderOpen,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Material {
    id: number;
    material_name: string;
    material_type: string;
    file_url: string;
    file_size_mb: number;
    created_at: string;
    menu_id?: number;
}

export default function TutorMaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            // Fetching materials uploaded by managers (Menu-based or Global)
            const response = await api.get("/ems/materials");
            if (response.data.success) {
                setMaterials(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Error fetching materials:", error);
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'VIDEO': return <Video className="h-6 w-6" />;
            case 'CODE': return <FileCode className="h-6 w-6" />;
            default: return <FileText className="h-6 w-6" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            Resource Library
                        </h1>
                        <p className="text-gray-600 mt-1">Official guides, SOPs, and materials shared by academic management</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-500">Fetching shared resources...</p>
                    </div>
                ) : materials.length === 0 ? (
                    <Card className="border-0 shadow-lg p-20 text-center">
                        <FolderOpen className="h-20 w-20 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Library is Empty</h3>
                        <p className="text-gray-600">No shared materials available at the moment.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode="popLayout">
                            {materials.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="border-0 shadow-md hover:shadow-lg transition-all border-l-4 border-l-blue-500 bg-white">
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                        {getFileIcon(item.material_type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{item.material_name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                                                {item.material_type} • {item.file_size_mb || '0'} MB
                                                            </span>
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                                Shared: {new Date(item.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-10 w-10 p-0 text-blue-600 hover:bg-blue-50"
                                                        onClick={() => window.open(item.file_url, '_blank')}
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-10 w-10 p-0">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
