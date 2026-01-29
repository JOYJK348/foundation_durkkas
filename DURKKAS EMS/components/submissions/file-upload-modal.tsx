"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, File, XCircle, CheckCircle2, Loader2, Image, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: File[]) => Promise<void>;
  title: string;
  description?: string;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  allowMultiple?: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "success" | "error";
}

export function FileUploadModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description = "Upload your submission files",
  acceptedFileTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".zip"],
  maxFileSize = 10, // 10MB default
  maxFiles = 5,
  allowMultiple = true,
}: FileUploadModalProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Video;
    return FileText;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFileTypes.some((type) => fileExtension.includes(type.replace(".", "")))) {
      return `File type not allowed. Accepted types: ${acceptedFileTypes.join(", ")}`;
    }

    return null;
  };

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const fileWithPreview: FileWithPreview = Object.assign(file, {
        id: Math.random().toString(36).substr(2, 9),
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        uploadStatus: "pending" as const,
      });

      newFiles.push(fileWithPreview);
    });

    if (errors.length > 0) {
      toast({
        title: "Upload Error",
        description: errors.join(", "),
      });
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, [files.length, maxFiles, maxFileSize, acceptedFileTypes, toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload progress
      const filesWithProgress = files.map((file) => ({
        ...file,
        uploadStatus: "uploading" as const,
        uploadProgress: 0,
      }));
      setFiles(filesWithProgress);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((file) => {
            if (file.uploadStatus === "uploading" && file.uploadProgress !== undefined) {
              const newProgress = Math.min(file.uploadProgress + 10, 90);
              return { ...file, uploadProgress: newProgress };
            }
            return file;
          })
        );
      }, 200);

      await onSubmit(files);

      clearInterval(progressInterval);

      // Mark all as success
      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          uploadStatus: "success" as const,
          uploadProgress: 100,
        }))
      );

      toast({
        title: "Upload Successful!",
        description: `${files.length} file(s) uploaded successfully`,
      });

      // Close modal after a short delay
      setTimeout(() => {
        setFiles([]);
        setIsUploading(false);
        onClose();
      }, 1000);
    } catch (error) {
      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          uploadStatus: "error" as const,
        }))
      );
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
      });
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isUploading}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Upload Area */}
            <Card
              className={`border-2 border-dashed transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 bg-gray-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className="p-8 text-center">
                <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? "text-blue-600" : "text-gray-400"}`} />
                <h4 className="text-lg font-semibold mb-2 text-gray-900">
                  {isDragging ? "Drop files here" : "Drag & drop files here"}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  or click to browse from your device
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isUploading || files.length >= maxFiles}
                  className="bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={allowMultiple}
                  accept={acceptedFileTypes.join(",")}
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500 mt-4">
                  Accepted: {acceptedFileTypes.join(", ")} • Max size: {maxFileSize}MB • Max files: {maxFiles}
                </p>
              </CardContent>
            </Card>

            {/* Files List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Selected Files ({files.length}/{maxFiles})
                </h4>
                {files.map((file) => {
                  const Icon = getFileIcon(file);
                  const isUploading = file.uploadStatus === "uploading";
                  const isSuccess = file.uploadStatus === "success";
                  const isError = file.uploadStatus === "error";

                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white"
                    >
                      <div className="flex items-start gap-4">
                        {/* File Preview/Icon */}
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                            <Icon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            {!isUploading && !isSuccess && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(file.id)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {isSuccess && (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                            {isError && (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            )}
                          </div>

                          {/* Progress Bar */}
                          {isUploading && file.uploadProgress !== undefined && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Uploading...</span>
                                <span className="text-xs text-gray-600">{file.uploadProgress}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${file.uploadProgress}%` }}
                                  className="h-full bg-blue-600 rounded-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {files.length > 0
                ? `${files.length} file(s) selected`
                : "No files selected"}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={files.length === 0 || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

