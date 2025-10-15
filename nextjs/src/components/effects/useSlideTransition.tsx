"use client";
import { useState, useCallback, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode | LucideIcon;
}

interface UseSlideTransitionProps {
  tabs: TabItem[];
  initialTab?: string;
}

export function useSlideTransition({ tabs, initialTab }: UseSlideTransitionProps) {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id);
  const [previousTab, setPreviousTab] = useState<string | null>(null);

  const changeTab = useCallback((newTabId: string) => {
    if (newTabId === activeTab) return;
    
    setPreviousTab(activeTab);
    setActiveTab(newTabId);
  }, [activeTab]);

  const getSlideDirection = useCallback((fromTabId: string, toTabId: string): 'left' | 'right' => {
    const fromIndex = tabs.findIndex(tab => tab.id === fromTabId);
    const toIndex = tabs.findIndex(tab => tab.id === toTabId);
    
    // Nếu chuyển từ tab có index thấp hơn sang tab có index cao hơn = slide sang trái
    // Nếu chuyển từ tab có index cao hơn sang tab có index thấp hơn = slide sang phải
    return toIndex > fromIndex ? 'left' : 'right';
  }, [tabs]);

  const getCurrentDirection = useCallback((): 'left' | 'right' => {
    if (!previousTab) return 'left';
    return getSlideDirection(previousTab, activeTab);
  }, [previousTab, activeTab, getSlideDirection]);

  return {
    activeTab,
    previousTab,
    changeTab,
    getSlideDirection,
    getCurrentDirection,
    tabs
  };
}
