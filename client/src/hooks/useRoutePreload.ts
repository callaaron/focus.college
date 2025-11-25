import { useEffect } from 'react';

// 路由到组件的映射
const routeComponentMap = {
  '/dashboard': () => import('../pages/Dashboard'),
  '/profile': () => import('../pages/Profile'),
  '/competencies': () => import('../pages/Competencies'),
  '/assessment': () => import('../pages/Assessment'),
  '/challenge': () => import('../pages/Challenge'),
  '/analysis': () => import('../pages/Analysis'),
  '/growth': () => import('../pages/Growth'),
  '/company': () => import('../pages/CompanyDashboard'),
  '/learning-path': () => import('../pages/LearningPath'),
  '/admin': () => import('../pages/admin/AdminDashboard'),
};

// 已预加载的路由
const preloadedRoutes = new Set<string>();

/**
 * 预加载指定路由的组件
 */
export function preloadRoute(path: string) {
  const loader = routeComponentMap[path as keyof typeof routeComponentMap];
  
  if (!loader || preloadedRoutes.has(path)) {
    return;
  }
  
  // 标记为已预加载
  preloadedRoutes.add(path);
  
  // 使用 requestIdleCallback 在空闲时预加载
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loader().catch(err => {
        console.warn(`Failed to preload route ${path}:`, err);
        // 移除标记，允许重试
        preloadedRoutes.delete(path);
      });
    });
  } else {
    // 降级方案：延迟100ms
    setTimeout(() => {
      loader().catch(err => {
        console.warn(`Failed to preload route ${path}:`, err);
        preloadedRoutes.delete(path);
      });
    }, 100);
  }
}

/**
 * 预加载多个路由
 */
export function preloadRoutes(paths: string[]) {
  paths.forEach(path => preloadRoute(path));
}

/**
 * Hook: 在组件挂载时预加载关键路由
 */
export function usePreloadCriticalRoutes() {
  useEffect(() => {
    // 预加载最常访问的路由
    const criticalRoutes = [
      '/dashboard',
      '/profile',
      '/assessment',
      '/competencies',
    ];
    
    // 延迟2秒后开始预加载，避免影响首次渲染
    const timer = setTimeout(() => {
      preloadRoutes(criticalRoutes);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
}

/**
 * Hook: 鼠标悬停时预加载链接目标
 */
export function useHoverPreload(path: string | undefined) {
  const handleMouseEnter = () => {
    if (path) {
      preloadRoute(path);
    }
  };
  
  return { onMouseEnter: handleMouseEnter };
}
