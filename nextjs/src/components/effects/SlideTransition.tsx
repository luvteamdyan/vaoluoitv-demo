"use client";
import { useState, useEffect, ReactNode } from 'react';

interface SlideTransitionProps {
  children: ReactNode;
  direction: 'left' | 'right';
  isActive: boolean;
  className?: string;
}

export default function SlideTransition({ 
  children, 
  direction, 
  isActive, 
  className = "" 
}: SlideTransitionProps) {
  const [isVisible, setIsVisible] = useState(isActive);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isActive) {
      // Khi tab được kích hoạt
      setIsVisible(true);
      // Delay nhỏ để đảm bảo element đã được render
      setTimeout(() => {
        setAnimationClass('slide-in');
      }, 10);
    } else {
      // Khi tab bị ẩn
      setAnimationClass('slide-out');
      // Đợi animation hoàn thành rồi mới ẩn element
      const timer = setTimeout(() => {
        setIsVisible(false);
        setAnimationClass('');
      }, 300); // Thời gian animation
      
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isVisible) return null;

  const getAnimationClass = () => {
    const baseClass = 'transition-all duration-300 ease-in-out';
    const directionClass = direction === 'left' ? 'slide-right' : 'slide-left';
    return `${baseClass} ${directionClass} ${animationClass} ${className}`;
  };

  return (
    <div className={getAnimationClass()}>
      {children}
    </div>
  );
}

// CSS cho animation
export const slideTransitionStyles = `
  .slide-left.slide-in {
    animation: slideInFromLeft 0.3s ease-in-out forwards;
  }
  
  .slide-left.slide-out {
    animation: slideOutToLeft 0.3s ease-in-out forwards;
  }
  
  .slide-right.slide-in {
    animation: slideInFromRight 0.3s ease-in-out forwards;
  }
  
  .slide-right.slide-out {
    animation: slideOutToRight 0.3s ease-in-out forwards;
  }
  
  @keyframes slideInFromLeft {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutToLeft {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(-100%);
      opacity: 0;
    }
  }
  
  @keyframes slideInFromRight {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutToRight {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
