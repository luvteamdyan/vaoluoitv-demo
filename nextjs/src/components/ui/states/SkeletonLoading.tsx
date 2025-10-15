import React from 'react';

interface SkeletonLoadingProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'shimmer';
  width?: string | number;
  height?: string | number;
}

export default function SkeletonLoading({
  className = '',
  variant = 'rectangular',
  animation = 'shimmer',
  width,
  height,
}: SkeletonLoadingProps) {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200';
  
  const variantClasses = {
    default: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    shimmer: 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]',
  };

  const style = {
    width: width || '100%',
    height: height || '100%',
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
}

// Specific skeleton components for common use cases
export function ImageSkeleton({ className = '', width, height }: { className?: string; width?: string | number; height?: string | number }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <SkeletonLoading
        variant="default"
        animation="shimmer"
        className="w-full h-full"
      />
      {/* Add some subtle inner elements to make it look more like an image */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-2 left-2 right-2 h-3 bg-gray-400/30 rounded animate-pulse" />
      <div className="absolute bottom-6 left-2 w-1/2 h-2 bg-gray-400/20 rounded animate-pulse" />
    </div>
  );
}

export function VideoSkeleton({ className = '', width, height }: { className?: string; width?: string | number; height?: string | number }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <SkeletonLoading
        variant="default"
        animation="shimmer"
        className="w-full h-full"
      />
      {/* Add play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1" />
        </div>
      </div>
      {/* Add progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-400/30">
        <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
      </div>
    </div>
  );
}

export function BannerSkeleton({ className = '', width, height }: { className?: string; width?: string | number; height?: string | number }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <SkeletonLoading
        variant="default"
        animation="shimmer"
        className="w-full h-full"
      />
      {/* Add gradient overlay to simulate banner content */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      <div className="absolute top-4 left-4 right-4 h-2 bg-white/20 rounded animate-pulse" />
      <div className="absolute top-8 left-4 w-3/4 h-1.5 bg-white/15 rounded animate-pulse" />
      <div className="absolute bottom-4 right-4 w-16 h-6 bg-white/25 rounded animate-pulse" />
    </div>
  );
}

export function ChatSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex space-x-3">
          <SkeletonLoading variant="circular" width={32} height={32} className="flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLoading width={Math.random() * 200 + 100} height={16} className="rounded" />
            <SkeletonLoading width={Math.random() * 150 + 50} height={14} className="rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Add custom shimmer animation to global CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
  document.head.appendChild(style);
}
