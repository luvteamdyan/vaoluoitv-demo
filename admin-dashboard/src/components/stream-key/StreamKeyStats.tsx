'use client';

import { StreamKey } from '@/types/stream-key';
import { Key, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';

interface StreamKeyStatsProps {
  streamKeys: StreamKey[];
  loading: boolean;
}

export default function StreamKeyStats({ streamKeys, loading }: StreamKeyStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rounded-lg p-6" style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <div className="animate-pulse">
              <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: 'var(--muted)' }}></div>
              <div className="h-8 rounded w-1/2" style={{ backgroundColor: 'var(--muted)' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = {
    total: streamKeys.length,
    active: streamKeys.filter(sk => !sk.revoked_at).length,
    revoked: streamKeys.filter(sk => sk.revoked_at).length,
    // Prioritize matches array (theo API docs: 1 Stream Key - N Matches)
    assigned: streamKeys.filter(sk => 
      (sk.matches && sk.matches.length > 0) || sk.match
    ).length,
    unassigned: streamKeys.filter(sk => 
      (!sk.matches || sk.matches.length === 0) && !sk.match
    ).length,
    totalMatches: streamKeys.reduce((total, sk) => {
      if (sk.matches && sk.matches.length > 0) return total + sk.matches.length;
      if (sk.match) return total + 1;
      return total;
    }, 0),
    activeMatches: streamKeys.reduce((total, sk) => {
      if (sk.matches && sk.matches.length > 0) {
        return total + sk.matches.filter(match => match.status === 'live').length;
      }
      if (sk.match && sk.match.status === 'live') return total + 1;
      return total;
    }, 0),
    casters: streamKeys.filter(sk => {
      const user = sk.user || (typeof sk.user_id === 'object' ? sk.user_id : null);
      return user && user.role === 'caster';
    }).length,
  };


  const assignedPercentage = stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0;

  const statCards = [
    {
      title: 'Tổng số Stream Keys',
      value: stats.total,
      icon: <Key className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      subtitle: 'Tất cả stream keys',
    },
    {
      title: 'Đã gán match',
      value: stats.assigned,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      subtitle: `${assignedPercentage}% tổng số`,
    },
    {
      title: 'Chưa gán match',
      value: stats.unassigned,
      icon: <XCircle className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      subtitle: `${100 - assignedPercentage}% tổng số`,
    },
    {
      title: 'Tổng match assignments',
      value: stats.totalMatches,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      subtitle: `${stats.activeMatches} đang active`,
    },
    {
      title: 'Bình luận viên',
      value: stats.casters,
      icon: <Users className="w-6 h-6" />,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      subtitle: `${stats.casters} BLV có stream key`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div key={index} className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--card-bg)', 
          border: '1px solid var(--border)' 
        }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                {card.title}
              </p>
              <p className={`text-2xl font-bold mb-1 ${card.color}`}>
                {card.value}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {card.subtitle}
              </p>
            </div>
            <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
              <div className={card.color}>
                {card.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
