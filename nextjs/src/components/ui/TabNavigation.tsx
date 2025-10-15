'use client';

import { AuthMode } from '@/types/auth';

interface TabNavigationProps {
  activeTab: AuthMode;
  onTabChange: (tab: AuthMode) => void;
  tabs: Array<{
    key: AuthMode;
    label: string;
  }>;
  className?: string;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  tabs,
  className = '',
}: TabNavigationProps) {
  return (
    <div className={`flex gap-2 bg-white/20 p-1 rounded-lg ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 text-center ${
            activeTab === tab.key
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-red-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
