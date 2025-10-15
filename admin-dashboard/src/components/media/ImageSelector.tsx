'use client';

import React, { useState } from 'react';
import { Upload } from '@/types/upload';
import MediaGallery from './MediaGallery';
import ImageWithFallback from '@/components/media/ImageWithFallback';

interface ImageSelectorProps {
  currentImage?: string;
  onChange: (imageUrl: string, imageData?: Upload) => void;
  placeholder?: string;
  category?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  showPreview?: boolean;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  currentImage,
  onChange,
  placeholder = 'Chọn hình ảnh',
  category,
  label,
  required = false,
  error,
  disabled = false,
  showPreview = true,
  aspectRatio = 'auto',
}) => {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Upload | null>(null);

  // Handle image selection from gallery
  const handleImageSelect = (image: Upload) => {
    setSelectedImage(image);
    onChange(image.url || '', image);
    setShowGallery(false);
  };

  // Handle clear selection
  const handleClear = () => {
    setSelectedImage(null);
    onChange('');
  };

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'landscape':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      default:
        return 'aspect-video';
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Image Preview/Selector */}
      <div className="space-y-3">
        {/* Current Image Display */}
        {showPreview && (currentImage || selectedImage?.url) && (
          <div className={`relative ${getAspectRatioClass()} rounded-lg overflow-hidden border border-[var(--sidebar-border)]`}>
            <ImageWithFallback
              src={currentImage || selectedImage?.url || ''}
              alt={selectedImage?.metadata?.title || selectedImage?.original_name || 'Selected image'}
              className="w-full h-full object-cover"
              fallbackIcon="camera"
            />
            
            {/* Overlay with clear button */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className="opacity-0 hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xóa
              </button>
            </div>
          </div>
        )}

        {/* Selector Button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowGallery(true)}
            disabled={disabled}
            className={`flex-1 px-4 py-2 border-2 border-dashed rounded-lg text-center transition-colors ${
              disabled
                ? 'border-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
                : error
                ? 'border-red-500 text-red-400 hover:border-red-400'
                : 'border-[var(--sidebar-border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--foreground)]'
            }`}
          >
            {currentImage || selectedImage?.url ? 'Thay đổi hình ảnh' : placeholder}
          </button>
          
          {currentImage || selectedImage?.url ? (
            <button
              type="button"
              onClick={() => setShowGallery(true)}
              disabled={disabled}
              className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Browse
            </button>
          ) : null}
        </div>

        {/* Image Info */}
        {selectedImage && (
          <div className="text-xs text-[var(--muted-foreground)] space-y-1">
            <div className="flex justify-between">
              <span>Tên:</span>
              <span className="truncate ml-2">{selectedImage.original_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Kích thước:</span>
              <span>{selectedImage.file_size ? (selectedImage.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Danh mục:</span>
              <span>{selectedImage.metadata?.category}/{selectedImage.metadata?.subcategory}</span>
            </div>
            {selectedImage.metadata?.dimensions && (
              <div className="flex justify-between">
                <span>Kích thước:</span>
                <span>{selectedImage.metadata.dimensions.width} × {selectedImage.metadata.dimensions.height}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Media Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-4 border border-[var(--sidebar-border)] w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-[var(--card-bg)] mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Chọn hình ảnh
              </h3>
              <button
                onClick={() => setShowGallery(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xl"
              >
                ×
              </button>
            </div>
            
            <MediaGallery
              onSelect={handleImageSelect}
              category={category}
              showUpload={true}
              onUpload={() => {
                // Handle upload - could open upload form
                if (process.env.NODE_ENV === 'development') {
                  // Upload new image
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
