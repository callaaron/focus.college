import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function PageSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='bg-muted mb-2 h-7 w-40 rounded' />
          <div className='bg-muted h-4 w-72 rounded' />
        </div>
      </div>
      <div className='bg-muted mt-2 h-32 w-full rounded-lg' />
      <div className='bg-muted h-32 w-full rounded-lg' />
    </div>
  );
}

export default function PageContainer({
  children,
  isLoading = false,
  pageTitle,
  pageDescription,
  pageHeaderAction,
  className,
}: {
  children: ReactNode;
  isLoading?: boolean;
  pageTitle?: string;
  pageDescription?: string;
  pageHeaderAction?: ReactNode;
  className?: string;
}) {
  const hasHeader = pageTitle || pageHeaderAction;

  return (
    <div className={cn("space-y-5", className)}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {pageTitle && (
              <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
            )}
            {pageDescription && (
              <p className="text-sm text-muted-foreground mt-1">{pageDescription}</p>
            )}
          </div>
          {pageHeaderAction && <div className="shrink-0">{pageHeaderAction}</div>}
        </div>
      )}
      {isLoading ? <PageSkeleton /> : children}
    </div>
  );
}
