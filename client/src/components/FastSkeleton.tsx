/**
 * Fast Skeleton Component
 * Lightweight skeleton loader for better perceived performance
 */

import { cn } from "@/lib/utils";

interface FastSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle";
}

export function FastSkeleton({ className, variant = "default" }: FastSkeletonProps) {
  const baseClasses = "animate-pulse bg-muted";
  
  const variantClasses = {
    default: "h-4 w-full rounded",
    card: "h-32 w-full rounded-lg",
    text: "h-4 w-3/4 rounded",
    circle: "h-12 w-12 rounded-full",
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-label="Loading..."
    />
  );
}

interface FastCardSkeletonProps {
  className?: string;
}

export function FastCardSkeleton({ className }: FastCardSkeletonProps) {
  return (
    <div className={cn("space-y-3 p-4 border rounded-lg", className)}>
      <FastSkeleton className="h-6 w-2/3" />
      <FastSkeleton className="h-4 w-full" />
      <FastSkeleton className="h-4 w-5/6" />
    </div>
  );
}

interface FastListSkeletonProps {
  count?: number;
  className?: string;
}

export function FastListSkeleton({ count = 3, className }: FastListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <FastCardSkeleton key={i} />
      ))}
    </div>
  );
}
