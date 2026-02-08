"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Award, 
  Brain, 
  Rocket,
  Sparkles,
  Zap
} from "lucide-react";
import { LOADING_CONFIG } from "@/lib/loading-config";

export function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [isPageReady, setIsPageReady] = useState(false);
  const [centerIconIndex, setCenterIconIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only runs on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track previous pathname to detect navigation
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  // Helper function to start loading - memoized with useCallback
  const startLoading = useCallback((targetPath: string) => {
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname;
    if (targetPath !== currentPath && !isLoading) {
      setNextPath(targetPath);
      setIsLoading(true);
      setLoadingProgress(0);
      setIsPageReady(false);
    }
  }, [isLoading]);

  // Detect navigation start from Link clicks, router.push(), and pathname changes
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined' || typeof document === 'undefined') return;

    // Handle Link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href) {
        try {
          const url = new URL(link.href);
          const currentUrl = new URL(window.location.href);
          
          // Only show loader for internal navigation
          if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
            startLoading(url.pathname);
          }
        } catch (err) {
          // Invalid URL, ignore
        }
      }
    };

    // Handle custom navigation events (from router.push() wrapper)
    const handleNavigationStart = (e: CustomEvent) => {
      if (e.detail?.path) {
        startLoading(e.detail.path);
      }
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('navigation-start', handleNavigationStart as EventListener);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('navigation-start', handleNavigationStart as EventListener);
    };
  }, [isMounted, startLoading]);

  // Detect pathname changes (catches router.push() and other navigation)
  // This is a fallback for cases where click events don't fire
  useEffect(() => {
    if (!isMounted) return;
    
    // If pathname changed and we're not already loading, start loading
    // Only trigger if we haven't already started loading from click/event
    if (prevPathname && pathname && prevPathname !== pathname && !isLoading && !nextPath) {
      startLoading(pathname);
    }
    
    // Update previous pathname
    if (pathname) {
      setPrevPathname(pathname);
    }
  }, [pathname, isMounted, prevPathname, isLoading, nextPath, startLoading]);

  // Detect when route changes and wait for page to be fully ready
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined' || typeof document === 'undefined') return;
    if (pathname && isLoading) {
      // Pathname changed, wait for page to actually render and be interactive
      let retryCount = 0;
      const maxRetries = 40; // Max 2 seconds of checking (40 * 50ms)

      const checkPageReady = () => {
        // Check if DOM is ready
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          // Check if main content exists and has children (page content loaded)
          const mainContent = document.querySelector('main');
          const hasContent = mainContent && (
            mainContent.children.length > 0 || 
            mainContent.innerHTML.trim().length > 0
          );

          // Also check if page transition animations might be running
          const allElementsRendered = document.body.scrollHeight > 100;

          if (hasContent && allElementsRendered && retryCount > 2) {
            // Page seems ready, wait a bit more for animations/transitions
            setTimeout(() => {
              setIsPageReady(true);
            }, 150); // Small delay to ensure smooth transition
          } else if (retryCount < maxRetries) {
            // Retry after a short delay
            retryCount++;
            setTimeout(checkPageReady, 50);
          } else {
            // Max retries reached, force ready (safety fallback)
            setIsPageReady(true);
          }
        } else {
          // Wait for page to load
          if (retryCount < maxRetries) {
            retryCount++;
            window.addEventListener('load', () => {
              setTimeout(checkPageReady, 100);
            }, { once: true });
          } else {
            setIsPageReady(true);
          }
        }
      };

      // Start checking after a small delay to allow route change
      setTimeout(checkPageReady, 100);
    }
  }, [pathname, isLoading, isMounted]);

  // Handle page ready - complete loading only when page is actually ready
  useEffect(() => {
    if (isPageReady && isLoading && (pathname === nextPath || !nextPath)) {
      // Page is ready, complete the loading
      setLoadingProgress(100);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        setNextPath(null);
        setIsPageReady(false);
      }, LOADING_CONFIG.ANIMATIONS.FADE_OUT);
      return () => clearTimeout(timer);
    }
  }, [isPageReady, isLoading, pathname, nextPath]);

  // Center icon rotation effect
  useEffect(() => {
    if (!isLoading) return;
    
    const iconInterval = setInterval(() => {
      setCenterIconIndex((prev) => (prev + 1) % 3);
    }, 800);

    return () => clearInterval(iconInterval);
  }, [isLoading]);

  // Progress animation - optimized for 2 seconds max
  useEffect(() => {
    if (!isLoading) return;

    setLoadingProgress(0);
    const startTime = Date.now();
    const { MAX_DURATION, PROGRESS_INTERVAL, ANIMATIONS } = LOADING_CONFIG;

    // Smooth progress animation - completes in 2 seconds
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / MAX_DURATION) * 100, 95);
      
      setLoadingProgress(progress);

      if (progress >= 95) {
        clearInterval(progressInterval);
      }
    }, PROGRESS_INTERVAL);

    // Force completion at 2 seconds max (fallback safety)
    const forceCompleteTimer = setTimeout(() => {
      if (isLoading && loadingProgress < 100) {
        // Force page ready if timeout reached (safety fallback)
        setIsPageReady(true);
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setLoadingProgress(0);
          setNextPath(null);
          setIsPageReady(false);
        }, ANIMATIONS.FADE_OUT);
      }
    }, MAX_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(forceCompleteTimer);
    };
  }, [isLoading, loadingProgress]);

  // Don't render on server
  if (!isMounted) return null;

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: LOADING_CONFIG.ANIMATIONS.FADE_IN / 1000 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-md"
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 100, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </div>

          {/* Creative Icon Loading Animation */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Icon Sequence Animation - Icons Load One by One */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
              {/* Background Circle */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Icons that load sequentially */}
              {[
                { Icon: BookOpen, delay: 0, color: "from-blue-500 to-cyan-500" },
                { Icon: GraduationCap, delay: 0.3, color: "from-purple-500 to-pink-500" },
                { Icon: Brain, delay: 0.6, color: "from-indigo-500 to-purple-500" },
                { Icon: Award, delay: 0.9, color: "from-yellow-500 to-orange-500" },
                { Icon: Rocket, delay: 1.2, color: "from-green-500 to-emerald-500" },
                { Icon: Sparkles, delay: 1.5, color: "from-pink-500 to-rose-500" },
              ].map((item, index) => {
                const totalIcons = 6;
                const angle = (index * 2 * Math.PI) / totalIcons;
                const radius = 50;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={index}
                    className="absolute"
                    initial={{ 
                      scale: 0, 
                      opacity: 0,
                      x: 0,
                      y: 0,
                      rotate: -180,
                    }}
                    animate={{
                      scale: [0, 1.2, 1],
                      opacity: [0, 1, 1, 0.7, 1],
                      x: [0, x * 1.2, x],
                      y: [0, y * 1.2, y],
                      rotate: [0, 360],
                    }}
                    transition={{
                      scale: {
                        duration: 0.5,
                        delay: item.delay,
                        ease: "easeOut",
                      },
                      opacity: {
                        duration: 0.6,
                        delay: item.delay,
                        times: [0, 0.3, 0.5, 0.8, 1],
                      },
                      x: {
                        duration: 0.8,
                        delay: item.delay,
                        ease: [0.25, 0.1, 0.25, 1],
                      },
                      y: {
                        duration: 0.8,
                        delay: item.delay,
                        ease: [0.25, 0.1, 0.25, 1],
                      },
                      rotate: {
                        duration: 2,
                        delay: item.delay,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                  >
                    <motion.div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                      animate={{
                        boxShadow: [
                          "0 0 10px rgba(59,130,246,0.4)",
                          "0 0 20px rgba(59,130,246,0.6)",
                          "0 0 10px rgba(59,130,246,0.4)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: item.delay,
                      }}
                    >
                      <item.Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2} />
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Center Icon - Rotates and Changes */}
              <motion.div
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center shadow-2xl z-10"
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <AnimatePresence mode="wait">
                  {[
                    { Icon: Zap, key: "zap" },
                    { Icon: Sparkles, key: "sparkles" },
                    { Icon: Rocket, key: "rocket" },
                  ].map((item, index) => {
                    if (index !== centerIconIndex) return null;
                    
                    return (
                      <motion.div
                        key={item.key}
                        initial={{ scale: 0, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <item.Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={2.5} />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="w-72 sm:w-80 space-y-3">
              <div className="h-2 bg-primary/10 rounded-full overflow-hidden shadow-inner border border-primary/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    boxShadow: "0 0 10px rgba(59,130,246,0.6)",
                  }}
                >
                  {/* Enhanced Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                    animate={{
                      x: ["-100%", "300%"],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  {/* Pulse Effect */}
                  <motion.div
                    className="absolute inset-0 bg-primary/50 rounded-full"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Enhanced Loading Text Animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-2"
            >
              <motion.h3
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0%", "200%"],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  backgroundPosition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              >
                Loading...
              </motion.h3>
              <motion.div className="flex items-center justify-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
              <motion.p
                className="text-sm text-muted-foreground font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Please wait while we prepare everything
              </motion.p>
            </motion.div>
          </div>

          {/* Enhanced Bottom Progress Indicator */}
          <motion.div
            className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-primary shadow-[0_-2px_10px_rgba(59,130,246,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Shimmer on bottom bar */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

