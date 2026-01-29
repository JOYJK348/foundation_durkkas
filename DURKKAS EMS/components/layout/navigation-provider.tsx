"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { NavigationLoader } from "@/components/loading/navigation-loader";

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Scroll to top on route change - instant (no animation delay)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" }); // Instant scroll
  }, [pathname]);

  return (
    <>
      <NavigationLoader />
      {children}
    </>
  );
}

