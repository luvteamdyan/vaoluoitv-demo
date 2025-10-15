'use client';

import React, { useState } from 'react';
import { Upload } from '@/types/upload';
import { Copy, Eye, FileText, Folder, FolderOpenDot, Image, SquarePlay, Tag, Trash2, Video } from 'lucide-react';

interface UploadTableProps {
  uploads: Upload[];
  onDelete: (uploadId: string) => void;
  onView: (upload: Upload) => void;
  loading: boolean;
}

const UploadTable: React.FC<UploadTableProps> = ({
  uploads,
  onDelete,
  onView,
  loading,
}) => {
  const [sortField, setSortField] = useState<keyof Upload>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Upload) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };


  const getFileTypeIcon = (mimeType?: string) => {
    if (!mimeType) return <Folder className="w-4 h-4" />;
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" aria-label="Image file" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (mimeType.startsWith('application/pdf')) return <FileText className="w-4 h-4" />;
    return <Folder className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '-';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedUploads = [...uploads].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--sidebar-border)]">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-[var(--muted)] rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--muted)] rounded w-3/4"></div>
                  <div className="h-3 bg-[var(--muted)] rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-[var(--muted)] rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--sidebar-border)]">
        <div className="p-12 text-center">
          <div className="text-6xl mb-4"><Folder className="w-4 h-4" /></div>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
            Chưa có file nào
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Hãy upload file đầu tiên để bắt đầu quản lý media
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
          <thead className="border-b border-gray-300 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                File
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('file_type')}
              >
                Loại
                {sortField === 'file_type' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('file_size')}
              >
                Kích thước
                {sortField === 'file_size' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Thời lượng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Metadata
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('createdAt')}
              >
                Ngày tạo
                {sortField === 'createdAt' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            {sortedUploads.map((upload) => (
              <tr key={upload.upload_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-[var(--hover-bg)] flex items-center justify-center text-lg">
                        {getFileTypeIcon(upload.mime_type)}
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--foreground)] truncate">
                        {upload.metadata?.title || upload.original_name}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] truncate">
                        {upload.original_name}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        ID: {upload.upload_id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                      {upload.file_type === 'image' ? <Image className="w-6 h-6" aria-label="Image file" /> : upload.file_type === 'video' ? <SquarePlay className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {upload.mime_type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                </td>
                <td className="px-4 py-4 text-sm text-[var(--foreground)]">
                  {formatFileSize(upload.file_size)}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--foreground)]">
                  {formatDuration(upload.duration)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    {upload.metadata?.category && (
                      <div className="text-[var(--muted-foreground)] flex items-center gap-1">
                        <FolderOpenDot className="w-4 h-4" />{upload.metadata.category}
                      </div>
                    )}
                    {upload.metadata?.tags && upload.metadata.tags.length > 0 && (
                      <div className="text-[var(--muted-foreground)] flex items-center gap-1">
                        <Tag className="w-4 h-4" /> {upload.metadata.tags.slice(0, 2).join(', ')}
                        {upload.metadata.tags.length > 2 && '...'}
                      </div>
                    )}
                    {upload.metadata?.description && (
                      <div className="text-[var(--muted-foreground)] flex items-center gap-1 truncate" title={upload.metadata.description}>
                        <FileText className="w-4 h-4" /> {upload.metadata.description.slice(0, 30)}...
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-[var(--foreground)]">
                  <div className="flex flex-col">
                    <span>{formatDate(upload.createdAt)}</span>
                    {upload.completed_at && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        Hoàn thành: {formatDate(upload.completed_at)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {upload.url && (
                      <button
                        onClick={() => onView(upload)}
                        className="text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors p-1 rounded hover:bg-[var(--hover-bg)]"
                        title="Xem file"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(upload.upload_id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-[var(--hover-bg)]"
                      title="Xóa file"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(upload.url || '')}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-[var(--hover-bg)]"
                      title="Copy URL"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default UploadTable;
