'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, UploadFilters, UploadType } from '@/types/upload';
import { uploadService } from '@/services/uploadService';
import ImageWithFallback from '@/components/media/ImageWithFallback';
import { AlertTriangle, Video, Image, Folder, Search } from 'lucide-react';

interface MediaGalleryProps {
  onSelect?: (image: Upload) => void;
  multiSelect?: boolean;
  selectedImages?: Upload[];
  category?: string;
  showUpload?: boolean;
  onUpload?: () => void;
  mediaType?: 'image' | 'video' | 'all';
}

const CATEGORIES = [
  { value: 'banners', label: 'Banners', subcategories: ['hero', 'ads', 'promotional'] },
  { value: 'logos', label: 'Logos', subcategories: ['company', 'partners', 'teams'] },
  { value: 'thumbnails', label: 'Thumbnails', subcategories: ['matches', 'users'] },
  { value: 'avatars', label: 'Avatars', subcategories: ['users'] },
  { value: 'backgrounds', label: 'Backgrounds', subcategories: ['hero', 'section'] },
  { value: 'general', label: 'General', subcategories: ['default'] },
];

const MediaGallery: React.FC<MediaGalleryProps> = ({
  onSelect,
  selectedImages = [],
  category,
  showUpload = true,
  onUpload,
  mediaType = 'all',
}) => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load uploads
  const loadUploads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: UploadFilters = {
        page: 1,
        limit: 50,
      };

      // Add file type filter based on mediaType prop
      if (mediaType !== 'all') {
        filters.file_type = mediaType as UploadType;
      }

      // Note: Category filtering is done client-side since API doesn't support it

      // Add search filter
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await uploadService.getAllUploads(filters);
      setUploads(response.uploads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, mediaType]);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  // Handle image selection
  const handleImageSelect = (image: Upload) => {
    if (onSelect) {
      onSelect(image);
    }
  };

  // Check if image is selected
  const isImageSelected = (image: Upload): boolean => {
    return selectedImages.some(selected => selected.upload_id === image.upload_id);
  };

  // Get current category subcategories
  const getCurrentSubcategories = () => {
    const currentCategory = CATEGORIES.find(cat => cat.value === selectedCategory);
    return currentCategory?.subcategories || [];
  };

  // Filter uploads by category and subcategory (client-side filter since backend doesn't support it)
  const filteredUploads = uploads.filter(upload => {
    // Category filter - if no metadata.category, show all (for backward compatibility)
    if (selectedCategory !== 'all') {
      if (upload.metadata?.category && upload.metadata.category !== selectedCategory) {
        return false;
      }
    }
    
    // Subcategory filter - if no metadata.subcategory, show all (for backward compatibility)
    if (selectedSubcategory !== 'all') {
      if (upload.metadata?.subcategory && upload.metadata.subcategory !== selectedSubcategory) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-t-2xl rounded-b-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-end">
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              {/* View Controls */}
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Lưới
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Danh sách
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Search className="w-4 h-4 inline mr-2" />
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên, mô tả..."
                    className="w-full h-12 px-5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-colors duration-200"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Folder className="w-4 h-4 inline mr-2" />
                    Danh mục
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcategory('all');
                    }}
                    className="w-full h-12 px-5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-colors duration-200"
                    style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  >
                    <option value="all" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Tất cả</option>
                    {CATEGORIES.map(category => (
                      <option key={category.value} value={category.value} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Folder className="w-4 h-4 inline mr-2" />
                    Loại
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full h-12 px-5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-colors duration-200"
                    style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  >
                    <option value="all" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Tất cả</option>
                    {getCurrentSubcategories().map(subcategory => (
                      <option key={subcategory} value={subcategory} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                        {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Upload Button */}
            {showUpload && onUpload && (
              <div className="flex items-center gap-3">
                <button
                  onClick={onUpload}
                  className="w-full h-12 inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 text-sm bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <Folder className="w-4 h-4" />
                  Tải lên
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div>

        {error && (
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
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
          </div>
        )}

        {loading ? (
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải...</p>
              </div>
            </div>
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {mediaType === 'video' ? <Video className="w-4 h-4" /> : mediaType === 'image' ? <Image className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            </div>
            <p className="text-[var(--muted-foreground)] mb-2">
              Không tìm thấy {mediaType === 'video' ? 'video' : mediaType === 'image' ? 'hình ảnh' : 'media'} nào
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Thử thay đổi filtering hoặc upload {mediaType === 'video' ? 'video' : mediaType === 'image' ? 'hình ảnh' : 'media'} mới
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
                : 'space-y-2'
            }>
            {filteredUploads.map((upload) => {
              const isSelected = isImageSelected(upload);
              
              if (viewMode === 'list') {
                return (
                  <div
                    key={upload.upload_id}
                    onClick={() => handleImageSelect(upload)}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                      {upload.file_type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-gray-400" />
                        </div>
                      ) : (
                        <ImageWithFallback
                          src={upload.url || ''}
                          alt={upload.metadata?.title || upload.original_name}
                          className="w-full h-full object-cover"
                          fallbackIcon="camera"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {upload.metadata?.title || upload.original_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {upload.metadata?.category}/{upload.metadata?.subcategory} • {uploadService.formatFileSize(upload.file_size)}
                      </p>
                    </div>
                    
                    {isSelected && (
                      <div className="ml-3">
                        <span className="text-blue-600 text-lg font-bold">✓</span>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={upload.upload_id}
                  onClick={() => handleImageSelect(upload)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' 
                      : 'hover:shadow-md'
                  }`}
                >
                  {upload.file_type === 'video' ? (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Video</span>
                      </div>
                    </div>
                  ) : (
                    <ImageWithFallback
                      src={upload.url || ''}
                      alt={upload.metadata?.title || upload.original_name}
                      className="w-full h-full object-cover"
                      fallbackIcon="camera"
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    {isSelected && (
                      <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg">
                        <span className="text-sm font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-xs truncate font-medium">
                      {upload.metadata?.title || upload.original_name}
                    </p>
                    <p className="text-white/70 text-xs">
                      {upload.metadata?.category}/{upload.metadata?.subcategory}
                    </p>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaGallery;
