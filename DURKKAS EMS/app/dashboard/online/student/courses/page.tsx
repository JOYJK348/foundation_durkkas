"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Video,
  FileText,
  Download,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  Bookmark,
  Search,
  Filter,
  Clock,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Play,
  FileCheck,
  Eye,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ContentViewer } from "@/components/courses/content-viewer";
import { formatDocumentForDisplay, type ParsedDocument } from "@/lib/document-parser";
import { generateContent, formatContentForDisplay, type CourseContent, type ContentBlock } from "@/lib/content-manager";
import { BackButton } from "@/components/navigation/back-button";

// Fetch uploaded documents (in production, this would be an API call)
const getUploadedDocuments = (): ParsedDocument[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem("tutor_documents");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Content data for each subtopic
const getContentForSubtopic = (subtopicId: string) => {
  // First, check if there's an uploaded document for this subtopic
  const uploadedDocs = getUploadedDocuments();
  const docForSubtopic = uploadedDocs.find((doc: any) => doc.subtopicId === subtopicId);
  
  if (docForSubtopic) {
    // Return formatted content from uploaded document
    const formattedContent = formatDocumentForDisplay(docForSubtopic);
    return {
      title: docForSubtopic.title,
      type: "content" as const,
      content: formattedContent,
    };
  }
  
  // Fallback to default content
  const contentMap: Record<string, any> = {
    "1.1.1": {
      title: "Basic Concept 1 - Introduction to Web Development",
      type: "video",
      content: [
        {
          type: "heading",
          content: "Welcome to Web Development",
        },
        {
          type: "paragraph",
          content: "Web development is the process of building websites and web applications that run on the internet. In this course, you'll learn everything from the fundamentals to advanced concepts that will help you become a full-stack developer.",
        },
        {
          type: "paragraph",
          content: "The web development landscape has evolved significantly over the years. Today, we have powerful frameworks, libraries, and tools that make building complex applications easier than ever before.",
        },
        {
          type: "heading",
          content: "What You'll Learn",
        },
        {
          type: "list",
          items: [
            "Understanding the core technologies: HTML, CSS, and JavaScript",
            "Building responsive and modern user interfaces",
            "Working with frameworks like React and Next.js",
            "Backend development with Node.js and databases",
            "Deployment and DevOps practices",
          ],
        },
        {
          type: "heading",
          content: "Course Structure",
        },
        {
          type: "paragraph",
          content: "This course is divided into multiple modules, each building upon the previous one. You'll start with the basics and gradually move to more advanced topics.",
        },
        {
          type: "quote",
          content: "The best way to learn web development is by building real projects. Theory alone won't make you a developer - practice will.",
        },
      ],
    },
    "1.1.2": {
      title: "Basic Concept 2 - Setting Up Your Development Environment",
      type: "video",
      content: [
        {
          type: "heading",
          content: "Development Environment Setup",
        },
        {
          type: "paragraph",
          content: "Before you start coding, you need to set up your development environment. This includes installing the necessary tools and configuring your workspace for optimal productivity.",
        },
        {
          type: "heading",
          content: "Required Tools",
        },
        {
          type: "list",
          items: [
            "Code Editor: VS Code (recommended) or any modern editor",
            "Node.js and npm: For running JavaScript and managing packages",
            "Git: For version control",
            "Browser DevTools: Built into modern browsers",
          ],
        },
        {
          type: "heading",
          content: "Installing Node.js",
        },
        {
          type: "paragraph",
          content: "Node.js is a JavaScript runtime that allows you to run JavaScript on the server. Here's how to install it:",
        },
        {
          type: "code",
          content: `# Check if Node.js is installed
node --version

# If not installed, download from nodejs.org
# Or use a package manager:
# macOS: brew install node
# Linux: sudo apt install nodejs npm
# Windows: Download installer from nodejs.org`,
          language: "bash",
        },
        {
          type: "heading",
          content: "VS Code Extensions",
        },
        {
          type: "paragraph",
          content: "Recommended extensions for web development:",
        },
        {
          type: "list",
          items: [
            "ES7+ React/Redux/React-Native snippets",
            "Prettier - Code formatter",
            "ESLint - JavaScript linter",
            "GitLens - Git supercharged",
            "Live Server - For local development",
          ],
        },
        {
          type: "heading",
          content: "Creating Your First Project",
        },
        {
          type: "code",
          content: `# Create a new directory
mkdir my-first-project
cd my-first-project

# Initialize a new Node.js project
npm init -y

# Install dependencies
npm install express

# Create your first file
echo "console.log('Hello, World!');" > index.js

# Run your project
node index.js`,
          language: "bash",
        },
      ],
    },
    "1.2.1": {
      title: "Getting Started - HTML Fundamentals",
      type: "video",
      content: [
        {
          type: "heading",
          content: "HTML: The Foundation of Web Pages",
        },
        {
          type: "paragraph",
          content: "HTML (HyperText Markup Language) is the standard markup language for creating web pages. It provides the structure and content of a webpage, while CSS handles styling and JavaScript adds interactivity.",
        },
        {
          type: "heading",
          content: "Basic HTML Structure",
        },
        {
          type: "code",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Web Page</title>
</head>
<body>
    <h1>Welcome to Web Development</h1>
    <p>This is a paragraph of text.</p>
    <button>Click Me</button>
</body>
</html>`,
          language: "html",
        },
        {
          type: "heading",
          content: "Common HTML Elements",
        },
        {
          type: "paragraph",
          content: "Here are some essential HTML elements you'll use frequently:",
        },
        {
          type: "list",
          items: [
            "<h1> to <h6>: Headings of different sizes",
            "<p>: Paragraphs for text content",
            "<a>: Links to other pages or resources",
            "<img>: Images",
            "<div>: Container for grouping elements",
            "<span>: Inline container for styling",
            "<ul> and <ol>: Lists (unordered and ordered)",
            "<form>: Forms for user input",
          ],
        },
        {
          type: "heading",
          content: "Semantic HTML",
        },
        {
          type: "paragraph",
          content: "Semantic HTML uses elements that clearly describe their meaning. This improves accessibility and SEO:",
        },
        {
          type: "code",
          content: `<header>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
        </ul>
    </nav>
</header>

<main>
    <article>
        <h1>Article Title</h1>
        <p>Article content goes here...</p>
    </article>
</main>

<footer>
    <p>&copy; 2024 My Website</p>
</footer>`,
          language: "html",
        },
        {
          type: "quote",
          content: "Good HTML structure is the foundation of a great website. Take time to learn semantic HTML - it will make your code more maintainable and accessible.",
        },
      ],
    },
    "1.2.2": {
      title: "Core Concepts - CSS Styling",
      type: "video",
      content: [
        {
          type: "heading",
          content: "CSS: Making Websites Beautiful",
        },
        {
          type: "paragraph",
          content: "CSS (Cascading Style Sheets) is used to style and layout web pages. It allows you to control colors, fonts, spacing, positioning, and much more.",
        },
        {
          type: "heading",
          content: "CSS Syntax",
        },
        {
          type: "code",
          content: `/* CSS Rule Structure */
selector {
    property: value;
    another-property: value;
}

/* Example */
h1 {
    color: blue;
    font-size: 32px;
    margin-bottom: 20px;
}`,
          language: "css",
        },
        {
          type: "heading",
          content: "CSS Selectors",
        },
        {
          type: "paragraph",
          content: "Selectors determine which elements the styles apply to:",
        },
        {
          type: "code",
          content: `/* Element selector */
p { color: red; }

/* Class selector */
.button { background: blue; }

/* ID selector */
#header { height: 80px; }

/* Descendant selector */
nav ul li { display: inline; }

/* Pseudo-class */
a:hover { color: green; }`,
          language: "css",
        },
        {
          type: "heading",
          content: "Flexbox Layout",
        },
        {
          type: "paragraph",
          content: "Flexbox is a powerful layout method for arranging items in a container:",
        },
        {
          type: "code",
          content: `.container {
    display: flex;
    justify-content: center; /* Horizontal alignment */
    align-items: center;     /* Vertical alignment */
    gap: 20px;               /* Space between items */
    flex-wrap: wrap;         /* Allow wrapping */
}

.item {
    flex: 1;                 /* Grow to fill space */
    min-width: 200px;
}`,
          language: "css",
        },
        {
          type: "heading",
          content: "CSS Grid",
        },
        {
          type: "paragraph",
          content: "Grid is perfect for two-dimensional layouts:",
        },
        {
          type: "code",
          content: `.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 20px;
}

.grid-item {
    grid-column: span 1;
    grid-row: span 1;
}`,
          language: "css",
        },
        {
          type: "heading",
          content: "Responsive Design",
        },
        {
          type: "paragraph",
          content: "Media queries allow you to apply styles based on screen size:",
        },
        {
          type: "code",
          content: `/* Mobile first approach */
.container {
    padding: 10px;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        padding: 20px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        padding: 40px;
        max-width: 1200px;
        margin: 0 auto;
    }
}`,
          language: "css",
        },
      ],
    },
    "1.2.3": {
      title: "Practice Exercise - Build Your First Web Page",
      type: "content",
      content: [
        {
          type: "heading",
          content: "Assignment: Create a Personal Portfolio Page",
        },
        {
          type: "paragraph",
          content: "In this exercise, you'll create a simple personal portfolio webpage using HTML and CSS. This will help you practice the concepts you've learned so far.",
        },
        {
          type: "heading",
          content: "Requirements",
        },
        {
          type: "list",
          items: [
            "Create an HTML file with proper structure",
            "Include a header with navigation",
            "Add a hero section with your name and title",
            "Create an 'About Me' section",
            "Add a 'Projects' section with at least 3 projects",
            "Include a footer with contact information",
            "Style everything with CSS (external stylesheet)",
            "Make it responsive using media queries",
          ],
        },
        {
          type: "heading",
          content: "HTML Structure Template",
        },
        {
          type: "code",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h1>Your Name</h1>
            <p>Web Developer</p>
        </section>
        
        <section id="about">
            <h2>About Me</h2>
            <p>Write a brief introduction about yourself...</p>
        </section>
        
        <section id="projects">
            <h2>My Projects</h2>
            <div class="project-grid">
                <!-- Add your projects here -->
            </div>
        </section>
    </main>
    
    <footer id="contact">
        <p>Contact: your.email@example.com</p>
    </footer>
</body>
</html>`,
          language: "html",
        },
        {
          type: "heading",
          content: "CSS Styling Tips",
        },
        {
          type: "list",
          items: [
            "Use a color scheme (2-3 main colors)",
            "Add hover effects to links and buttons",
            "Use flexbox or grid for layouts",
            "Add smooth transitions",
            "Ensure good contrast for readability",
            "Test on different screen sizes",
          ],
        },
        {
          type: "heading",
          content: "Submission Guidelines",
        },
        {
          type: "paragraph",
          content: "Submit your completed assignment by:",
        },
        {
          type: "list",
          items: [
            "Creating a folder with your name",
            "Including both HTML and CSS files",
            "Adding a README.md with a brief description",
            "Uploading to the assignment portal",
            "Including screenshots of your page",
          ],
        },
        {
          type: "quote",
          content: "Don't worry about making it perfect - focus on getting it working first. You can always improve and refactor later!",
        },
      ],
    },
  };

  return contentMap[subtopicId] || {
    title: "Content Not Available",
    type: "content",
    content: [
      {
        type: "paragraph",
        content: "Content for this lesson is coming soon!",
      },
    ],
  };
};

