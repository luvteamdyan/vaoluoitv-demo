'use client';

interface SkeletonNewsCardProps {
  variant?: 'default' | 'large' | 'small';
}

export default function SkeletonNewsCard({ variant = 'default' }: SkeletonNewsCardProps) {
  const baseClasses = "rounded-xl overflow-hidden animate-pulse";

  switch (variant) {
    case 'large':
      return (
        <div className={`${baseClasses} bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-[560px] flex flex-col`}>
          <div className="relative h-80 sm:h-88 md:h-80 lg:h-88 bg-gray-700 rounded-lg flex-shrink-0"></div>
          <div className="pt-4 flex-1 flex flex-col justify-between min-h-0">
            <div className="flex-1 flex flex-col">
              <div className="h-6 bg-gray-700 rounded mb-3 w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
            <div className="mt-4 flex items-center justify-between flex-shrink-0">
              <div className="h-4 bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      );

    case 'small':
      return (
        <div className={`${baseClasses} bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-[400px] flex flex-col`}>
          <div className="relative h-40 sm:h-44 md:h-40 bg-gray-700 rounded-lg flex-shrink-0"></div>
          <div className="pt-4 flex-1 flex flex-col justify-between min-h-0">
            <div className="flex-1 flex flex-col">
              <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded mb-2 w-full"></div>
              <div className="h-3 bg-gray-700 rounded w-5/6"></div>
            </div>
            <div className="mt-2 flex items-center justify-between flex-shrink-0">
              <div className="h-3 bg-gray-700 rounded w-20"></div>
              <div className="h-3 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className={`${baseClasses} bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-[220px] flex gap-4 items-center`}>
          <div className="relative w-36 md:w-44 lg:w-48 h-32 sm:h-36 md:h-32 lg:h-36 flex-shrink-0 rounded-lg bg-gray-700 min-w-36"></div>
          <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
            <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded mb-2 w-full"></div>
            <div className="h-3 bg-gray-700 rounded mb-2 w-5/6"></div>
            <div className="mt-3 flex items-center justify-between flex-shrink-0">
              <div className="h-3 bg-gray-700 rounded w-24"></div>
              <div className="h-3 bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      );
  }
}

