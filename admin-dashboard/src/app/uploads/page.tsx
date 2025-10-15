'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, UploadFilters, UploadStats, UploadMetadata, UploadType } from '@/types/upload';
import { uploadService } from '@/services/uploadService';
import UploadStatsComponent from '@/components/upload/UploadStats';
import UploadFiltersComponent from '@/components/upload/UploadFilters';
import UploadTable from '@/components/upload/UploadTable';
import UploadForm from '@/components/upload/UploadForm';
import MediaGallery from '@/components/media/MediaGallery';
import ResetButton from '@/components/ui/ResetButton';
import {SquarePlus, AlertTriangle, RotateCcw, Folder} from 'lucide-react';

export default function UploadsPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
  const [filters, setFilters] = useState<UploadFilters>({
    page: 1,
    limit: 10,
  });
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Reset toàn bộ state của trang
  const resetPageState = () => {
    setUploads([]);
    setStats(null);
    setLoading(true);
    setShowForm(false);
    setViewMode('table');
    setFilters({
      page: 1,
      limit: 10,
    });
    setError(null);
    setUploading(false);
    setUploadProgress({});
    // Reload data
    loadData();
  };

  // Load uploads và stats
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [uploadsData, statsData] = await Promise.all([
        uploadService.getAllUploads(filters),
        uploadService.getUploadStats(),
      ]);
      
      setUploads(uploadsData.uploads);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      if (process.env.NODE_ENV === 'development') {
        // Silently handle error
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Xử lý upload file
  const handleUpload = async (file: File, metadata: UploadMetadata) => {
    try {
      setUploading(true);
      setError(null);
      
      // Determine upload type based on file type
      const uploadType = file.type.startsWith('image/') ? UploadType.IMAGE : UploadType.VIDEO;
      
      // Upload file
      const response = await (uploadType === UploadType.IMAGE 
        ? uploadService.uploadImage(file, metadata)
        : uploadService.uploadVideo(file, metadata)
      );
      
      // Track upload progress
      setUploadProgress(prev => ({ ...prev, [response.upload_id]: response.progress }));
      
      // Reload data after upload
      await loadData();
      
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi upload file');
      throw err; // Re-throw để UploadForm có thể xử lý
    } finally {
      setUploading(false);
    }
  };

  // Xử lý xóa upload
  const handleDeleteUpload = async (uploadId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa file này?')) {
      return;
    }

    try {
      await uploadService.deleteUpload(uploadId);
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa file');
    }
  };

  // Xử lý xem file
  const handleViewUpload = (upload: Upload) => {
    if (upload.url) {
      window.open(upload.url, '_blank');
    }
  };

  // Xử lý hủy form
  const handleCancelForm = () => {
    setShowForm(false);
  };


  // Xử lý reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  // Xử lý thay đổi filters
  const handleFiltersChange = (newFilters: UploadFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              {viewMode === 'gallery' ? (
                <>
                  <Folder className="w-8 h-8" />
                  Thư viện Media
                </>
              ) : (
                'Media Upload (Quản lý Media)'
              )}
            </h1>
            {viewMode === 'gallery' && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Duyệt và chọn media ({uploads.length} mục)
              </p>
            )}
          </div>
          <ResetButton onReset={resetPageState} disabled={loading} />
        </div>
        {viewMode === 'table' && (
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý và theo dõi tất cả file media đã upload lên hệ thống
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="flex items-center gap-2">
              <span>⏳</span>
              Đang upload {Object.keys(uploadProgress).length} file(s)...
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(uploadProgress).map(([id, progress]) => (
                <div key={id} className="text-xs bg-blue-500/20 px-2 py-1 rounded">
                  {progress}%
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && <UploadStatsComponent stats={stats} loading={loading} />}

      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-end">
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              viewMode === 'gallery'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Thư viện
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-white/[0.03] rounded-t-2xl rounded-b-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-end">
                <div className="flex flex-col lg:flex-row gap-4 flex-1">
                      <UploadFiltersComponent
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onReset={handleResetFilters}
                      />
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="w-full h-12 inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Đặt lại
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full h-12 inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 text-sm bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <SquarePlus className="w-4 h-4" />
                    Tải lên
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Table */}
          <div>
            <UploadTable
              uploads={uploads}
              onDelete={handleDeleteUpload}
              onView={handleViewUpload}
              loading={loading}
            />
          </div>
        </div>
      ) : (
        /* Media Gallery */
        <MediaGallery
          onSelect={(image) => {
            // Handle image selection in gallery view
            if (process.env.NODE_ENV === 'development') {
                // Silently handle selection
            }
          }}
          showUpload={true}
          onUpload={() => setShowForm(true)}
        />
      )}

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-4 border border-gray-200 dark:border-gray-700 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-lg bg-white dark:bg-gray-800 mb-4">
            <UploadForm
              onSubmit={handleUpload}
              onCancel={handleCancelForm}
              loading={uploading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