// Dynamic Content System - Works for any course type
// This can be extended with API calls or database queries
const getDynamicContent = (subtopicId: string, subtopicTitle: string, courseCategory?: string) => {
  // First, check for custom content stored (from tutors or API)
  if (typeof window !== "undefined") {
    try {
      const customContent = localStorage.getItem(`content_${subtopicId}`);
      if (customContent) {
        const parsed = JSON.parse(customContent);
        return {
          title: parsed.title || subtopicTitle,
          type: parsed.type || "content",
          content: parsed.content || [],
        };
      }
    } catch (e) {
      console.error("Error loading custom content:", e);
    }
  }

  // Determine category from course structure or default
  const category = courseCategory || "general";
  
  // Generate content based on category and topic
  const generatedContent = generateContent(subtopicTitle, category as any);
  const formattedContent = formatContentForDisplay(generatedContent, {
    includeCategoryStyling: true,
  });

  return {
    title: generatedContent.title,
    type: generatedContent.type,
    content: formattedContent,
  };
};

// Legacy function for backward compatibility - now uses dynamic system
const getWebDevelopmentContent = (subtopicId: string, courseStructure: any[]) => {
  // Get subtopic title from course structure
  const subtopic = getSubtopicById(subtopicId, courseStructure);
  const title = subtopic?.title || "Course Content";
  
  // Get course category
  const category = getCourseCategory(courseStructure);
  
  // Use dynamic content system
  return getDynamicContent(subtopicId, title, category);
};

