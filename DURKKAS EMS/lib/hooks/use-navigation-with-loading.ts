"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Custom hook that wraps Next.js router with loading screen support
 * Use this instead of useRouter() to automatically trigger loading screen
 */
export function useNavigationWithLoading() {
  const router = useNextRouter();

  const push = useCallback((href: string) => {
    // Trigger loading by dispatching a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigation-start', { 
        detail: { path: href } 
      }));
    }
    router.push(href);
  }, [router]);

  const replace = useCallback((href: string) => {
    // Trigger loading by dispatching a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigation-start', { 
        detail: { path: href } 
      }));
    }
    router.replace(href);
  }, [router]);

  return {
    ...router,
    push,
    replace,
  };
}

