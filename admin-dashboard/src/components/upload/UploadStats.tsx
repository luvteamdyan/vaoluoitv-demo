'use client';

import React from 'react';
import { UploadStats as UploadStatsType } from '@/types/upload';

import { File, FileImage, FilePlay, MemoryStick } from 'lucide-react';

interface UploadStatsProps {
  stats: UploadStatsType | null;
  loading: boolean;
}

const UploadStats: React.FC<UploadStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-white/[0.03] rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Safe access to nested properties
  const uploadsByType = stats.uploads_by_type || {};
  const totalUploads = stats.total_uploads || 0;
  const totalSize = stats.total_size || 0;

  const statCards = [
    {
      title: 'Tổng số file',  
      value: totalUploads,
      icon: <File className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      subtitle: 'Tất cả file đã upload',
    },
    {
      title: 'Hình ảnh',
      value: uploadsByType.image || 0,
      icon: <FileImage className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      subtitle: `${totalUploads > 0 ? Math.round(((uploadsByType.image || 0) / totalUploads) * 100) : 0}% tổng số`,
    },
    {
      title: 'Video',
      value: uploadsByType.video || 0,
      icon: <FilePlay className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      subtitle: `${totalUploads > 0 ? Math.round(((uploadsByType.video || 0) / totalUploads) * 100) : 0}% tổng số`,
    },
    {
      title: 'Tổng dung lượng',
      value: formatFileSize(totalSize),
      icon: <MemoryStick className="w-6 h-6" />,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      subtitle: `Trung bình: ${totalUploads > 0 ? formatFileSize(Math.round(totalSize / totalUploads)) : '0 B'}`,
    },
  ];

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-white/[0.03] rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {card.subtitle}
              </p>
            </div>
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <span className={`text-2xl ${card.color}`}>
                {card.icon}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadStats;
