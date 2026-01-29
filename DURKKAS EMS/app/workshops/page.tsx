"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Clock, MapPin, Users, CheckCircle2, Video, BookOpen, Award, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { images } from "@/lib/images";
import { BackgroundPattern } from "@/components/decorative/background-pattern";
import { FloatingShapes } from "@/components/decorative/floating-shapes";

const workshops = [
  {
    id: 1,
    title: "Introduction to AI & Machine Learning",
    tutor: "Dr. John Smith",
    tutorImage: images.tutors.tutor1,
    date: "2024-02-15",
    time: "2:00 PM - 4:00 PM",
    mode: "Online",
    seats: 15,
    totalSeats: 30,
    isLive: true,
    image: images.workshops.aiWorkshop,
    description: "A comprehensive workshop covering the fundamentals of AI and ML with hands-on projects.",
    learnings: [
      "Understanding AI and ML concepts",
      "Building your first ML model",
      "Best practices in AI development",
      "Real-world applications",
    ],
    schedule: [
      { day: "Day 1", topic: "Introduction to AI & ML Basics" },
      { day: "Day 2", topic: "Hands-on Project Development" },
      { day: "Day 3", topic: "Advanced Concepts & Q&A" },
    ],
    attendees: "Students, professionals, and anyone interested in AI",
    requirements: "Basic programming knowledge recommended",
    fee: "₹2,999",
  },
  {
    id: 2,
    title: "Digital Marketing Masterclass",
    tutor: "Sarah Johnson",
    tutorImage: images.tutors.tutor2,
    date: "2024-02-20",
    time: "10:00 AM - 1:00 PM",
    mode: "Offline",
    seats: 8,
    totalSeats: 25,
    isLive: false,
    image: images.workshops.digitalMarketing,
    description: "Learn digital marketing strategies that drive results in today's competitive market.",
    learnings: [
      "SEO and SEM fundamentals",
      "Social media marketing",
      "Content marketing strategies",
      "Analytics and measurement",
    ],
    schedule: [
      { day: "Day 1", topic: "Digital Marketing Landscape" },
      { day: "Day 2", topic: "Strategy Development" },
    ],
    attendees: "Marketing professionals and business owners",
    requirements: "No prior experience needed",
    fee: "₹3,499",
  },
  {
    id: 3,
    title: "Robotics Workshop for Beginners",
    tutor: "Prof. Michael Chen",
    tutorImage: images.tutors.tutor3,
    date: "2024-02-25",
    time: "3:00 PM - 6:00 PM",
    mode: "Hybrid",
    seats: 12,
    totalSeats: 20,
    isLive: false,
    image: images.workshops.roboticsWorkshop,
    description: "Hands-on robotics workshop perfect for beginners and enthusiasts.",
    learnings: [
      "Robotics fundamentals",
      "Building your first robot",
      "Programming and control",
      "Troubleshooting and optimization",
    ],
    schedule: [
      { day: "Day 1", topic: "Introduction to Robotics" },
      { day: "Day 2", topic: "Building & Programming" },
    ],
    attendees: "Students aged 12+ and beginners",
    requirements: "Basic electronics knowledge helpful",
    fee: "₹4,999",
  },
];

export default function WorkshopsPage() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<typeof workshops[0] | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Background */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={images.learning}
            alt="Workshops"
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
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Live Sessions</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Upcoming Workshops
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Join our expert-led workshops and gain hands-on experience in cutting-edge technologies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Active Workshops */}
      <section className="py-12 relative overflow-hidden">
        <BackgroundPattern variant="grid" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Active Workshops</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop, index) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary/20">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={workshop.image}
                      alt={workshop.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                    <div className="absolute top-2 left-2 flex items-center gap-2">
                      {workshop.isLive && (
                        <motion.span
                          className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full backdrop-blur-sm shadow-lg"
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          LIVE
                        </motion.span>
                      )}
                      <span className="text-xs font-semibold px-2 py-1 bg-primary/90 backdrop-blur-sm text-primary-foreground rounded-full shadow-lg">
                        {workshop.mode}
                      </span>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {workshop.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden">
                        <Image
                          src={workshop.tutorImage}
                          alt={workshop.tutor}
                          fill
                          sizes="(max-width: 768px) 24px, 32px"
                          className="object-cover"
                        />
                      </div>
                      {workshop.tutor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{workshop.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{workshop.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{workshop.mode}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4" />
                        <motion.span
                          key={workshop.seats}
                          initial={{ scale: 1.2, color: "#ef4444" }}
                          animate={{ scale: 1, color: "inherit" }}
                          className="font-semibold"
                        >
                          {workshop.seats} seats left
                        </motion.span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-2"
                      onClick={() => setSelectedWorkshop(workshop)}
                    >
                      Join Workshop
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Details Modal */}
      <AnimatePresence>
        {selectedWorkshop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedWorkshop(null)}
          >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
                <Image
                  src={selectedWorkshop.image}
                  alt={selectedWorkshop.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedWorkshop.title}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={selectedWorkshop.tutorImage}
                        alt={selectedWorkshop.tutor}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    {selectedWorkshop.tutor}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedWorkshop(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    What You'll Learn
                  </h3>
                  <ul className="space-y-2">
                    {selectedWorkshop.learnings.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="schedule">
                    <AccordionTrigger>Schedule</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {selectedWorkshop.schedule.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded bg-secondary/50">
                            <Calendar className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium">{item.day}</p>
                              <p className="text-sm text-muted-foreground">{item.topic}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="attendees">
                    <AccordionTrigger>Who Can Attend</AccordionTrigger>
                    <AccordionContent>
                      <p>{selectedWorkshop.attendees}</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="requirements">
                    <AccordionTrigger>Requirements</AccordionTrigger>
                    <AccordionContent>
                      <p>{selectedWorkshop.requirements}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                  <div>
                    <p className="text-sm text-muted-foreground">Workshop Fee</p>
                    <p className="text-2xl font-bold text-primary">{selectedWorkshop.fee}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mode</p>
                    <p className="font-semibold">{selectedWorkshop.mode}</p>
                  </div>
                </div>

                <Link href="/login" className="block" prefetch={true}>
                  <Button className="w-full" size="lg">
                    Register Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Workshop Access Rules */}
      <section className="py-12 bg-gradient-to-br from-secondary/50 to-background relative overflow-hidden">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <Award className="h-8 w-8 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold">Workshop Access Rules</h2>
            </div>
            <div className="space-y-4">
              {[
                "Only assigned students get full access to workshop materials",
                "Others see only preview content",
                "Materials unlock after enrollment confirmation",
                "Recordings valid within workshop duration",
                "Certificates issued upon completion",
              ].map((rule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-card hover:shadow-md transition-all"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="p-2 rounded-full bg-primary/10 text-primary shrink-0"
                  >
                    <Award className="h-5 w-5" />
                  </motion.div>
                  <p className="text-sm font-medium">{rule}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

