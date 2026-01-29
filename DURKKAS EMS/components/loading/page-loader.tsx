"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { LOADING_CONFIG } from "@/lib/loading-config";

export function PageLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const { MAX_DURATION, PROGRESS_INTERVAL } = LOADING_CONFIG;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressValue = Math.min((elapsed / MAX_DURATION) * 100, 95);
      setProgress(progressValue);

      if (progressValue >= 95) {
        clearInterval(interval);
      }
    }, PROGRESS_INTERVAL);

    // Force complete at 2 seconds
    const timer = setTimeout(() => {
      setProgress(100);
    }, MAX_DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </motion.div>
        <div className="w-48 space-y-2">
          <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}

