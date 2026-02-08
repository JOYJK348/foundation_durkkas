/**
 * Content Manager - Dynamic Content System
 * Handles content for any course type (Kids, Language, Technical, etc.)
 * Top-tier MNC approach: Scalable, maintainable, and flexible
 */

export interface ContentBlock {
  type: "heading" | "paragraph" | "code" | "list" | "quote" | "video" | "image" | "table";
  content: string;
  language?: string;
  items?: string[];
  url?: string;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export interface CourseContent {
  title: string;
  type: "video" | "content" | "interactive";
  category: "kids" | "language" | "technical" | "business" | "arts" | "general";
  content: ContentBlock[];
  metadata?: {
    ageGroup?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    duration?: string;
    language?: string;
  };
}

/**
 * Content Templates for different course types
 * These can be overridden or extended dynamically
 */
export const contentTemplates = {
  kids: {
    style: "fun",
    tone: "encouraging",
    useEmojis: true,
    simpleLanguage: true,
  },
  language: {
    style: "educational",
    tone: "supportive",
    useExamples: true,
    includePronunciation: true,
  },
  technical: {
    style: "professional",
    tone: "informative",
    includeCode: true,
    detailed: true,
  },
  business: {
    style: "professional",
    tone: "authoritative",
    includeCaseStudies: true,
    practical: true,
  },
  arts: {
    style: "creative",
    tone: "inspirational",
    includeVisuals: true,
    expressive: true,
  },
  general: {
    style: "balanced",
    tone: "friendly",
    adaptable: true,
  },
};

/**
 * Generate content based on course type and provided data
 */
export function generateContent(
  topic: string,
  category: CourseContent["category"] = "general",
  customContent?: Partial<CourseContent>
): CourseContent {
  const template = contentTemplates[category];
  
  // Base content structure
  const baseContent: CourseContent = {
    title: topic,
    type: "content",
    category,
    content: [],
    metadata: {
      difficulty: "beginner",
    },
  };

  // Merge custom content if provided
  if (customContent) {
    return {
      ...baseContent,
      ...customContent,
      content: customContent.content || baseContent.content,
    };
  }

  // Generate default content based on category
  switch (category) {
    case "kids":
      baseContent.content = generateKidsContent(topic);
      baseContent.metadata = { ...baseContent.metadata, ageGroup: "5-12" };
      break;
    case "language":
      baseContent.content = generateLanguageContent(topic);
      baseContent.metadata = { ...baseContent.metadata, language: "English" };
      break;
    case "technical":
      baseContent.content = generateTechnicalContent(topic);
      baseContent.metadata = { ...baseContent.metadata, difficulty: "intermediate" };
      break;
    default:
      baseContent.content = generateGeneralContent(topic);
  }

  return baseContent;
}

/**
 * Generate content for Kids courses
 */
function generateKidsContent(topic: string): ContentBlock[] {
  return [
    {
      type: "heading",
      content: `🎉 Welcome to ${topic}! 🎉`,
      level: "h1",
    },
    {
      type: "paragraph",
      content: `Hey there, young learner! Are you ready to explore ${topic}? This is going to be so much fun! We'll learn together step by step.`,
    },
    {
      type: "heading",
      content: "What We'll Learn Today",
      level: "h2",
    },
    {
      type: "list",
      items: [
        `Understanding the basics of ${topic}`,
        "Fun activities and games",
        "Creative projects to try",
        "Sharing what we learned",
      ],
    },
    {
      type: "heading",
      content: "Let's Get Started! 🚀",
      level: "h2",
    },
    {
      type: "paragraph",
      content: `Learning ${topic} is like going on an adventure! Every step you take brings you closer to becoming amazing at it. Remember, it's okay to make mistakes - that's how we learn!`,
    },
    {
      type: "quote",
      content: "You're doing great! Keep going, little explorer! 🌟",
    },
  ];
}

/**
 * Generate content for Language courses
 */
function generateLanguageContent(topic: string): ContentBlock[] {
  return [
    {
      type: "heading",
      content: `Introduction to ${topic}`,
      level: "h1",
    },
    {
      type: "paragraph",
      content: `Welcome to your ${topic} language learning journey! In this lesson, we'll explore essential concepts and build a strong foundation.`,
    },
    {
      type: "heading",
      content: "Key Learning Objectives",
      level: "h2",
    },
    {
      type: "list",
      items: [
        `Master basic ${topic} vocabulary`,
        "Understand fundamental grammar rules",
        "Practice pronunciation and speaking",
        "Build confidence in conversations",
      ],
    },
    {
      type: "heading",
      content: "Important Concepts",
      level: "h2",
    },
    {
      type: "paragraph",
      content: `In ${topic}, we focus on practical communication. You'll learn how to express yourself clearly and understand others.`,
    },
    {
      type: "heading",
      content: "Practice Exercises",
      level: "h2",
    },
    {
      type: "paragraph",
      content: "Practice makes perfect! Try to use what you've learned in real conversations. Don't worry about making mistakes - they're part of the learning process.",
    },
    {
      type: "quote",
      content: "Language learning is a journey, not a destination. Enjoy every step!",
    },
  ];
}

/**
 * Generate content for Technical courses
 */
function generateTechnicalContent(topic: string): ContentBlock[] {
  return [
    {
      type: "heading",
      content: `${topic} - Technical Overview`,
      level: "h1",
    },
    {
      type: "paragraph",
      content: `This course covers ${topic} from fundamentals to advanced concepts. You'll gain hands-on experience and build real-world projects.`,
    },
    {
      type: "heading",
      content: "Course Objectives",
      level: "h2",
    },
    {
      type: "list",
      items: [
        `Understand core concepts of ${topic}`,
        "Master essential tools and technologies",
        "Build practical projects",
        "Prepare for professional development",
      ],
    },
    {
      type: "heading",
      content: "Prerequisites",
      level: "h2",
    },
    {
      type: "paragraph",
      content: "Basic understanding of programming concepts is recommended. We'll guide you through everything step by step.",
    },
    {
      type: "heading",
      content: "What You'll Build",
      level: "h2",
    },
    {
      type: "paragraph",
      content: "By the end of this course, you'll have created several projects that demonstrate your understanding of the concepts.",
    },
  ];
}

/**
 * Generate general content
 */
function generateGeneralContent(topic: string): ContentBlock[] {
  return [
    {
      type: "heading",
      content: `Introduction to ${topic}`,
      level: "h1",
    },
    {
      type: "paragraph",
      content: `Welcome to ${topic}! This course is designed to help you learn and master the essential concepts.`,
    },
    {
      type: "heading",
      content: "What You'll Learn",
      level: "h2",
    },
    {
      type: "list",
      items: [
        `Fundamentals of ${topic}`,
        "Practical applications",
        "Best practices",
        "Real-world examples",
      ],
    },
    {
      type: "heading",
      content: "Getting Started",
      level: "h2",
    },
    {
      type: "paragraph",
      content: "Let's begin our learning journey together. Follow along with the lessons and practice regularly to get the most out of this course.",
    },
  ];
}

/**
 * Format content for display based on category
 */
export function formatContentForDisplay(
  content: CourseContent,
  options?: {
    showMetadata?: boolean;
    includeCategoryStyling?: boolean;
  }
): ContentBlock[] {
  let formattedContent = [...content.content];

  // Add category-specific formatting
  if (options?.includeCategoryStyling) {
    const categoryStyle = contentTemplates[content.category];
    
    // Add category badge or styling if needed
    if (categoryStyle.useEmojis && content.category === "kids") {
      // Kids content already has emojis
    }
  }

  return formattedContent;
}

/**
 * Validate content structure
 */
export function validateContent(content: CourseContent): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content.title || content.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!content.content || content.content.length === 0) {
    errors.push("Content blocks are required");
  }

  if (!content.category) {
    errors.push("Category is required");
  }

  // Validate content blocks
  content.content?.forEach((block, index) => {
    if (!block.type) {
      errors.push(`Content block ${index + 1}: Type is required`);
    }
    if (!block.content && !block.items) {
      errors.push(`Content block ${index + 1}: Content or items required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Merge multiple content sources
 */
export function mergeContent(
  baseContent: CourseContent,
  additionalContent: Partial<CourseContent>
): CourseContent {
  return {
    ...baseContent,
    ...additionalContent,
    content: [
      ...baseContent.content,
      ...(additionalContent.content || []),
    ],
    metadata: {
      ...baseContent.metadata,
      ...additionalContent.metadata,
    },
  };
}

