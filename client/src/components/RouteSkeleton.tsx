/**
 * Ultra-lightweight skeleton for route transitions
 * Minimal DOM for instant rendering during lazy loading
 */
export function RouteSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {/* Animated spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <p className="text-sm text-muted-foreground animate-pulse">加载中...</p>
      </div>
    </div>
  );
}

export default RouteSkeleton;
