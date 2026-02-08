"use client";

import { motion } from "framer-motion";

interface SectionDividerProps {
  variant?: "wave" | "curve" | "zigzag";
  className?: string;
}

export function SectionDivider({ variant = "wave", className = "" }: SectionDividerProps) {
  if (variant === "wave") {
    return (
      <div className={`relative w-full h-16 overflow-hidden ${className}`}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <motion.path
            d="M0,60 Q300,0 600,60 T1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
            className="text-background"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          />
        </svg>
      </div>
    );
  }

  if (variant === "curve") {
    return (
      <div className={`relative w-full h-20 overflow-hidden ${className}`}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <motion.path
            d="M0,120 Q600,0 1200,120 L1200,120 L0,120 Z"
            fill="currentColor"
            className="text-background"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          />
        </svg>
      </div>
    );
  }

  return null;
}

