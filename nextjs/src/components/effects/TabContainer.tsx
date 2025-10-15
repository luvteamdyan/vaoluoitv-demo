"use client";
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import SlideTransition from './SlideTransition';
import { useSlideTransition } from './useSlideTransition';

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode | LucideIcon;
}

interface TabContainerProps {
  tabs: TabItem[];
  initialTab?: string;
  children: (activeTab: string, direction: 'left' | 'right') => ReactNode;
  className?: string;
}

export default function TabContainer({ 
  tabs, 
  initialTab, 
  children, 
  className = "" 
}: TabContainerProps) {
  const { 
    activeTab, 
    getCurrentDirection 
  } = useSlideTransition({ tabs, initialTab });

  const direction = getCurrentDirection();

  return (
    <div className={className}>
      <SlideTransition 
        direction={direction} 
        isActive={true}
        className="w-full"
      >
        {children(activeTab, direction)}
      </SlideTransition>
    </div>
  );
}

// Export hook để sử dụng riêng lẻ nếu cần
export { useSlideTransition };
