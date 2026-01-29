/**
 * Document Parser Utility
 * Extracts raw text content from various document formats
 * Used for displaying tutor-uploaded documents as raw content
 */

export interface ParsedDocument {
  title: string;
  content: string;
  metadata: {
    type: string;
    size: number;
    uploadedAt: string;
    pages?: number;
    wordCount?: number;
  };
  sections: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

/**
 * Parse text content from uploaded document
 * In production, this would use libraries like pdf-parse, mammoth, etc.
 * For now, we'll simulate document parsing with structured content
 */
export function parseDocument(
  file: File,
  rawContent?: string
): Promise<ParsedDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const fileName = file.name;
        const fileType = getFileType(file.name);
        const content = rawContent || (e.target?.result as string) || "";

        // Extract sections from content
        const sections = extractSections(content, fileType);

        const document: ParsedDocument = {
          title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
          content: content,
          metadata: {
            type: fileType,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            wordCount: content.split(/\s+/).length,
          },
          sections,
        };

        resolve(document);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));

    // For text-based files, read as text
    if (file.type.startsWith("text/") || file.type === "application/json") {
      reader.readAsText(file);
    } else {
      // For binary files (PDF, Word), we'd need server-side processing
      // For now, simulate with a placeholder
      setTimeout(() => {
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ""),
          content: `[Document content extracted from ${file.name}]\n\nThis is a placeholder for the actual document content. In production, this would be extracted using server-side libraries like pdf-parse for PDFs or mammoth for Word documents.`,
          metadata: {
            type: getFileType(file.name),
            size: file.size,
            uploadedAt: new Date().toISOString(),
          },
          sections: [],
        });
      }, 100);
    }
  });
}

/**
 * Extract sections from document content
 * Identifies headings and organizes content into sections
 */
function extractSections(content: string, fileType: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  
  if (!content || content.trim().length === 0) {
    return sections;
  }

  // Split content by common heading patterns
  const lines = content.split("\n");
  let currentSection: DocumentSection | null = null;
  let sectionOrder = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect headings (lines that are short, uppercase, or have specific patterns)
    const isHeading =
      line.length > 0 &&
      line.length < 100 &&
      (line.match(/^#{1,6}\s/) || // Markdown headings
        line.match(/^\d+\.\s+[A-Z]/) || // Numbered headings
        line === line.toUpperCase() ||
        line.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/)); // Title case

    if (isHeading && line.length > 3) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }

      // Create new section
      sectionOrder++;
      currentSection = {
        id: `section-${sectionOrder}`,
        title: line.replace(/^#+\s*/, "").replace(/^\d+\.\s*/, ""),
        content: "",
        order: sectionOrder,
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += (currentSection.content ? "\n" : "") + line;
    }
  }

  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections found, create one with all content
  if (sections.length === 0 && content.trim().length > 0) {
    sections.push({
      id: "section-1",
      title: "Content",
      content: content,
      order: 1,
    });
  }

  return sections;
}

/**
 * Get file type from filename
 */
function getFileType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  
  const typeMap: Record<string, string> = {
    pdf: "PDF",
    doc: "Word",
    docx: "Word",
    txt: "Text",
    md: "Markdown",
    html: "HTML",
    json: "JSON",
    csv: "CSV",
  };

  return typeMap[extension] || extension.toUpperCase();
}

/**
 * Format document content for display
 * Converts raw text into structured content blocks
 */
export function formatDocumentForDisplay(
  document: ParsedDocument
): Array<{
  type: "heading" | "paragraph" | "code" | "list" | "quote";
  content: string;
  items?: string[];
}> {
  const blocks: Array<{
    type: "heading" | "paragraph" | "code" | "list" | "quote";
    content: string;
    items?: string[];
  }> = [];

  if (document.sections.length > 0) {
    // Use sections if available
    document.sections.forEach((section) => {
      blocks.push({
        type: "heading",
        content: section.title,
      });

      // Parse section content
      const sectionBlocks = parseContentBlocks(section.content);
      blocks.push(...sectionBlocks);
    });
  } else {
    // Parse entire content
    const contentBlocks = parseContentBlocks(document.content);
    blocks.push(...contentBlocks);
  }

  return blocks;
}

/**
 * Parse content into structured blocks
 */
function parseContentBlocks(content: string): Array<{
  type: "heading" | "paragraph" | "code" | "list" | "quote";
  content: string;
  items?: string[];
}> {
  const blocks: Array<{
    type: "heading" | "paragraph" | "code" | "list" | "quote";
    content: string;
    items?: string[];
  }> = [];

  const lines = content.split("\n");
  let currentParagraph = "";
  let inCodeBlock = false;
  let codeContent = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        blocks.push({
          type: "code",
          content: codeContent.trim(),
        });
        codeContent = "";
        inCodeBlock = false;
      } else {
        if (currentParagraph) {
          blocks.push({
            type: "paragraph",
            content: currentParagraph.trim(),
          });
          currentParagraph = "";
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      continue;
    }

    // Headings
    if (trimmed.match(/^#{1,6}\s/)) {
      if (currentParagraph) {
        blocks.push({
          type: "paragraph",
          content: currentParagraph.trim(),
        });
        currentParagraph = "";
      }
      blocks.push({
        type: "heading",
        content: trimmed.replace(/^#+\s*/, ""),
      });
      continue;
    }

    // Lists
    if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+\.\s/)) {
      if (currentParagraph) {
        blocks.push({
          type: "paragraph",
          content: currentParagraph.trim(),
        });
        currentParagraph = "";
      }

      const listItems: string[] = [];
      let i = lines.indexOf(line);
      while (i < lines.length) {
        const listLine = lines[i].trim();
        if (listLine.match(/^[-*•]\s/) || listLine.match(/^\d+\.\s/)) {
          listItems.push(listLine.replace(/^[-*•]\d+\.\s*/, ""));
          i++;
        } else if (listLine === "") {
          break;
        } else {
          break;
        }
      }

      if (listItems.length > 0) {
        blocks.push({
          type: "list",
          items: listItems,
          content: "",
        });
      }
      continue;
    }

    // Quotes
    if (trimmed.startsWith(">")) {
      if (currentParagraph) {
        blocks.push({
          type: "paragraph",
          content: currentParagraph.trim(),
        });
        currentParagraph = "";
      }
      blocks.push({
        type: "quote",
        content: trimmed.replace(/^>\s*/, ""),
      });
      continue;
    }

    // Regular paragraphs
    if (trimmed === "") {
      if (currentParagraph) {
        blocks.push({
          type: "paragraph",
          content: currentParagraph.trim(),
        });
        currentParagraph = "";
      }
    } else {
      currentParagraph += (currentParagraph ? " " : "") + line;
    }
  }

  // Add remaining paragraph
  if (currentParagraph.trim()) {
    blocks.push({
      type: "paragraph",
      content: currentParagraph.trim(),
    });
  }

  return blocks;
}

