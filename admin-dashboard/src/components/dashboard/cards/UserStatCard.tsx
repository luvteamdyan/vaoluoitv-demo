'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';

interface UserStatCardProps {
  className?: string;
  totalUsers?: number;
  loading?: boolean;
  error?: string | null;
}

export default function UserStatCard({ 
  className = '', 
  totalUsers: propTotalUsers = 0, 
  loading: propLoading = false, 
  error: propError = null 
}: UserStatCardProps) {
  const router = useRouter();
  const [previousMonthGrowth] = useState<number | null>(null);

  // Use props if provided, otherwise use local state
  const totalUsers = propTotalUsers;
  const loading = propLoading;
  const error = propError;

  if (loading) {
    return (
      <div className={`rounded-2xl p-5 ${className}`} style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--border)' 
      }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Tổng số người dùng</p>
            <div className="h-8 rounded animate-pulse mt-2" style={{ backgroundColor: 'var(--muted)' }}></div>
          </div>
          <Users className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-5 ${className}`} style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--border)' 
      }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Lỗi tải dữ liệu</p>
            <p className="text-xs mt-1" style={{ color: 'var(--destructive)' }}>{error}</p>
          </div>
          <Users className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-2xl p-5 cursor-pointer transition-colors ${className}`}
      style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--border)' 
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onClick={() => router.push('/users')}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Tổng số người dùng</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {totalUsers.toLocaleString()}
            </p>
            
            {previousMonthGrowth !== null && (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full text-sm font-semibold ${
                  previousMonthGrowth > 0 ? 'text-[#12B76A] bg-green-100 dark:bg-green-900' : 
                  previousMonthGrowth < 0 ? 'text-[#f04438] bg-red-50 dark:bg-red-900' : 'text-gray-500'
                }`}>
                  {previousMonthGrowth > 0 ? '+' : ''}{previousMonthGrowth.toFixed(1)}%
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>vs tháng trước</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}