// Helper to get subtopic by ID from course structure
const getSubtopicById = (subtopicId: string, courseStructure: any[]) => {
  for (const level of courseStructure) {
    for (const module of level.modules || []) {
      const found = module.subtopics?.find((s: any) => s.id === subtopicId);
      if (found) return found;
    }
  }
  return null;
};

// Get course category from course structure or metadata
const getCourseCategory = (courseStructure: any[]): string => {
  // Check if course has category metadata
  // This could come from API/database
  const courseTitle = courseStructure[0]?.title?.toLowerCase() || "";
  
  // Auto-detect category from title/keywords
  if (courseTitle.includes("kids") || courseTitle.includes("children")) return "kids";
  if (courseTitle.includes("language") || courseTitle.includes("spanish") || courseTitle.includes("french")) return "language";
  if (courseTitle.includes("web") || courseTitle.includes("coding") || courseTitle.includes("programming")) return "technical";
  if (courseTitle.includes("business") || courseTitle.includes("marketing")) return "business";
  if (courseTitle.includes("art") || courseTitle.includes("music") || courseTitle.includes("drawing")) return "arts";
  
  return "general";
};

// Note: The dynamic content system now generates content based on category
// Custom content can be stored in localStorage with key: content_{subtopicId}
// Format: { title: string, type: string, content: ContentBlock[] }
//
// The system automatically:
// 1. Checks for custom content in localStorage
// 2. Detects course category from course title/keywords
// 3. Generates appropriate content based on category (kids, language, technical, etc.)
// 4. Falls back to general content if category not detected
//
// Categories supported:
// - kids: Fun, encouraging content with emojis
// - language: Educational language learning content
// - technical: Professional technical content with code examples
// - business: Business-focused content
// - arts: Creative and inspirational content
// - general: Balanced, friendly content (default)

