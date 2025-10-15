'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${className}`}
      style={{
        backgroundColor: 'var(--hover-bg)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)'
      }}
      aria-label={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
      title={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
