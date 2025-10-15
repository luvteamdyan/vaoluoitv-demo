'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetButtonProps {
  onReset: () => void;
  className?: string;
  disabled?: boolean;
}

export default function ResetButton({ onReset, className = '', disabled = false }: ResetButtonProps) {
  return (
    <button
      onClick={onReset}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
        text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800
        border border-gray-300 dark:border-gray-600 rounded-lg
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      title="Reset toàn bộ state của trang"
    >
      <RotateCcw className="w-4 h-4" />
      Reset
    </button>
  );
}
