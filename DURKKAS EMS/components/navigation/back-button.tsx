"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
  icon?: "chevron" | "arrow";
}

export function BackButton({
  href,
  label = "Back",
  variant = "ghost",
  size = "default",
  className,
  showIcon = true,
  icon = "chevron",
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine default back path based on current route
  const getDefaultBackPath = () => {
    if (href) return href;

    // Online portal
    if (pathname?.includes("/dashboard/online/")) {
      if (pathname?.includes("/student")) {
        return "/dashboard/online/student";
      } else if (pathname?.includes("/tutor")) {
        return "/dashboard/online/tutor";
      } else if (pathname?.includes("/admin")) {
        return "/dashboard/online/admin";
      }
    }

    // Offline portal
    if (pathname?.includes("/dashboard/offline/")) {
      if (pathname?.includes("/student")) {
        return "/dashboard/offline/student";
      } else if (pathname?.includes("/tutor")) {
        return "/dashboard/offline/tutor";
      } else if (pathname?.includes("/admin")) {
        return "/dashboard/offline/admin";
      }
    }

    // Workshop portal
    if (pathname?.includes("/dashboard/workshop/")) {
      if (pathname?.includes("/student")) {
        return "/dashboard/workshop/student";
      } else if (pathname?.includes("/tutor")) {
        return "/dashboard/workshop/tutor";
      } else if (pathname?.includes("/admin")) {
        return "/dashboard/workshop/admin";
      }
    }

    // Default fallback
    return "/";
  };

  const handleBack = () => {
    const backPath = getDefaultBackPath();
    router.push(backPath);
  };

  const IconComponent = icon === "arrow" ? ArrowLeft : ChevronLeft;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant={variant}
        size={size}
        onClick={handleBack}
        className={cn(
          "flex items-center gap-2 transition-all hover:gap-3",
          className
        )}
      >
        {showIcon && <IconComponent className="h-4 w-4" />}
        <span>{label}</span>
      </Button>
    </motion.div>
  );
}

