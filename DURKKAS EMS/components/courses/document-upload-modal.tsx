"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  X,
  FileText,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Save,
} from "lucide-react";
import { parseDocument, formatDocumentForDisplay, type ParsedDocument } from "@/lib/document-parser";
import { useToast } from "@/components/ui/use-toast";

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (document: ParsedDocument) => void;
  moduleId?: string;
  subtopicId?: string;
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  onSave,
  moduleId,
  subtopicId,
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [parsedDocument, setParsedDocument] = useState<ParsedDocument | null>(null);
  const [previewContent, setPreviewContent] = useState<any[]>([]);
  const [rawContent, setRawContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    setIsUploading(true);

    try {
      // Read file as text for preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        setRawContent(content || "");

        // Parse document
        const parsed = await parseDocument(selectedFile, content);
        setParsedDocument(parsed);

        // Format for preview
        const formatted = formatDocumentForDisplay(parsed);
        setPreviewContent(formatted);

        setIsUploading(false);
      };

      reader.onerror = () => {
        setIsUploading(false);
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive",
        });
      };

      if (selectedFile.type.startsWith("text/") || selectedFile.type === "application/json") {
        reader.readAsText(selectedFile);
      } else {
        // For binary files, simulate parsing
        const parsed = await parseDocument(selectedFile);
        setParsedDocument(parsed);
        const formatted = formatDocumentForDisplay(parsed);
        setPreviewContent(formatted);
        setIsUploading(false);
      }
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Error",
        description: "Failed to parse document",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSave = () => {
    if (!parsedDocument || !title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title and upload a document",
        variant: "destructive",
      });
      return;
    }

    // Update title if changed and add metadata
    const finalDocument = {
      ...parsedDocument,
      title: title.trim(),
      subtopicId: subtopicId,
      moduleId: moduleId,
    } as ParsedDocument & { subtopicId?: string; moduleId?: string };

    onSave(finalDocument as any);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setTitle("");
    setParsedDocument(null);
    setPreviewContent([]);
    setRawContent("");
    setIsUploading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Upload Document Content
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Upload Area */}
            {!file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop a file here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.html,.json"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  Select File
                </Button>
              </motion.div>
            )}

            {/* File Info */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setTitle("");
                    setParsedDocument(null);
                    setPreviewContent([]);
                    setRawContent("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Title Input */}
            {file && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="w-full"
                />
              </div>
            )}

            {/* Raw Content Preview */}
            {rawContent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raw Content Preview
                </label>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                    {rawContent.substring(0, 2000)}
                    {rawContent.length > 2000 && "..."}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {rawContent.length} characters • {rawContent.split(/\s+/).length} words
                </p>
              </div>
            )}

            {/* Formatted Content Preview */}
            {previewContent.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formatted Preview
                </label>
                <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                  {previewContent.slice(0, 10).map((block, index) => (
                    <div key={index} className="mb-4">
                      {block.type === "heading" && (
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {block.content}
                        </h3>
                      )}
                      {block.type === "paragraph" && (
                        <p className="text-gray-700 mb-2">{block.content}</p>
                      )}
                      {block.type === "list" && block.items && (
                        <ul className="list-disc list-inside ml-4 mb-2">
                          {block.items.map((item, idx) => (
                            <li key={idx} className="text-gray-700">
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {block.type === "code" && (
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto mb-2">
                          <code>{block.content}</code>
                        </pre>
                      )}
                      {block.type === "quote" && (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-2">
                          {block.content}
                        </blockquote>
                      )}
                    </div>
                  ))}
                  {previewContent.length > 10 && (
                    <p className="text-sm text-gray-500">
                      ... and {previewContent.length - 10} more blocks
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Document Metadata */}
            {parsedDocument && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold">{parsedDocument.metadata.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="font-semibold">
                    {(parsedDocument.metadata.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sections</p>
                  <p className="font-semibold">{parsedDocument.sections.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Word Count</p>
                  <p className="font-semibold">
                    {parsedDocument.metadata.wordCount?.toLocaleString() || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!parsedDocument || !title.trim() || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Document
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

