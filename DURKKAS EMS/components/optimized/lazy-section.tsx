"use client";

import { lazy, Suspense, ReactNode } from "react";
import { Skeleton } from "@/components/loading/skeleton";

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazySection({ children, fallback }: LazySectionProps) {
  return (
    <Suspense fallback={fallback || <Skeleton className="h-64 w-full" />}>
      {children}
    </Suspense>
  );
}

