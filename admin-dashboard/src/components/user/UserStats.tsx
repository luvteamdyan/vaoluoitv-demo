'use client';

import React from 'react';
import { UserStats as UserStatsType } from '@/types/user';

interface UserStatsProps {
  stats: UserStatsType;
  loading?: boolean;
}

export default function UserStats({ stats, loading = false }: UserStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-[var(--card-bg)] p-6 rounded-lg shadow-sm border border-[var(--sidebar-border)]">
            <div className="animate-pulse">
              <div className="h-4 bg-[var(--hover-bg)] rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-[var(--hover-bg)] rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng số Users',
      value: stats.totalUsers,
      color: 'bg-gray-300',
      icon: '',
    },
    {
      title: 'Users hoạt động',
      value: stats.activeUsers,
      color: 'bg-yellow-500',
      icon: '',
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      color: 'bg-red-500',
      icon: '',
    },
    {
      title: 'Regular Users',
      value: stats.regularUsers,
      color: 'bg-blue-500',
      icon: '',
    },
    {
      title: 'Users mới tháng này',
      value: stats.newUsersThisMonth,
      color: 'bg-gray-500',
      icon: '',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-[var(--card-bg)] p-6 rounded-lg shadow-sm border border-[var(--sidebar-border)] hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className={`${stat.color} p-3 rounded-full text-white text-xl`}>
              {stat.icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[var(--text-muted)]">{stat.title}</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
