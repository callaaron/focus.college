import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1"
  skeletonClassName?: string;
}

export function LazyImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  aspectRatio,
  className = "",
  skeletonClassName = "",
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const containerStyle = aspectRatio
    ? { aspectRatio, position: "relative" as const }
    : {};

  return (
    <div style={containerStyle} className="overflow-hidden">
      {isLoading && (
        <Skeleton 
          className={`absolute inset-0 ${skeletonClassName}`}
          style={aspectRatio ? { aspectRatio } : {}}
        />
      )}
      <img
        ref={imgRef}
        src={isInView ? (error ? fallbackSrc : src) : fallbackSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

export function LazyBackgroundImage({
  src,
  fallbackSrc = "/placeholder.svg",
  className = "",
  children,
}: {
  src: string;
  fallbackSrc?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px",
      }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isInView) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setIsLoaded(true); // Still set loaded to show fallback
    }
  }, [isInView, src]);

  return (
    <div
      ref={divRef}
      className={`${className} ${!isLoaded ? 'animate-pulse bg-muted' : ''} transition-all duration-300`}
      style={
        isLoaded && isInView
          ? { backgroundImage: `url(${src})` }
          : { backgroundImage: `url(${fallbackSrc})` }
      }
    >
      {children}
    </div>
  );
}
