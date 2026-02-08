"use client";

import { motion } from "framer-motion";

interface BackgroundPatternProps {
  variant?: "dots" | "grid" | "waves" | "gradient";
  className?: string;
}

export function BackgroundPattern({ variant = "dots", className = "" }: BackgroundPatternProps) {
  if (variant === "dots") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }} 
        />
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} 
        />
      </div>
    );
  }

  if (variant === "waves") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
          <motion.path
            d="M0,300 Q300,200 600,300 T1200,300 L1200,600 L0,600 Z"
            fill="url(#waveGradient)"
            initial={{ pathLength: 0, opacity: 0.3 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.1)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.05)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return null;
}

