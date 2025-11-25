import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionFastProps {
  children: ReactNode;
}

/**
 * 快速页面过渡效果
 * 使用 CSS transform 而非 opacity 以获得更好的性能
 */
export function PageTransitionFast({ children }: PageTransitionFastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 使用 requestAnimationFrame 确保动画在下一帧开始
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className="transition-all duration-200 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      {children}
    </div>
  );
}
