"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  Users, 
  Building2, 
  Brain, 
  Code, 
  Languages,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users as UsersIcon,
  PlayCircle,
  Award,
  BookOpen,
  Shield,
  BarChart3,
  Video,
  Star,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { images } from "@/lib/images";

// Lazy load decorative components for faster initial render
const BackgroundPattern = dynamic(
  () => import("@/components/decorative/background-pattern").then((mod) => ({ default: mod.BackgroundPattern })),
  { ssr: false }
);

const FloatingShapes = dynamic(
  () => import("@/components/decorative/floating-shapes").then((mod) => ({ default: mod.FloatingShapes })),
  { ssr: false }
);

const SectionDivider = dynamic(
  () => import("@/components/decorative/section-divider").then((mod) => ({ default: mod.SectionDivider })),
  { ssr: false }
);

// Optimized animation variants - faster for better performance
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Faster stagger
      delayChildren: 0.1,
    }
  }
};

function SectionWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src={images.hero}
            alt="Learning Platform"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/60" />
        </div>
        
        {/* Decorative Elements - Lazy loaded */}
        {mounted && (
          <>
            <FloatingShapes />
            <BackgroundPattern variant="dots" />
          </>
        )}
        
        {/* Animated Background Blobs - Only after mount */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
              animate={{
                x: [0, 60, 0],
                y: [0, 30, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              animate={{
                x: [0, -60, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="text-center space-y-6 max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-4"
            >
              <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
              <span className="text-sm font-medium text-white">ISO 9001:2015 Certified</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-balance text-white drop-shadow-lg"
            >
              Learn. Upgrade. Achieve — With Durkkas EMS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md"
            >
              A modern learning platform for students, tutors, and institutions.
              Conduct workshops, manage courses, and learn smarter — all in one place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Link href="/courses" prefetch={true}>
                <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-xl">
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/workshops" prefetch={true}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-xl">
                  Join Workshop
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="grid grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto"
            >
              {[
                { value: "10K+", label: "Students" },
                { value: "500+", label: "Courses" },
                { value: "200+", label: "Tutors" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {[GraduationCap, BookOpen, Award, Brain].map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{
                left: `${20 + index * 25}%`,
                top: `${30 + (index % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3 + index,
                repeat: Infinity,
                delay: index * 0.5,
              }}
            >
              <Icon className="h-8 w-8 text-white/30" />
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider variant="wave" />

      {/* Who Is This For - With Background Images */}
      <SectionWrapper className="py-20 relative overflow-hidden">
        <BackgroundPattern variant="grid" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Who Is This For?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed for everyone in the learning ecosystem
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Students / Learners",
                description: "Join courses & workshops, access assignments, earn certificates",
                icon: GraduationCap,
                color: "from-blue-500 to-cyan-500",
                image: images.students,
              },
              {
                title: "Tutors",
                description: "Create courses, manage students, run workshops",
                icon: Users,
                color: "from-purple-500 to-pink-500",
                image: images.tutorsSection,
              },
              {
                title: "Institutions",
                description: "Full role-based access, custom courses, reports & finance dashboard",
                icon: Building2,
                color: "from-orange-500 to-red-500",
                image: images.institutions,
              },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden relative">
                  <div className="absolute inset-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                    />
                  </div>
                  <CardHeader className="relative z-10">
                    <motion.div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <item.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionDivider variant="curve" />

      {/* Our Learning Areas - With Images */}
      <SectionWrapper className="py-20 bg-gradient-to-br from-secondary/50 to-background relative overflow-hidden">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Learning Areas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive learning programs across multiple domains
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "AI & Robotics",
                description: "Hands-on STEAM learning for K12 & professionals.",
                icon: Brain,
                color: "from-indigo-500 to-purple-500",
                image: images.aiRobotics,
              },
              {
                title: "Digital Skills",
                description: "Digital literacy & employability skills for the modern workforce.",
                icon: Code,
                color: "from-green-500 to-emerald-500",
                image: images.digitalSkills,
              },
              {
                title: "Languages",
                description: "Indian & foreign languages to build global communication skills.",
                icon: Languages,
                color: "from-rose-500 to-pink-500",
                image: images.languages,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                className="cursor-pointer"
              >
                <Card className="h-full group hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  </div>
                  <CardHeader className="relative">
                    <motion.div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <item.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeInUp} className="text-center mt-8">
            <Link href="/courses" prefetch={true}>
              <Button size="lg" variant="outline" className="group">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Upcoming Workshops - Enhanced */}
      <SectionWrapper className="py-20 relative overflow-hidden">
        <BackgroundPattern variant="dots" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trending Now</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Workshops</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join live sessions with expert instructors
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Introduction to AI & Machine Learning", tutor: "Dr. John Smith", image: images.workshops.aiWorkshop },
              { title: "Digital Marketing Masterclass", tutor: "Sarah Johnson", image: images.workshops.digitalMarketing },
              { title: "Robotics Workshop", tutor: "Prof. Michael Chen", image: images.workshops.roboticsWorkshop },
            ].map((workshop, item) => (
              <motion.div
                key={item}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={workshop.image}
                      alt={workshop.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <motion.span
                        className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full backdrop-blur-sm shadow-lg"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        LIVE
                      </motion.span>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{workshop.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      By {workshop.tutor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>2:00 PM - 4:00 PM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-sm">
                        <UsersIcon className="h-4 w-4" />
                        <span className="font-semibold">15 seats left</span>
                      </div>
                      <Button size="sm" className="group">
                        Know More
                        <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* How It Works - Enhanced */}
      <SectionWrapper className="py-20 bg-gradient-to-br from-primary/5 via-secondary/30 to-background relative overflow-hidden">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            How It Works
          </motion.h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-primary/30">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              {[
                { step: "1", title: "Choose a Course/Workshop", icon: BookOpen, description: "Browse our extensive catalog" },
                { step: "2", title: "Enroll & Start Learning", icon: PlayCircle, description: "Access materials instantly" },
                { step: "3", title: "Complete & Get Certified", icon: Award, description: "Earn verified certificates" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center relative"
                >
                  <motion.div
                    className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-white shadow-xl"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className="h-12 w-12" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Why Choose Us - Enhanced with Icons */}
      <SectionWrapper className="py-20 relative overflow-hidden">
        <BackgroundPattern variant="grid" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Why Choose Us
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Video, text: "Online + Offline + Workshop in one system", color: "from-blue-500 to-cyan-500" },
              { icon: Users, text: "Tutor-led structured learning", color: "from-purple-500 to-pink-500" },
              { icon: Shield, text: "QR-based certificate verification", color: "from-green-500 to-emerald-500" },
              { icon: Shield, text: "Secure content, no downloads", color: "from-orange-500 to-red-500" },
              { icon: BarChart3, text: "Student progress tracking", color: "from-indigo-500 to-purple-500" },
              { icon: PlayCircle, text: "Live class integration", color: "from-pink-500 to-rose-500" },
              { icon: Award, text: "ISO 9001:2015 certified", color: "from-yellow-500 to-orange-500" },
              { icon: CheckCircle2, text: "Premium learning experience", color: "from-teal-500 to-cyan-500" },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-card hover:shadow-xl transition-all border border-border/50"
              >
                <motion.div
                  className={`p-2 rounded-lg bg-gradient-to-br ${item.color} shrink-0`}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  <item.icon className="h-5 w-5 text-white" />
                </motion.div>
                <p className="text-sm font-medium leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Final CTA - Enhanced */}
      <SectionWrapper className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={images.learning}
            alt="Learning"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
        </div>
        <FloatingShapes />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg"
          >
            Start Your Learning Journey Today!
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md"
          >
            Join thousands of students, tutors, and institutions already learning with Durkkas EMS.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/courses" prefetch={true}>
              <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-xl">
                View Courses
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}
