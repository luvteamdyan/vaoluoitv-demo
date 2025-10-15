'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface ImagePopupProps {
  isOpen: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImagePopup({ isOpen, src, alt, onClose }: ImagePopupProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Image container */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] w-auto h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className="object-contain rounded-lg max-w-full max-h-full"
          sizes="90vw"
          priority
        />
      </div>
    </div>
  );
}
