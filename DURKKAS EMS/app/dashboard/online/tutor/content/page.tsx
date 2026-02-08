"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Video,
  FileText,
  Image,
  File,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { DocumentUploadModal } from "@/components/courses/document-upload-modal";
import { type ParsedDocument } from "@/lib/document-parser";
import { useToast } from "@/components/ui/use-toast";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  size: string;
  status: "published" | "draft";
  uploadDate: string;
  document?: ParsedDocument;
  moduleId?: string;
  subtopicId?: string;
}

export default function ContentUploadPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: "1",
      title: "Introduction Video",
      type: "video",
      size: "125 MB",
      status: "published",
      uploadDate: "Dec 15, 2024",
    },
    {
      id: "2",
      title: "Module 1 Notes",
      type: "pdf",
      size: "2.5 MB",
      status: "draft",
      uploadDate: "Dec 18, 2024",
    },
    {
      id: "3",
      title: "Sample Code Files",
      type: "zip",
      size: "5.2 MB",
      status: "published",
      uploadDate: "Dec 19, 2024",
    },
  ]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<{ moduleId?: string; subtopicId?: string } | null>(null);
  const { toast } = useToast();

  const handleSaveDocument = (document: ParsedDocument) => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: document.title,
      type: document.metadata.type.toLowerCase(),
      size: `${(document.metadata.size / 1024).toFixed(2)} KB`,
      status: "draft",
      uploadDate: new Date().toLocaleDateString(),
      document,
      moduleId: selectedModule?.moduleId,
      subtopicId: selectedModule?.subtopicId,
    };

    setContentItems([...contentItems, newItem]);
    
    // Store in localStorage for persistence (in production, this would be API call)
    const stored = localStorage.getItem("tutor_documents");
    const documents = stored ? JSON.parse(stored) : [];
    documents.push(document);
    localStorage.setItem("tutor_documents", JSON.stringify(documents));

    toast({
      title: "Document Uploaded",
      description: `${document.title} has been uploaded successfully`,
    });
  };

  const handleDelete = (id: string) => {
    setContentItems(contentItems.filter((item) => item.id !== id));
    toast({
      title: "Document Deleted",
      description: "Document has been removed",
    });
  };

  const toggleStatus = (id: string) => {
    setContentItems(
      contentItems.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "published" ? "draft" : "published" }
          : item
      )
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "zip":
        return <File className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Content Upload
            </h1>
            <p className="text-muted-foreground">Upload videos, PDFs, and course materials</p>
          </motion.div>
          <Button
            onClick={() => {
              setSelectedModule(null);
              setIsUploadModalOpen(true);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Upload Area */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
          <CardContent className="p-12 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Course Content</h3>
            <p className="text-muted-foreground mb-4">
              Upload documents (PDF, Word, Text) that will be displayed as raw content to students
            </p>
            <Button
              onClick={() => {
                setSelectedModule(null);
                setIsUploadModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>

        {/* Content List */}
        <div className="space-y-4">
          {contentItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {item.size} • {item.uploadDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === "published" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Published
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                          <EyeOff className="h-3 w-3" />
                          Draft
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(item.id)}
                        >
                          {item.status === "published" ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Publish
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedModule({
                              moduleId: item.moduleId,
                              subtopicId: item.subtopicId,
                            });
                            setIsUploadModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onSave={handleSaveDocument}
        moduleId={selectedModule?.moduleId}
        subtopicId={selectedModule?.subtopicId}
      />
    </DashboardLayout>
  );
}

