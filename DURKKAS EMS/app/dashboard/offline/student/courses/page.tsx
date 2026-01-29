"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Download,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Eye,
  FileCheck,
  Package,
  Archive,
  FileDown,
  X,
  FolderOpen,
  File,
  Image as ImageIcon,
  FileCode,
} from "lucide-react";
import { ContentViewer } from "@/components/courses/content-viewer";
import { formatDocumentForDisplay, type ParsedDocument } from "@/lib/document-parser";
import { BackButton } from "@/components/navigation/back-button";
import Image from "next/image";

// Mock course data for offline portal - Unique courses different from online
const offlineCourses = [
  {
    id: "1",
    title: "Digital Marketing Fundamentals",
    description: "Master digital marketing strategies with downloadable guides and practice materials",
    category: "Business",
    cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    modules: [
      {
        id: "1.1",
        title: "Module 1: Social Media Marketing",
        subtopics: [
          {
            id: "1.1.1",
            title: "Social Media Strategy Guide",
            type: "practice",
            downloadable: true,
            files: [
              { name: "Social_Media_Strategy.pdf", type: "pdf", size: "3.2 MB" },
              { name: "Content_Calendar_Template.xlsx", type: "xlsx", size: "1.5 MB" },
              { name: "Hashtag_Research_Guide.pdf", type: "pdf", size: "2.1 MB" },
            ],
          },
          {
            id: "1.1.2",
            title: "Facebook & Instagram Marketing",
            type: "practice",
            downloadable: true,
            files: [
              { name: "FB_IG_Marketing_Guide.pdf", type: "pdf", size: "4.5 MB" },
              { name: "Ad_Creative_Templates.zip", type: "zip", size: "6.8 MB" },
            ],
          },
        ],
      },
      {
        id: "1.2",
        title: "Module 2: SEO & Content Marketing",
        subtopics: [
          {
            id: "1.2.1",
            title: "SEO Best Practices Handbook",
            type: "practice",
            downloadable: true,
            files: [
              { name: "SEO_Handbook.pdf", type: "pdf", size: "5.2 MB" },
              { name: "Keyword_Research_Tools.zip", type: "zip", size: "3.4 MB" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Graphic Design Essentials",
    description: "Learn design principles with downloadable templates and practice projects",
    category: "Creative",
    cover: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    modules: [
      {
        id: "2.1",
        title: "Module 1: Design Principles",
        subtopics: [
          {
            id: "2.1.1",
            title: "Color Theory & Typography Guide",
            type: "practice",
            downloadable: true,
            files: [
              { name: "Color_Theory_Guide.pdf", type: "pdf", size: "4.8 MB" },
              { name: "Typography_Reference.pdf", type: "pdf", size: "3.6 MB" },
              { name: "Design_Templates.zip", type: "zip", size: "12.5 MB" },
            ],
          },
          {
            id: "2.1.2",
            title: "Logo Design Practice",
            type: "practice",
            downloadable: true,
            files: [
              { name: "Logo_Design_Workbook.pdf", type: "pdf", size: "5.1 MB" },
              { name: "Logo_Templates.zip", type: "zip", size: "8.9 MB" },
            ],
          },
        ],
      },
      {
        id: "2.2",
        title: "Module 2: Adobe Tools Mastery",
        subtopics: [
          {
            id: "2.2.1",
            title: "Photoshop & Illustrator Basics",
            type: "practice",
            downloadable: true,
            files: [
              { name: "PS_AI_Tutorial.pdf", type: "pdf", size: "6.2 MB" },
              { name: "Practice_Files.zip", type: "zip", size: "15.3 MB" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Business Communication Skills",
    description: "Enhance your professional communication with downloadable resources",
    category: "Business",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
    modules: [
      {
        id: "3.1",
        title: "Module 1: Professional Writing",
        subtopics: [
          {
            id: "3.1.1",
            title: "Email & Report Writing Guide",
            type: "practice",
            downloadable: true,
            files: [
              { name: "Professional_Writing_Guide.pdf", type: "pdf", size: "3.7 MB" },
              { name: "Email_Templates.zip", type: "zip", size: "2.1 MB" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "4",
    title: "Photography & Videography",
    description: "Master photography and video production with practice materials",
    category: "Creative",
    cover: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&h=600&fit=crop",
    modules: [
      {
        id: "4.1",
        title: "Module 1: Photography Basics",
        subtopics: [
          {
            id: "4.1.1",
            title: "Camera Settings & Composition",
            type: "practice",
            downloadable: true,
            files: [
              { name: "Photography_Guide.pdf", type: "pdf", size: "5.8 MB" },
              { name: "Composition_Examples.zip", type: "zip", size: "18.2 MB" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "5",
    title: "Content Writing Mastery",
    description: "Learn content creation with downloadable templates and guides",
    category: "Business",
    cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
    modules: [
      {
        id: "5.1",
        title: "Module 1: Blog & Article Writing",
        subtopics: [
          {
            id: "5.1.1",
            title: "Content Writing Templates",
            type: "practice",
            downloadable: true,
            files: [
              { name: "Writing_Templates.pdf", type: "pdf", size: "2.9 MB" },
              { name: "Content_Examples.zip", type: "zip", size: "4.7 MB" },
            ],
          },
        ],
      },
    ],
  },
];

// Get downloaded content from localStorage
const getDownloadedContent = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("offline_downloaded_content");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save downloaded content
const saveDownloadedContent = (content: any) => {
  if (typeof window === "undefined") return;
  const existing = getDownloadedContent();
  const updated = [...existing, content];
  localStorage.setItem("offline_downloaded_content", JSON.stringify(updated));
};

export default function OfflineCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(
    searchParams.get("course") || null
  );
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isContentViewerOpen, setIsContentViewerOpen] = useState(false);
  const [downloadedContent, setDownloadedContent] = useState(getDownloadedContent());

  const handleDownload = (file: any, subtopic: any) => {
    // Simulate download
    toast({
      title: "Download Started",
      description: `Downloading ${file.name}...`,
    });

    // Save to downloaded content
    const content = {
      id: `${subtopic.id}_${file.name}`,
      subtopicId: subtopic.id,
      subtopicTitle: subtopic.title,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      downloadedAt: new Date().toISOString(),
      content: `This is the content of ${file.name}. Practice material for ${subtopic.title}.`,
    };

    saveDownloadedContent(content);
    setDownloadedContent([...downloadedContent, content]);

    // Simulate download completion
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${file.name} has been downloaded successfully`,
      });
    }, 1500);
  };

  const handleViewContent = (subtopic: any, file?: any) => {
    // Check if content is downloaded
    const downloaded = downloadedContent.find((d: any) => 
      d.subtopicId === subtopic.id && (!file || d.fileName === file.name)
    );
    
    if (downloaded) {
      // View downloaded content
      const content = formatDocumentForDisplay({
        title: downloaded.subtopicTitle,
        content: downloaded.content,
        type: "text",
      });
      
      setSelectedContent({
        title: downloaded.subtopicTitle,
        type: "content",
        content: content,
      });
      setIsContentViewerOpen(true);
    } else {
      // Generate preview content for viewing (even if not downloaded)
      const previewContent = formatDocumentForDisplay({
        title: file ? `${subtopic.title} - ${file.name}` : subtopic.title,
        content: `This is a preview of ${file ? file.name : subtopic.title}. Practice material content for offline learning.\n\n${subtopic.title} contains practice exercises and materials to help you master the concepts.`,
        type: "text",
      });
      
      setSelectedContent({
        title: file ? `${subtopic.title} - ${file.name}` : subtopic.title,
        type: "content",
        content: previewContent,
      });
      setIsContentViewerOpen(true);
    }
  };

  const filteredCourses = offlineCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCourseData = selectedCourse
    ? offlineCourses.find((c) => c.id === selectedCourse)
    : null;

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return FileText;
      case "zip":
      case "rar":
        return Archive;
      case "csv":
      case "xlsx":
      case "xls":
        return FileCode;
      default:
        return File;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
        <TopNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton />
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                  Practice Materials & Downloads
                </h1>
                <p className="text-gray-600">
                  Download course materials and practice resources for offline learning
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-base"
              />
            </div>
          </motion.div>

          {/* Course List or Course Details */}
          {!selectedCourseData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full overflow-hidden">
                    {/* Course Cover Image */}
                    {course.cover && (
                      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-blue-600 to-indigo-600">
                        <Image
                          src={course.cover}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-xs font-semibold">
                            {course.category}
                          </span>
                        </div>
                      </div>
                    )}
                    {!course.cover && (
                      <div className="h-40 sm:h-48 bg-gradient-to-br from-blue-600 to-indigo-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-white/30" />
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-xs font-semibold">
                            {course.category}
                          </span>
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{course.modules.length} Modules</span>
                        <span>
                          {course.modules.reduce(
                            (acc, m) => acc + m.subtopics.length,
                            0
                          )}{" "}
                          Practice Sets
                        </span>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => setSelectedCourse(course.id)}
                      >
                        View Materials
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Course Header */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCourse(null)}
                        className="mb-4 text-white hover:bg-white/20"
                      >
                        <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                        Back to Courses
                      </Button>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                        {selectedCourseData.title}
                      </h2>
                      <p className="text-blue-100">{selectedCourseData.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Downloaded Content Section */}
              {downloadedContent.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-2 border-blue-500/30 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                        Downloaded Content ({downloadedContent.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {downloadedContent
                          .filter((d: any) =>
                            selectedCourseData.modules.some((m) =>
                              m.subtopics.some((s) => s.id === d.subtopicId)
                            )
                          )
                          .map((item: any, index: number) => {
                            const FileIcon = getFileIcon(item.fileType);
                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-all overflow-hidden"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-3">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                      <FileIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm sm:text-base text-gray-900 break-words sm:truncate">
                                        {item.fileName}
                                      </div>
                                      <div className="text-xs text-gray-500 break-words sm:truncate">
                                        {item.subtopicTitle} • {item.fileSize}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const subtopic = selectedCourseData.modules
                                        .flatMap((m) => m.subtopics)
                                        .find((s) => s.id === item.subtopicId);
                                      if (subtopic) handleViewContent(subtopic);
                                    }}
                                    className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 flex-shrink-0"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Modules */}
              {selectedCourseData.modules.map((module, moduleIndex) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + moduleIndex * 0.1 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <button
                        onClick={() =>
                          setExpandedModule(
                            expandedModule === module.id ? null : module.id
                          )
                        }
                        className="flex items-center justify-between w-full text-left"
                      >
                        <CardTitle className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          {module.title}
                        </CardTitle>
                        {expandedModule === module.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </CardHeader>
                    <AnimatePresence>
                      {expandedModule === module.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              {module.subtopics.map((subtopic, subtopicIndex) => {
                                const isDownloaded = downloadedContent.some(
                                  (d: any) => d.subtopicId === subtopic.id
                                );
                                return (
                                  <motion.div
                                    key={subtopic.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      delay: 0.4 + subtopicIndex * 0.05,
                                    }}
                                    className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200"
                                  >
                                    <div className="flex items-start justify-between mb-3 sm:mb-3">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1.5 sm:mb-1 break-words">
                                          {subtopic.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-gray-500">
                                          <FileCheck className="h-3 w-3 flex-shrink-0" />
                                          <span>Practice Material</span>
                                          {isDownloaded && (
                                            <>
                                              <span>•</span>
                                              <div className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                                <span className="text-blue-600">Downloaded</span>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Files List */}
                                    <div className="space-y-3 mb-4">
                                      {subtopic.files.map((file, fileIndex) => {
                                        const FileIcon = getFileIcon(file.type);
                                        const fileDownloaded = downloadedContent.some(
                                          (d: any) => d.subtopicId === subtopic.id && d.fileName === file.name
                                        );
                                        return (
                                          <div
                                            key={fileIndex}
                                            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                                          >
                                            {/* Mobile: Stacked Layout */}
                                            <div className="flex flex-col sm:hidden">
                                              <div className="flex items-start gap-3 p-3">
                                                <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                                  <FileIcon className="h-5 w-5 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="font-medium text-sm text-gray-900 mb-1 break-words">
                                                    {file.name}
                                                  </div>
                                                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                                                    <span>{file.type.toUpperCase()}</span>
                                                    <span>•</span>
                                                    <span>{file.size}</span>
                                                    {fileDownloaded && (
                                                      <>
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1">
                                                          <CheckCircle2 className="h-3 w-3 text-blue-600" />
                                                          <span className="text-blue-600">Downloaded</span>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex gap-2 p-3 pt-0 border-t border-gray-100">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => handleViewContent(subtopic, file)}
                                                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                                                >
                                                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                                  View
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => handleDownload(file, subtopic)}
                                                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                                                >
                                                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                                  Download
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Desktop: Horizontal Layout */}
                                            <div className="hidden sm:flex items-center justify-between p-3">
                                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                                  <FileIcon className="h-4 w-4 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="font-medium text-sm text-gray-900 truncate">
                                                    {file.name}
                                                  </div>
                                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{file.type.toUpperCase()} • {file.size}</span>
                                                    {fileDownloaded && (
                                                      <>
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1">
                                                          <CheckCircle2 className="h-3 w-3 text-blue-600" />
                                                          <span className="text-blue-600">Downloaded</span>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => handleViewContent(subtopic, file)}
                                                  className="border-blue-300 text-blue-700 hover:bg-blue-50 whitespace-nowrap"
                                                >
                                                  <Eye className="h-4 w-4 mr-2" />
                                                  View
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => handleDownload(file, subtopic)}
                                                  className="border-blue-300 text-blue-700 hover:bg-blue-50 whitespace-nowrap"
                                                >
                                                  <Download className="h-4 w-4 mr-2" />
                                                  Download
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* View Content Button for Subtopic */}
                                    <Button
                                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 sm:py-2"
                                      onClick={() => handleViewContent(subtopic)}
                                    >
                                      <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
                                      <span className="text-sm sm:text-base">
                                        {isDownloaded ? "View Downloaded Content" : "View Practice Material"}
                                      </span>
                                    </Button>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Content Viewer Modal */}
        {selectedContent && (
          <ContentViewer
            isOpen={isContentViewerOpen}
            onClose={() => {
              setIsContentViewerOpen(false);
              setSelectedContent(null);
            }}
            content={selectedContent.content}
            title={selectedContent.title}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

