"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Video, FileText, Download, Bookmark, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ContentBlock {
  type: "heading" | "paragraph" | "code" | "list" | "quote" | "video" | "image";
  content: string;
  language?: string;
  items?: string[];
  url?: string;
}

interface ContentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: ContentBlock[];
  type: "video" | "content";
  onComplete?: () => void;
  isCompleted?: boolean;
}

export function ContentViewer({
  open,
  onOpenChange,
  title,
  content,
  type,
  onComplete,
  isCompleted = false,
}: ContentViewerProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const renderContent = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case "heading":
        return (
          <h2
            key={index}
            className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4 first:mt-0 border-b border-gray-200 pb-2"
          >
            {block.content}
          </h2>
        );
      case "paragraph":
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
            {block.content}
          </p>
        );
      case "code":
        return (
          <div key={index} className="my-4 sm:my-6">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-400 font-mono">{block.language || "code"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 sm:h-7 px-2 text-xs text-gray-400 hover:text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(block.content);
                  }}
                >
                  Copy
                </Button>
              </div>
              <pre className="p-3 sm:p-4 overflow-x-auto">
                <code className="text-xs sm:text-sm text-gray-100 font-mono leading-relaxed">{block.content}</code>
              </pre>
            </div>
          </div>
        );
      case "list":
        return (
          <ul key={index} className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-gray-700 ml-2 sm:ml-4 text-sm sm:text-base">
            {block.items?.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
      case "quote":
        return (
          <blockquote
            key={index}
            className="border-l-4 border-blue-500 pl-3 sm:pl-4 py-2 my-3 sm:my-4 bg-blue-50 italic text-gray-700 text-sm sm:text-base"
          >
            {block.content}
          </blockquote>
        );
      case "video":
        return (
          <div key={index} className="my-6">
            <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={block.url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">{block.content}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 sm:rounded-lg">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 pr-2">{title}</DialogTitle>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`h-8 w-8 sm:h-9 sm:w-9 ${isBookmarked ? "text-yellow-500" : ""}`}
              >
                <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 sm:h-9 sm:w-9">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="prose prose-sm sm:prose-base max-w-none"
            >
              {type === "video" && (
                <div className="mb-6">
                  <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={title}
                    />
                  </div>
                  <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      <span className="font-semibold text-blue-900 text-sm sm:text-base">Video Lesson</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700">{title}</p>
                  </div>
                </div>
              )}

              {content.map((block, index) => renderContent(block, index))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Download Notes</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            {!isCompleted && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                onClick={() => {
                  onComplete?.();
                  onOpenChange(false);
                }}
              >
                Mark Complete
              </Button>
            )}
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

