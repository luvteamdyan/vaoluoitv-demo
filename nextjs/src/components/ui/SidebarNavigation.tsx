'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface SidebarNavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function SidebarNavigation({ activeSection = 'TIN TỨC', onSectionChange }: SidebarNavigationProps) {
  const [sliderPosition, setSliderPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sections = useMemo(() => [
    { id: 'TIN TỨC', label: 'TIN TỨC', color: 'from-yellow-400 to-orange-500' },
    { id: 'TỪ THIỆN', label: 'TỪ THIỆN', color: 'text-gray-400' },
    { id: 'VIDEO', label: 'VIDEO', color: 'text-gray-400' },
  ], []);

  // Update slider position when activeSection changes
  useEffect(() => {
    const activeIndex = sections.findIndex(section => section.id === activeSection);
    if (activeIndex !== -1 && containerRef.current) {
      const sectionElement = sectionRefs.current[activeIndex];
      if (sectionElement) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const sectionRect = sectionElement.getBoundingClientRect();
        const relativeTop = sectionRect.top - containerRect.top;
        setSliderPosition(relativeTop);
      }
    }
  }, [activeSection, sections]);

  const handleSectionClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-center py-4">
      {/* Sliding bar */}
      <div 
        className="absolute right-0 w-1 h-12 lg:h-16 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full transition-all duration-500 ease-in-out"
        style={{ 
          transform: `translateY(${sliderPosition}px)`,
          top: '16px' // py-4 offset
        }}
      />
      
      {sections.map((section, index) => (
        <div 
          key={section.id} 
          ref={el => { sectionRefs.current[index] = el; }}
          className="flex flex-col items-center"
        >
          <div className="py-3 px-2">
            {/* Main Section Box */}
            <div
              onClick={() => handleSectionClick(section.id)}
              className="relative cursor-pointer transition-all duration-300 flex items-center justify-center"
            >
              {/* Text */}
              <span
                className={`
                  relative vertical-title transition-all duration-300 cursor-pointer font-extrabold tracking-widest text-lg leading-tight
                  ${activeSection === section.id 
                    ? 'bg-gradient-to-b from-orange-400 to-red-400 bg-clip-text text-transparent scale-110' 
                    : 'text-gray-400'
                  }
                `}
                style={{ 
                  writingMode: 'vertical-lr', 
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)'
                }}
              >
                {section.label}
              </span>
            </div>
          </div>
          
          {/* Vertical line separator */}
          {index < sections.length - 1 && (
            <div className="w-px h-8 bg-gray-600/30 my-2" />
          )}
        </div>
      ))}
    </div>
  );
}
