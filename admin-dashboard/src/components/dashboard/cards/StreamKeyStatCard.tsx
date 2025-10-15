'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key } from 'lucide-react';
import { streamKeyService } from '@/services/streamKeyService';
import { StreamKeyStats } from '@/types/stream-key';

interface StreamKeyStatCardProps {
  className?: string;
}

export default function StreamKeyStatCard({ className = '' }: StreamKeyStatCardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<StreamKeyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStreamKeyStats();
  }, []);

  const loadStreamKeyStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy tất cả stream keys để tính toán stats
      const allStreamKeys = await streamKeyService.getAll({ limit: 1000 });
      
      // Tính toán stats từ dữ liệu
      const calculatedStats: StreamKeyStats = {
        total: allStreamKeys.total,
        active: allStreamKeys.streamKeys.filter(sk => !sk.revoked_at).length,
        revoked: allStreamKeys.streamKeys.filter(sk => sk.revoked_at).length,
        byMatch: []
      };

      // Tính toán theo match
      const matchStats = new Map<string, { match_name: string; count: number }>();
      
      allStreamKeys.streamKeys.forEach(streamKey => {
        if (streamKey.matches && streamKey.matches.length > 0) {
          streamKey.matches.forEach(match => {
            const matchId = match._id || match.id;
            if (matchId) {
              const matchName = `${match.home_team.name} vs ${match.away_team.name}`;
              
              if (!matchStats.has(matchId)) {
                matchStats.set(matchId, { match_name: matchName, count: 0 });
              }
              matchStats.get(matchId)!.count++;
            }
          });
        }
      });

      calculatedStats.byMatch = Array.from(matchStats.entries()).map(([match_id, data]) => ({
        match_id,
        match_name: data.match_name,
        count: data.count
      })).sort((a, b) => b.count - a.count).slice(0, 5);

      setStats(calculatedStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thống kê stream keys');
      if (process.env.NODE_ENV === 'development') {
        // Silently handle error
      }
    } finally {
      setLoading(false);
    }
  };

  const getActivePercentage = () => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.active / stats.total) * 100);
  };

  if (loading) {
    return (
      <div className={`rounded-2xl p-5 ${className}`} style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--border)' 
      }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Tổng số Stream Keys</p>
            <div className="h-8 rounded animate-pulse mt-2" style={{ backgroundColor: 'var(--muted)' }}></div>
          </div>
          <Key className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
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
          <Key className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
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
        e.currentTarget.style.borderColor = '#8b5cf6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onClick={() => router.push('/stream-keys')}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-6 h-6" style={{ color: '#8b5cf6' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Tổng số Stream Keys</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {stats?.total?.toLocaleString() || 0}
            </p>
            
            {stats && stats.total > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full text-sm font-semibold text-[#12B76A] bg-green-100 dark:bg-green-900">
                  {getActivePercentage()}% đang hoạt động
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}