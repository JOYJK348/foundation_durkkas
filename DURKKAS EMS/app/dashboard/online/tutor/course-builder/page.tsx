"use client";

import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  Plus,
  BookOpen,
  Video,
  FileText,
  ChevronRight,
  ChevronDown,
  Upload,
  Link2,
} from "lucide-react";
import { useState } from "react";
import { DocumentUploadModal } from "@/components/courses/document-upload-modal";
import { type ParsedDocument } from "@/lib/document-parser";
import { useToast } from "@/components/ui/use-toast";

export default function CourseBuilderPage() {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<{ moduleId: string; subtopicId?: string } | null>(null);
  const { toast } = useToast();

  // Get uploaded documents for a specific module/subtopic
  const getDocumentsForModule = (moduleId: string, subtopicId?: string) => {
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem("tutor_documents");
      const docs: (ParsedDocument & { subtopicId?: string; moduleId?: string })[] = stored ? JSON.parse(stored) : [];
      return docs.filter(
        (doc) => doc.moduleId === moduleId && (!subtopicId || doc.subtopicId === subtopicId)
      );
    } catch {
      return [];
    }
  };

  const handleSaveDocument = (document: ParsedDocument) => {
    // Store in localStorage (in production, this would be an API call)
    const stored = localStorage.getItem("tutor_documents");
    const documents = stored ? JSON.parse(stored) : [];
    
    const docWithMetadata = {
      ...document,
      moduleId: selectedModule?.moduleId,
      subtopicId: selectedModule?.subtopicId,
    };
    
    documents.push(docWithMetadata);
    localStorage.setItem("tutor_documents", JSON.stringify(documents));

    toast({
      title: "Document Linked",
      description: `Document "${document.title}" has been linked to ${selectedModule?.moduleId}${selectedModule?.subtopicId ? ` - ${selectedModule.subtopicId}` : ""}`,
    });
  };

  const courseStructure = [
    {
      id: "1",
      title: "Level 1: Introduction",
      modules: [
        { id: "1.1", title: "Module 1.1", type: "video" },
        { id: "1.2", title: "Module 1.2", type: "content" },
      ],
    },
    {
      id: "2",
      title: "Level 2: Advanced",
      modules: [
        { id: "2.1", title: "Module 2.1", type: "video" },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Course Builder
            </h1>
            <p className="text-muted-foreground">Create and structure your course content</p>
          </motion.div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Level
          </Button>
        </div>

        <div className="space-y-4">
          {courseStructure.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {level.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedLevel(expandedLevel === level.id ? null : level.id)}
                      >
                        {expandedLevel === level.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Module
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedLevel === level.id && (
                  <CardContent>
                    <div className="space-y-2">
                      {level.modules.map((module) => {
                        const linkedDocs = getDocumentsForModule(module.id);
                        return (
                          <div
                            key={module.id}
                            className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {module.type === "video" ? (
                                  <Video className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <FileText className="h-5 w-5 text-purple-500" />
                                )}
                                <span className="font-medium">{module.id} {module.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {linkedDocs.length > 0 && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Link2 className="h-3 w-3" />
                                    {linkedDocs.length} doc{linkedDocs.length > 1 ? "s" : ""}
                                  </span>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedModule({ moduleId: module.id });
                                    setIsUploadModalOpen(true);
                                  }}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Upload Doc
                                </Button>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </div>
                            </div>
                            {linkedDocs.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Linked Documents:</p>
                                <div className="flex flex-wrap gap-1">
                                  {linkedDocs.map((doc, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                                    >
                                      {doc.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
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

