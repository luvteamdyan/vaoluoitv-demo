"use client";
import React from 'react';
import ShootingStarBackground from '@/components/effects/TriangleAnimationBackground';

interface AnimatedLayoutProps {
  children: React.ReactNode;
  className?: string;
  showAnimation?: boolean;
}

export default function AnimatedLayout({ 
  children, 
  className = "",
  showAnimation = true 
}: AnimatedLayoutProps) {
  return (
    <div className={`relative ${className}`}>
      {showAnimation && <ShootingStarBackground />}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