export default function CourseContentPage() {
  const [expandedModule, setExpandedModule] = useState<string | null>("1.1");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContent, setSelectedContent] = useState<{
    subtopicId: string;
    title: string;
    type: "video" | "content";
    content: any[];
  } | null>(null);
  const [isContentViewerOpen, setIsContentViewerOpen] = useState(false);

  const courseStructure = [
    {
      id: "1",
      title: "Introduction",
      description: "Get started with the fundamentals",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
      modules: [
        {
          id: "1.1",
          title: "Why this course?",
          duration: "45 min",
          thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
          subtopics: [
            { id: "1.1.1", title: "Basic Concept 1", type: "video", completed: true, duration: "15 min" },
            { id: "1.1.2", title: "Basic Concept 2", type: "video", completed: true, duration: "20 min" },
          ],
        },
        {
          id: "1.2",
          title: "Fundamentals",
          duration: "1.5 hrs",
          thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
          subtopics: [
            { id: "1.2.1", title: "Getting Started", type: "video", completed: true, duration: "25 min" },
            { id: "1.2.2", title: "Core Concepts", type: "video", completed: false, duration: "30 min" },
            { id: "1.2.3", title: "Practice Exercise", type: "assignment", completed: false, duration: "20 min" },
          ],
        },
      ],
    },
    {
      id: "2",
      title: "Advanced Topics",
      description: "Deep dive into advanced concepts",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      modules: [
        {
          id: "2.1",
          title: "Advanced Concepts",
          duration: "2 hrs",
          thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop",
          subtopics: [
            { id: "2.1.1", title: "Advanced Topic 1", type: "video", completed: false, duration: "45 min" },
          ],
        },
      ],
    },
  ];

  // Calculate overall progress
  const totalTopics = courseStructure.reduce((acc, level) => 
    acc + (level.modules?.reduce((sum, mod) => sum + (mod.subtopics?.length || 0), 0) || 0), 0
  );
  const completedTopics = courseStructure.reduce((acc, level) => 
    acc + (level.modules?.reduce((sum, mod) => 
      sum + (mod.subtopics?.filter(s => s.completed).length || 0), 0) || 0), 0
  );
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleContentClick = (subtopicId: string) => {
    const contentData = getContentForSubtopic(subtopicId);
    setSelectedContent({
      subtopicId,
      title: contentData.title,
      type: contentData.type as "video" | "content",
      content: contentData.content,
    });
    setIsContentViewerOpen(true);
  };

  const handleViewContentClick = (subtopicId: string) => {
    // Use dynamic content system that works for any course type
    const contentData = getWebDevelopmentContent(subtopicId, courseStructure);
    setSelectedContent({
      subtopicId,
      title: contentData.title,
      type: contentData.type as "video" | "content",
      content: contentData.content,
    });
    setIsContentViewerOpen(true);
  };

  const handleMarkComplete = (subtopicId: string) => {
    // In a real app, this would update the backend
    // For now, we'll just close the viewer
    setIsContentViewerOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">
        <TopNavbar />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Hero Section with Progress */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 md:mb-8"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden relative">
              {/* Background Thumbnail */}
              <div className="absolute inset-0 opacity-20">
                <Image
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop"
                  alt="Web Development Course"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-700/80 to-blue-800/80" />
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              <CardContent className="p-4 sm:p-6 md:p-8 relative z-10">
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="flex-1">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      {/* Course Thumbnail */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
                        <Image
                          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop"
                          alt="Web Development Course"
                          fill
                          sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-transparent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 leading-tight">
                          Web Development - Full Stack
                        </h1>
                        <p className="text-blue-100 text-xs sm:text-sm md:text-base">
                          Master full-stack development with hands-on projects
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 sm:mt-6 space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-medium">Course Progress</span>
                        <span className="font-bold text-base sm:text-lg">{overallProgress}%</span>
                      </div>
                      <div className="h-2.5 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${overallProgress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-white rounded-full shadow-lg"
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-blue-100">
                        <span>{completedTopics} of {totalTopics} lessons completed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-white/95 backdrop-blur-sm text-blue-600 hover:bg-white hover:shadow-xl shadow-lg font-semibold transition-all duration-300 border-2 border-white/20 text-sm sm:text-base h-11 sm:h-12"
                    >
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="whitespace-nowrap">Continue Learning</span>
                    </Button>
                    <Button 
                      size="lg"
                      className="w-full sm:w-auto bg-white/95 backdrop-blur-sm text-blue-600 hover:bg-white hover:shadow-xl shadow-lg font-semibold transition-all duration-300 border-2 border-white/20 text-sm sm:text-base h-11 sm:h-12"
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="whitespace-nowrap">Download</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 sm:mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search lessons, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base border-gray-200 focus:border-blue-600 focus:ring-blue-600 shadow-sm"
              />
            </div>
          </motion.div>


          {/* Course Structure */}
          <div className="space-y-4 sm:space-y-6">
            {courseStructure.map((level, levelIndex) => {
              const levelProgress = level.modules && level.modules.length > 0
                ? level.modules.reduce((acc, mod) => {
                    const completed = mod.subtopics?.filter(s => s.completed).length || 0;
                    const total = mod.subtopics?.length || 0;
                    return acc + (total > 0 ? (completed / total) : 0);
                  }, 0) / level.modules.length * 100
                : 0;
              
              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + levelIndex * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md flex-shrink-0">
                            <span className="text-white font-bold text-base sm:text-lg">{level.id}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-xl md:text-2xl text-gray-900 mb-1 leading-tight">
                              {level.title}
                            </CardTitle>
                            {level.description && (
                              <CardDescription className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                {level.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-lg shadow-sm w-fit sm:w-auto">
                          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">
                            {Math.round(levelProgress)}%
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 space-y-3">
                      {level.modules.map((module, moduleIndex) => {
                        const isExpanded = expandedModule === module.id;
                        const completedCount = module.subtopics?.filter((s) => s.completed).length || 0;
                        const totalCount = module.subtopics?.length || 0;
                        const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                        const nextLesson = module.subtopics?.find(s => !s.completed);
                        const nextLessonId = nextLesson?.id;
                        const isCompleted = totalCount > 0 && completedCount === totalCount;
                        
                        return (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: moduleIndex * 0.05 }}
                            className="group relative"
                          >
                            <div className={`relative overflow-hidden rounded-lg sm:rounded-xl border transition-all duration-300 ${
                              isExpanded
                                ? "border-blue-300 bg-gradient-to-br from-blue-50/50 to-white shadow-lg"
                                : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-md"
                            }`}>
                              {/* Progress indicator bar */}
                              <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gray-100">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercent}%` }}
                                  transition={{ duration: 0.6, ease: "easeOut" }}
                                  className={`h-full ${
                                    isCompleted
                                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                                  }`}
                                />
                              </div>

                              <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent transition-all duration-200"
                              >
                                <div className="flex items-start gap-3 sm:gap-4 md:gap-5 flex-1 min-w-0 w-full">
                                  {/* Thumbnail Image */}
                                  <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-300 shadow-sm">
                                    {module.thumbnail ? (
                                      <Image
                                        src={module.thumbnail}
                                        alt={module.title}
                                        fill
                                        sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                        <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                      </div>
                                    )}
                                    {/* Overlay gradient for better text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    {/* Module Number Badge Overlay */}
                                    <div className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg ${
                                      isCompleted
                                        ? "bg-green-500"
                                        : "bg-blue-600"
                                    }`}>
                                      {isCompleted ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                      ) : (
                                        <span>{module.id}</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Module Number Badge - Hidden on mobile, shown on larger screens as fallback */}
                                  <div className={`hidden lg:flex flex-shrink-0 w-12 h-12 rounded-lg sm:rounded-xl items-center justify-center transition-all duration-300 ${
                                    isExpanded
                                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                                      : isCompleted
                                      ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700"
                                      : "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 group-hover:scale-105"
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                                    ) : (
                                      <span className="text-base sm:text-lg font-bold">{module.id}</span>
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3">
                                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors leading-tight">
                                          {module.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                          <div className="flex items-center gap-1 sm:gap-1.5">
                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span>{module.duration}</span>
                                          </div>
                                          <div className="flex items-center gap-1 sm:gap-1.5">
                                            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span>{totalCount} lessons</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Progress Badge - Mobile: below title, Desktop: right side */}
                                      <div className={`flex-shrink-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm ${
                                        isCompleted
                                          ? "bg-green-100 text-green-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}>
                                        {Math.round(progressPercent)}%
                                      </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5 sm:space-y-2">
                                      <div className="flex items-center justify-between text-xs text-gray-600">
                                        <span>Progress</span>
                                        <span className="font-medium text-xs">{completedCount} of {totalCount} completed</span>
                                      </div>
                                      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${progressPercent}%` }}
                                          transition={{ duration: 0.8, ease: "easeOut" }}
                                          className={`h-full rounded-full ${
                                            isCompleted
                                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                              : "bg-gradient-to-r from-blue-500 to-indigo-500"
                                          }`}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Area - Mobile: full width, Desktop: right side */}
                                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto sm:ml-4 flex-shrink-0">
                                  {!isExpanded && nextLesson && (
                                    <motion.div
                                      className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex-1 sm:flex-initial"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleModule(module.id);
                                      }}
                                    >
                                      <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                      <span className="text-xs sm:text-sm font-semibold">Resume</span>
                                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:block" />
                                    </motion.div>
                                  )}
                                  
                                  {/* Expand/Collapse Icon */}
                                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                                    isExpanded
                                      ? "bg-blue-100 text-blue-600 rotate-180"
                                      : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                                  }`}>
                                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 transition-transform" />
                                  </div>
                                </div>
                              </button>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                  className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/30"
                                >
                                  <div className="p-3 sm:p-4 md:p-6 space-y-2">
                                    <div className="px-2 pb-2 sm:pb-3 mb-2 border-b border-gray-100">
                                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Lessons ({totalCount})
                                      </h4>
                                    </div>
                                    {module.subtopics.map((subtopic, idx) => (
                                      <motion.div
                                        key={subtopic.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`group/item relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all duration-200 ${
                                          subtopic.completed
                                            ? "bg-green-50/50 border border-green-200/50 hover:border-green-300 hover:bg-green-50"
                                            : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:bg-blue-50/30"
                                        }`}
                                      >
                                        {/* Status Indicator */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 rounded-l-lg ${
                                          subtopic.completed
                                            ? "bg-green-500"
                                            : nextLessonId && subtopic.id === nextLessonId
                                            ? "bg-blue-500"
                                            : "bg-gray-300"
                                        }`} />

                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-all ${
                                          subtopic.completed
                                            ? "bg-green-100 text-green-700"
                                            : subtopic.type === "video"
                                            ? "bg-blue-100 text-blue-700 group-hover/item:bg-blue-200"
                                            : "bg-purple-100 text-purple-700 group-hover/item:bg-purple-200"
                                        }`}>
                                          {subtopic.completed ? (
                                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                          ) : subtopic.type === "video" ? (
                                            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                                          ) : (
                                            <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                          )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2">
                                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                            <span className="text-xs font-mono font-semibold text-gray-400">
                                              {subtopic.id}
                                            </span>
                                            <span className={`font-semibold text-sm sm:text-base leading-tight ${
                                              subtopic.completed ? "text-green-900" : "text-gray-900"
                                            }`}>
                                              {subtopic.title}
                                            </span>
                                            {nextLessonId && subtopic.id === nextLessonId && (
                                              <span className="px-1.5 sm:px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md whitespace-nowrap">
                                                Next
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {subtopic.duration}
                                            </span>
                                            <span className="text-gray-300 hidden sm:inline">•</span>
                                            <span className="capitalize font-medium">
                                              {subtopic.type === "video" ? "Video" : "Assignment"}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Action */}
                                        <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 w-full sm:w-auto">
                                          {subtopic.completed && (
                                            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-green-100 rounded-md">
                                              <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                                              <span className="text-xs font-semibold text-green-700 hidden sm:inline">Completed</span>
                                            </div>
                                          )}
                                          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                                            <Button 
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleContentClick(subtopic.id);
                                              }}
                                              className={`h-8 sm:h-9 px-3 sm:px-4 ${
                                                subtopic.completed
                                                  ? "bg-green-600 hover:bg-green-700"
                                                  : subtopic.type === "video"
                                                  ? "bg-blue-600 hover:bg-blue-700"
                                                  : "bg-purple-600 hover:bg-purple-700"
                                              } text-white shadow-sm hover:shadow-md transition-all text-xs sm:text-sm`}
                                            >
                                              {subtopic.type === "video" ? (
                                                <>
                                                  <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                                  <span className="font-semibold">Watch</span>
                                                </>
                                              ) : (
                                                <>
                                                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                                  <span className="font-semibold">Open</span>
                                                </>
                                              )}
                                            </Button>
                                            <Button 
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewContentClick(subtopic.id);
                                              }}
                                              variant="outline"
                                              className="h-8 sm:h-9 px-3 sm:px-4 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all text-xs sm:text-sm"
                                            >
                                              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                              <span className="font-semibold">View Content</span>
                                            </Button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Viewer */}
      {selectedContent && (
        <ContentViewer
          open={isContentViewerOpen}
          onOpenChange={setIsContentViewerOpen}
          title={selectedContent.title}
          content={selectedContent.content}
          type={selectedContent.type}
          isCompleted={courseStructure
            .flatMap((level) => level.modules || [])
            .flatMap((module) => module.subtopics || [])
            .find((s) => s.id === selectedContent.subtopicId)?.completed || false}
          onComplete={() => handleMarkComplete(selectedContent.subtopicId)}
        />
      )}
    </DashboardLayout>
  );
}

