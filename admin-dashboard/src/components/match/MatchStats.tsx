'use client';

import React from 'react';
import { MatchStats as MatchStatsType } from '@/types/match';
import { Trophy, Play, Clock, CheckCircle, Square } from 'lucide-react';

interface MatchStatsProps {
  stats: MatchStatsType | null;
  loading: boolean;
}

const MatchStats: React.FC<MatchStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--sidebar-border)]">
            <div className="animate-pulse">
              <div className="h-4 bg-[var(--muted)] rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-[var(--muted)] rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Tổng số trận đấu',
      value: stats.total,
      icon: Trophy,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Trận đang diễn ra',
      value: stats.live,
      icon: Play,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Trận sắp diễn ra',
      value: stats.scheduled,
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Trận đã kết thúc',
      value: stats.finished,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Trận chưa bắt đầu',
      value: stats.not_started,
      icon: Square,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--sidebar-border)] hover:border-[var(--accent)]/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchStats;
