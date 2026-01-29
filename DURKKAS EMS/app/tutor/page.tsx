"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  BarChart3,
  FileText,
  DollarSign,
  Upload,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";
import Link from "next/link";
import { images } from "@/lib/images";
import { BackgroundPattern } from "@/components/decorative/background-pattern";
import { FloatingShapes } from "@/components/decorative/floating-shapes";
import { SectionDivider } from "@/components/decorative/section-divider";

const features = [
  {
    icon: BookOpen,
    title: "Create and Manage Courses",
    description: "Build comprehensive courses with multimedia content, assignments, and assessments.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Host Workshops",
    description: "Conduct live and recorded workshops with interactive sessions and Q&A.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Access Student Analytics",
    description: "Track student progress, engagement, and performance with detailed analytics.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FileText,
    title: "Share Assignments",
    description: "Create, distribute, and grade assignments seamlessly within the platform.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: DollarSign,
    title: "Earn Through Your Courses",
    description: "Monetize your expertise and earn revenue from your course enrollments.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Upload,
    title: "Upload & Manage Materials",
    description: "Easily upload videos, documents, and resources with organized content management.",
    color: "from-indigo-500 to-purple-500",
  },
];

export default function TutorPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={images.tutorsSection}
            alt="Tutors"
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
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-6"
            >
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm inline-block">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              Why Tutors Love Durkkas EMS
            </h1>
            <p className="text-lg text-white/90 mb-8 drop-shadow-md">
              Join thousands of educators who are transforming learning experiences and building their teaching careers with our comprehensive platform.
            </p>
            <Link href="/login" prefetch={true}>
              <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-xl">
                Become a Tutor – Register Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <SectionDivider variant="wave" />

      {/* Features Grid - Enhanced */}
      <section className="py-20 relative overflow-hidden">
        <BackgroundPattern variant="grid" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you create, teach, and grow
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-primary/20">
                  <CardHeader>
                    <motion.div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="curve" />

      {/* Future Features - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-secondary/50 to-background relative overflow-hidden">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4"
            >
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Coming Soon</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Tutor SaaS Platform</h2>
            <div className="bg-card rounded-lg p-8 shadow-2xl border-2 border-primary/10">
              <h3 className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Independent Earning Platform
              </h3>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                An independent earning tool that will allow tutors to create their own branded learning platforms, manage students independently, and scale their teaching business.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Custom Branding", "Independent Platform", "Advanced Analytics", "Payment Integration"].map((item, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full text-sm font-medium border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={images.learning}
            alt="Teaching"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
        </div>
        <BackgroundPattern variant="dots" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-sm font-medium text-primary">Join Our Community</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Teaching?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Join our community of expert tutors and start making an impact today. Transform lives through education.
            </p>
            <Link href="/login" prefetch={true}>
              <Button size="lg" className="group shadow-xl">
                Register as Tutor
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
