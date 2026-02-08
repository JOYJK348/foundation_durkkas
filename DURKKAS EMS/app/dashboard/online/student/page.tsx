"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroCard } from "@/components/dashboard/hero-card";
import { ContinueCarousel } from "@/components/dashboard/continue-carousel";
import { LiveCard } from "@/components/dashboard/live-card";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { CourseListItem } from "@/components/dashboard/course-list-item";
import { AssignmentsCard } from "@/components/dashboard/assignments-card";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChatWidget } from "@/components/chat/chat-widget";

export default function OnlineStudentDashboard() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data
  const continueCourses = [
    {
      id: "1",
      title: "Web Development - Full Stack",
      module: "Module 3: React Fundamentals",
      progress: 68,
      cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
    },
    {
      id: "2",
      title: "Data Science Basics",
      module: "Module 2: Python for Data",
      progress: 45,
      cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    },
    {
      id: "3",
      title: "UI/UX Design",
      module: "Module 1: Design Principles",
      progress: 25,
      cover: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    },
  ];

  const myCourses = [
    {
      id: "1",
      title: "Web Development - Full Stack",
      progress: 68,
      nextLesson: "React Hooks - useState",
    },
    {
      id: "2",
      title: "Data Science Fundamentals",
      progress: 45,
      nextLesson: "Pandas Basics",
    },
    {
      id: "3",
      title: "Mobile App Development",
      progress: 30,
      nextLesson: "Flutter Introduction",
    },
  ];

  const assignments = [
    {
      id: "1",
      title: "React Component Assignment",
      dueDate: "Dec 22, 2024",
      status: "pending" as const,
    },
    {
      id: "2",
      title: "API Integration Project",
      dueDate: "Dec 25, 2024",
      status: "pending" as const,
    },
    {
      id: "3",
      title: "Database Design",
      dueDate: "Dec 18, 2024",
      status: "overdue" as const,
    },
  ];

  const upcomingLiveClass = new Date();
  upcomingLiveClass.setHours(14, 0, 0, 0); // 2 PM today

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Top Navbar */}
        <TopNavbar />

      {/* Main Content - Scrollable */}
      <div className="overflow-y-auto">
        {/* Hero Card */}
        <HeroCard
          courseTitle="Web Development - Full Stack"
          progressPercent={68}
          resumeRoute="/dashboard/online/student/courses?resume=true"
        />

        {/* Continue Learning Carousel */}
        <ContinueCarousel courses={continueCourses} />

        {/* Upcoming Live / Next Class */}
        <LiveCard
          isLive={false}
          startsAt={upcomingLiveClass}
          tutor="Dr. John Smith"
          onJoin={() => {
            // Handle join live class
            console.log("Joining live class");
          }}
        />

        {/* Quick Actions Grid */}
        <QuickActionsGrid />

        {/* My Courses */}
        <div className="mb-6 px-4 sm:px-6">
          <h3 className="text-lg font-semibold mb-4">My Courses</h3>
          <div className="space-y-3">
            {myCourses.map((course) => (
              <CourseListItem key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Assignments Shortlist */}
        <AssignmentsCard assignments={assignments} />
      </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </DashboardLayout>
  );
}
