'use client';

import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
  fallbackText?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError || !src) {
    return (
      <div className={`bg-[var(--muted)] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Camera className="w-6 h-6 text-gray-400" />
          {fallbackText && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{fallbackText}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
};

export default ImageWithFallback;
