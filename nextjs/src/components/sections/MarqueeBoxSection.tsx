'use client';

import React, { useState, useEffect } from 'react';
import { sanityContentService } from '@/services/sanityContentService';
import { mergeMarqueeContent } from '@/utils/sanityContentHelpers';
import type { SanityMarqueeContent } from '@/types/sanity-content';

interface MarqueeBoxSectionProps {
  className?: string;
}

const MarqueeBoxSection: React.FC<MarqueeBoxSectionProps> = ({
  className = ""
}) => {
  const [marqueeContent, setMarqueeContent] = useState<SanityMarqueeContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarqueeContent = async () => {
      try {
        const data = await sanityContentService.getMarqueeContent();
        const mergedData = mergeMarqueeContent(data);
        setMarqueeContent(mergedData);
      } catch (error) {
        console.error('Error loading marquee content:', error);
        // Use default data as fallback
        const defaultData = mergeMarqueeContent(null);
        setMarqueeContent(defaultData);
      } finally {
        setLoading(false);
      }
    };

    loadMarqueeContent();
  }, []);

  if (loading || !marqueeContent) {
    return null;
  }
  return (
    <section className={`w-full bg-gradient-to-r from-red-800 to-red-500 py-2 md:py-3 overflow-hidden ${className}`}>
      <div className="relative">
        <div 
          className="flex whitespace-nowrap text-white font-bold text-sm md:text-base lg:text-lg animate-marquee"
          style={{
            animationDuration: `${marqueeContent.speed || 30}s`
          }}
        >
          <span className="inline-block px-1 md:px-2 lg:px-4">
            {marqueeContent.text}
          </span>
          <span className="inline-block px-1 md:px-2 lg:px-4">
            {marqueeContent.text}
          </span>
          <span className="inline-block px-1 md:px-2 lg:px-4">
            {marqueeContent.text}
          </span>
        </div>
      </div>
    </section>
  );
};

export default MarqueeBoxSection;
