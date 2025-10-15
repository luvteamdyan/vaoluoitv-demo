'use client';

import { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
// import { X } from 'lucide-react';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
  showBackdrop?: boolean;
  backdropClassName?: string;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = '',
  showBackdrop = true,
  // backdropClassName = 'bg-black/50 backdrop-blur-sm',
}: BaseModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle visibility animation and scroll lock
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Lock scroll when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      // Unlock scroll when popup is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      {showBackdrop && (
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} />
      )}
      
      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} mx-4 bg-black to-red-700 rounded-2xl shadow-2xl transition-all duration-300 transform ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        } ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="relative bg-gradient-to-r from-red-900 via-red-700 to-red-900 p-4 text-white border-t-3 border-red-600 rounded-t-2xl">
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors duration-200 z-10 cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {title && (
              <div className="text-center">
                <h2 className="text-2xl font-bold transition-all duration-300">
                  {title}
                </h2>
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="relative p-6 space-y-3 bg-gradient-to-br from-gray-900 to-red-700 rounded-b-2xl transition-all duration-300 overflow-hidden">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
