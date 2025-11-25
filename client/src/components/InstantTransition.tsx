import { useEffect, useState } from 'react';

/**
 * Instant page transition with no skeleton
 * Shows cached content immediately, updates when new data arrives
 */
export function InstantTransition({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use RAF for 60fps animation
    const raf = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 100ms ease-out, transform 100ms ease-out',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
