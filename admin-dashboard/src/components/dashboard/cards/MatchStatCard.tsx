'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';

interface MatchStatCardProps {
  className?: string;
  totalMatches?: number;
  loading?: boolean;
  error?: string | null;
}

export default function MatchStatCard({ 
  className = '', 
  totalMatches: propTotalMatches = 0, 
  loading: propLoading = false, 
  error: propError = null 
}: MatchStatCardProps) {
  const router = useRouter();

  if (propLoading) {
    return (
      <div className={`rounded-2xl p-5 ${className}`} style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--border)' 
      }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Tổng số trận đấu</p>
            <div className="h-8 rounded animate-pulse mt-2" style={{ backgroundColor: 'var(--muted)' }}></div>
          </div>
          <Trophy className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    );
  }

  if (propError) {
    return (
      <div className={`rounded-2xl p-5 ${className}`} style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--border)' 
      }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Lỗi tải dữ liệu</p>
            <p className="text-xs mt-1" style={{ color: 'var(--destructive)' }}>{propError}</p>
          </div>
          <Trophy className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
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
        e.currentTarget.style.borderColor = '#10b981';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onClick={() => router.push('/matches')}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6" style={{ color: '#10b981' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Tổng số trận đấu</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {propTotalMatches?.toLocaleString() || 0}
            </p>
            
            {/* Chỉ hiển thị total, không hiển thị live count cho dashboard */}
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              trận đấu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}