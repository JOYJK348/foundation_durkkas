"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/navigation/back-button";
import { useToast } from "@/components/ui/use-toast";
import { navigateWithLoading } from "@/lib/utils/navigation";
import {
  Download,
  FileText,
  Archive,
  FileCode,
  File,
  Image as ImageIcon,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  HardDrive,
  Trash2,
  Eye,
  FileDown,
  FolderOpen,
} from "lucide-react";

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

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return FileText;
    case "zip":
    case "rar":
      return Archive;
    case "csv":
    case "json":
      return FileCode;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return ImageIcon;
    default:
      return File;
  }
};

const formatFileSize = (size: string) => {
  return size;
};

export default function OfflineDownloadsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pdf" | "zip" | "other">("all");
  const [downloadedContent, setDownloadedContent] = useState(getDownloadedContent());
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleDelete = (fileId: string) => {
    const updated = downloadedContent.filter((item: any) => item.id !== fileId);
    setDownloadedContent(updated);
    localStorage.setItem("offline_downloaded_content", JSON.stringify(updated));
    toast({
      title: "File Deleted",
      description: "The file has been removed from your downloads",
    });
  };

  const handleDeleteSelected = () => {
    const updated = downloadedContent.filter((item: any) => !selectedFiles.includes(item.id));
    setDownloadedContent(updated);
    localStorage.setItem("offline_downloaded_content", JSON.stringify(updated));
    setSelectedFiles([]);
    toast({
      title: "Files Deleted",
      description: `${selectedFiles.length} file(s) have been removed`,
    });
  };

  const handleView = (item: any) => {
    navigateWithLoading(router, `/dashboard/offline/student/courses?view=${item.subtopicId}`);
  };

  const filteredContent = downloadedContent.filter((item: any) => {
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtopicTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filterType === "all" ||
      (filterType === "pdf" && item.fileType.toLowerCase() === "pdf") ||
      (filterType === "zip" && (item.fileType.toLowerCase() === "zip" || item.fileType.toLowerCase() === "rar")) ||
      (filterType === "other" && !["pdf", "zip", "rar"].includes(item.fileType.toLowerCase()));

    return matchesSearch && matchesFilter;
  });

  const totalSize = downloadedContent.reduce((acc: number, item: any) => {
    const size = parseFloat(item.fileSize?.replace(/[^\d.]/g, "") || "0");
    return acc + size;
  }, 0);

  const groupedByDate = filteredContent.reduce((acc: any, item: any) => {
    const date = new Date(item.downloadedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

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
                  My Downloads
                </h1>
                <p className="text-gray-600">
                  Manage your downloaded course materials and practice resources
                </p>
              </div>
              {selectedFiles.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedFiles.length})
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Total Files</p>
                      <p className="text-2xl font-bold">{downloadedContent.length}</p>
                    </div>
                    <FolderOpen className="h-8 w-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Total Size</p>
                      <p className="text-2xl font-bold">{totalSize.toFixed(1)} MB</p>
                    </div>
                    <HardDrive className="h-8 w-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-100 mb-1">PDF Files</p>
                      <p className="text-2xl font-bold">
                        {downloadedContent.filter((f: any) => f.fileType.toLowerCase() === "pdf").length}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-100 mb-1">Archives</p>
                      <p className="text-2xl font-bold">
                        {downloadedContent.filter((f: any) => ["zip", "rar"].includes(f.fileType.toLowerCase())).length}
                      </p>
                    </div>
                    <Archive className="h-8 w-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search downloads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "pdf", "zip", "other"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className={
                      filterType === type
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-blue-300 text-blue-700 hover:bg-blue-50"
                    }
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Downloads List */}
          {filteredContent.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Download className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Downloads Yet</h3>
              <p className="text-gray-600 mb-6">Download course materials to view them here</p>
              <Button
                onClick={() => {
                  navigateWithLoading(router, "/dashboard/offline/student/courses");
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Browse Courses
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([date, files]: [string, any]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{date}</span>
                    <span className="text-gray-400">({files.length} files)</span>
                  </div>
                  {files.map((item: any, index: number) => {
                    const FileIcon = getFileIcon(item.fileType);
                    const isSelected = selectedFiles.includes(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFiles([...selectedFiles, item.id]);
                                  } else {
                                    setSelectedFiles(selectedFiles.filter((id) => id !== item.id));
                                  }
                                }}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                <FileIcon className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 truncate">
                                  {item.fileName}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  <span>{item.subtopicTitle}</span>
                                  <span>•</span>
                                  <span>{item.fileType.toUpperCase()}</span>
                                  <span>•</span>
                                  <span>{item.fileSize}</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                                    <span className="text-blue-600">Downloaded</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleView(item)}
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(item.id)}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

