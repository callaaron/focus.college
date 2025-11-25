import { useEffect, useRef } from "react";

/**
 * Performance monitoring hook
 * Measures component render time and logs performance metrics
 */
export function usePerformance(componentName: string, enabled = false) {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const now = Date.now();
    const timeSinceMount = now - mountTime.current;
    const timeSinceLastRender = now - lastRenderTime.current;

    // Log performance metrics
    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        timeSinceMount: `${timeSinceMount}ms`,
        timeSinceLastRender: `${timeSinceLastRender}ms`,
      });
    }

    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    timeSinceMount: Date.now() - mountTime.current,
  };
}

/**
 * Hook to measure async operation performance
 */
export function useAsyncPerformance() {
  const measure = async <T,>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      if (process.env.NODE_ENV === "development") {
        console.log(`[AsyncPerf] ${operationName}: ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[AsyncPerf] ${operationName} failed after ${duration.toFixed(2)}ms:`,
          error
        );
      }
      throw error;
    }
  };

  return { measure };
}

/**
 * Hook to track Core Web Vitals
 */
export function useCoreWebVitals() {
  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      console.log("[WebVitals] LCP:", lastEntry.renderTime || lastEntry.loadTime);
    });

    try {
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log("[WebVitals] FID:", entry.processingStart - entry.startTime);
      });
    });

    try {
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // FID not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log("[WebVitals] CLS:", clsValue);
        }
      }
    });

    try {
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // CLS not supported
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);
}
