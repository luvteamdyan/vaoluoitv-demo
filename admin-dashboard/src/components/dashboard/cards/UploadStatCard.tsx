'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { uploadService } from '@/services/uploadService';
import { UploadStats } from '@/types/upload';

interface UploadStatCardProps {
  className?: string;
}

export default function UploadStatCard({ className = '' }: UploadStatCardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUploadStats();
  }, []);

  const loadUploadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const uploadStats = await uploadService.getUploadStats();
      setStats(uploadStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thống kê uploads');
      if (process.env.NODE_ENV === 'development') {
        // Silently handle error
      }
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };


  if (loading) {
    return (
      <div className={`rounded-2xl p-5 animate-pulse ${className}`} style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--border)' 
      }}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: 'var(--muted)' }}></div>
            <div className="h-8 rounded w-1/2" style={{ backgroundColor: 'var(--muted)' }}></div>
          </div>
          <div className="h-8 w-8 rounded-full" style={{ backgroundColor: 'var(--muted)' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-5 ${className}`} style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--destructive)' 
      }}>
        <p className="font-medium" style={{ color: 'var(--destructive)' }}>Lỗi: {error}</p>
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
        e.currentTarget.style.borderColor = '#f97316';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onClick={() => router.push('/uploads')}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Upload className="w-6 h-6" style={{ color: '#f97316' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Tổng số Media</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {stats?.total_uploads?.toLocaleString() || 0}
            </p>
            
            {stats && stats.total_size > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full text-sm font-semibold text-[#12B76A] bg-green-100 dark:bg-green-900">
                  {formatFileSize(stats.total_size)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
