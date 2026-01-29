"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy load motion components only after page load
export function useLazyMotion() {
  const [motionLoaded, setMotionLoaded] = useState(false);

  useEffect(() => {
    // Load motion after initial render
    const timer = setTimeout(() => {
      setMotionLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return motionLoaded;
}

// Lazy motion div wrapper - dynamically import framer-motion
export const LazyMotion = dynamic(
  () =>
    import("framer-motion").then((mod) => {
      // Create a wrapper component that uses motion.div
      const MotionWrapper: React.FC<{ children?: React.ReactNode; [key: string]: any }> = (props) => {
        const MotionDiv = mod.motion.div;
        return <MotionDiv {...props} />;
      };
      MotionWrapper.displayName = "LazyMotion";
      return MotionWrapper;
    }),
  { ssr: false }
);

