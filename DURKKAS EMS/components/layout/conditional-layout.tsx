"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
import { ChatWidget } from "@/components/chat/chat-widget";

// Lazy load Footer for faster initial load
const Footer = dynamic(
  () => import("@/components/layout/footer").then((mod) => ({ default: mod.Footer })),
  { 
    ssr: true,
    loading: () => <div className="h-32" />,
  }
);

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if current path is a student portal route
  const isStudentPortal = pathname?.includes("/dashboard/") && pathname?.includes("/student");
  
  return (
    <>
      {/* Hide TopBar, MobileTopBar, and Navbar for student portal */}
      {!isStudentPortal && (
        <>
          <TopBar />
          <MobileTopBar />
          <Navbar />
        </>
      )}
      
      {children}
      
      {/* Hide Footer and ChatWidget for student portal */}
      {!isStudentPortal && (
        <>
          <Footer />
          <ChatWidget />
        </>
      )}
    </>
  );
}

