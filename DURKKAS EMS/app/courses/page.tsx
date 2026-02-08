"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Lock, Clock, MapPin, BookOpen, CheckCircle2, ArrowRight, Star, TrendingUp, Filter } from "lucide-react";
import Link from "next/link";
import { images } from "@/lib/images";
import { BackgroundPattern } from "@/components/decorative/background-pattern";
import { FloatingShapes } from "@/components/decorative/floating-shapes";

const categories = [
  "All",
  "AI & Robotics",
  "Digital Skills",
  "Languages",
  "Kids",
  "Career Courses",
];

const courses = [
  {
    id: 1,
    title: "Introduction to AI & Machine Learning",
    category: "AI & Robotics",
    duration: "30 hrs",
    mode: "Online",
    description: "Learn the fundamentals of artificial intelligence and machine learning with hands-on projects.",
    locked: false,
    image: images.courses.ai,
    rating: 4.8,
    students: 1250,
  },
  {
    id: 2,
    title: "Python Programming Masterclass",
    category: "Digital Skills",
    duration: "3 months",
    mode: "Hybrid",
    description: "Master Python programming from basics to advanced concepts with real-world projects.",
    locked: false,
    image: images.courses.python,
    rating: 4.9,
    students: 2100,
  },
  {
    id: 3,
    title: "Spanish Language Course",
    category: "Languages",
    duration: "10 days",
    mode: "Offline",
    description: "Learn Spanish from scratch with interactive sessions and cultural immersion.",
    locked: true,
    image: images.courses.spanish,
    rating: 4.7,
    students: 890,
  },
  {
    id: 4,
    title: "Robotics for Kids",
    category: "Kids",
    duration: "20 hrs",
    mode: "Offline",
    description: "Fun and engaging robotics course designed specifically for young learners.",
    locked: false,
    image: images.courses.robotics,
    rating: 4.9,
    students: 560,
  },
  {
    id: 5,
    title: "Data Science Bootcamp",
    category: "Career Courses",
    duration: "3 months",
    mode: "Online",
    description: "Comprehensive data science course with industry projects and certification.",
    locked: true,
    image: images.courses.dataScience,
    rating: 4.8,
    students: 1800,
  },
  {
    id: 6,
    title: "Web Development Full Stack",
    category: "Digital Skills",
    duration: "3 months",
    mode: "Hybrid",
    description: "Build modern web applications using the latest technologies and frameworks.",
    locked: false,
    image: images.courses.webDev,
    rating: 4.9,
    students: 2400,
  },
];

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((course) => course.category === selectedCategory);

  const handleCourseClick = (course: typeof courses[0]) => {
    setSelectedCourse(course);
    setIsSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Background */}
      <section className="relative py-20 overflow-hidden mt-0">
        <div className="absolute inset-0">
          <Image
            src={images.learning}
            alt="Courses"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/60" />
        </div>
        <FloatingShapes />
        <BackgroundPattern variant="dots" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-4"
            >
              <BookOpen className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Explore Our Catalog</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Our Courses
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Explore our comprehensive catalog of courses designed for students, professionals, and institutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters - Sticky Filter Bar */}
      <div className="sticky top-[100px] md:top-[104px] z-30 bg-background/95 backdrop-blur border-b shadow-sm">
        <section className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-muted-foreground shrink-0">Filter by Category:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                layout
              >
                {category}
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      {/* Course Grid - Enhanced */}
      <section className="py-12 relative overflow-hidden">
        <BackgroundPattern variant="grid" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/20">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        {course.locked && (
                          <motion.div
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-lg"
                          >
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        )}
                        <span className="text-xs font-semibold px-2 py-1 bg-primary/90 backdrop-blur-sm text-primary-foreground rounded-full shadow-lg">
                          {course.category}
                        </span>
                      </div>
                      {!course.locked && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-full">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold">{course.rating}</span>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-base">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{course.mode}</span>
                        </div>
                      </div>
                      {!course.locked && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-xs text-muted-foreground">
                            {course.students.toLocaleString()} students enrolled
                          </div>
                        </div>
                      )}
                      <Button
                        className="w-full group"
                        variant={course.locked ? "outline" : "default"}
                        onClick={() => handleCourseClick(course)}
                      >
                        {course.locked ? "Login to Enroll" : "Preview"}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom Sheet */}
      <BottomSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={selectedCourse?.title}
      >
        {selectedCourse && (
          <div className="space-y-6">
            <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
              <Image
                src={selectedCourse.image}
                alt={selectedCourse.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-muted-foreground mb-4 text-base leading-relaxed">{selectedCourse.description}</p>
              <div className="flex items-center gap-4 text-sm mb-4 p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{selectedCourse.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{selectedCourse.mode}</span>
                </div>
                {!selectedCourse.locked && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{selectedCourse.rating}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                What You'll Learn
              </h3>
              <ul className="space-y-3">
                {[
                  "Comprehensive understanding of core concepts",
                  "Hands-on projects and assignments",
                  "Industry best practices",
                  "Certificate upon completion",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <Link href="/login" className="block" prefetch={true}>
              <Button className="w-full" size="lg" variant={selectedCourse.locked ? "outline" : "default"}>
                {selectedCourse.locked ? "Login to Access Full Content" : "Enroll Now"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
