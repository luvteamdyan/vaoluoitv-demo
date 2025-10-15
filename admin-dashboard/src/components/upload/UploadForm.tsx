'use client';

import React, { useState, useRef } from 'react';
import { UploadType, UploadMetadata } from '@/types/upload';
import { Image, Video, Folder } from 'lucide-react';

interface UploadFormProps {
  onSubmit: (file: File, metadata: UploadMetadata) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const CATEGORIES = [
  { value: 'banners', label: 'Banners', subcategories: [
    { value: 'hero', label: 'Hero Banner' },
    { value: 'ads', label: 'Ads Banner' },
    { value: 'promotional', label: 'Promotional' }
  ]},
  { value: 'logos', label: 'Logos', subcategories: [
    { value: 'company', label: 'Company Logo' },
    { value: 'partners', label: 'Partners' },
    { value: 'teams', label: 'Teams' }
  ]},
  { value: 'thumbnails', label: 'Thumbnails', subcategories: [
    { value: 'matches', label: 'Match Thumbnails' },
    { value: 'users', label: 'User Thumbnails' }
  ]},
  { value: 'avatars', label: 'Avatars', subcategories: [
    { value: 'users', label: 'User Avatars' }
  ]},
  { value: 'backgrounds', label: 'Backgrounds', subcategories: [
    { value: 'hero', label: 'Hero Background' },
    { value: 'section', label: 'Section Background' }
  ]},
  { value: 'general', label: 'General', subcategories: [
    { value: 'default', label: 'Default' }
  ]},
];

const UploadForm: React.FC<UploadFormProps> = ({
  onSubmit,
  onCancel,
  loading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<UploadType>(UploadType.IMAGE);
  const [metadata, setMetadata] = useState<UploadMetadata>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [],
  });
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current category subcategories
  const getCurrentSubcategories = () => {
    const currentCategory = CATEGORIES.find(cat => cat.value === metadata.category);
    return currentCategory?.subcategories || [];
  };

  // Handle tags input
  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setMetadata(prev => ({ ...prev, tags }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setErrors({});
    
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setErrors({ file: 'Chỉ hỗ trợ file hình ảnh và video' });
      return;
    }

    // Validate file size
    const maxImageSize = 50 * 1024 * 1024; // 50MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    
    if (isImage && file.size > maxImageSize) {
      setErrors({ file: 'Kích thước file hình ảnh không được vượt quá 50MB' });
      return;
    }
    
    if (isVideo && file.size > maxVideoSize) {
      setErrors({ file: 'Kích thước file video không được vượt quá 100MB' });
      return;
    }

    setSelectedFile(file);
    setUploadType(isImage ? UploadType.IMAGE : UploadType.VIDEO);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleInputChange = (field: keyof UploadMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedFile) {
      newErrors.file = 'Vui lòng chọn file để upload';
    }

    if (!metadata.title?.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!metadata.category?.trim()) {
      newErrors.category = 'Danh mục là bắt buộc';
    }

    if (!metadata.subcategory?.trim()) {
      newErrors.subcategory = 'Loại con là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedFile) {
      return;
    }

    try {
      await onSubmit(selectedFile, metadata);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // Error handling is done in parent component
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Upload Media
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Chọn file *
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--sidebar-border)] hover:border-[var(--accent)]/50'
            } ${errors.file ? 'border-red-500' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="text-4xl">
                {selectedFile ? (
                  selectedFile.type.startsWith('image/') ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />
                ) : (
                  <Folder className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              <div>
                <p className="text-lg font-medium text-[var(--foreground)]">
                  {selectedFile ? selectedFile.name : 'Kéo thả file vào đây hoặc click để chọn'}
                </p>
                {selectedFile && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                )}
              </div>
              
              {!selectedFile && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Hỗ trợ: JPG, PNG, GIF, WebP, MP4, WebM, AVI, MOV
                </p>
              )}
            </div>
          </div>
          
          {errors.file && (
            <p className="mt-2 text-sm text-red-400">{errors.file}</p>
          )}
        </div>

        {/* Upload Type */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Loại upload
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value={UploadType.IMAGE}
                checked={uploadType === UploadType.IMAGE}
                onChange={(e) => setUploadType(e.target.value as UploadType)}
                className="mr-2"
                disabled={!selectedFile}
              />
              <span className="text-sm text-[var(--foreground)]">Hình ảnh</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value={UploadType.VIDEO}
                checked={uploadType === UploadType.VIDEO}
                onChange={(e) => setUploadType(e.target.value as UploadType)}
                className="mr-2"
                disabled={!selectedFile}
              />
              <span className="text-sm text-[var(--foreground)]">Video</span>
            </label>
          </div>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Danh mục *
            </label>
            <select
              value={metadata.category || ''}
              onChange={(e) => {
                setMetadata(prev => ({ 
                  ...prev, 
                  category: e.target.value,
                  subcategory: '' // Reset subcategory when category changes
                }));
                if (errors.category) {
                  setErrors(prev => ({ ...prev, category: '' }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-[var(--sidebar-border)]'
              }`}
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
            >
              <option value="" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Chọn danh mục</option>
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-400">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Loại con *
            </label>
            <select
              value={metadata.subcategory || ''}
              onChange={(e) => {
                setMetadata(prev => ({ ...prev, subcategory: e.target.value }));
                if (errors.subcategory) {
                  setErrors(prev => ({ ...prev, subcategory: '' }));
                }
              }}
              disabled={!metadata.category}
              className={`w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent ${
                errors.subcategory ? 'border-red-500' : 'border-[var(--sidebar-border)]'
              } ${!metadata.category ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
            >
              <option value="" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Chọn loại con</option>
              {getCurrentSubcategories().map(subcategory => (
                <option key={subcategory.value} value={subcategory.value} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                  {subcategory.label}
                </option>
              ))}
            </select>
            {errors.subcategory && (
              <p className="mt-1 text-sm text-red-400">{errors.subcategory}</p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={metadata.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-[var(--sidebar-border)]'
              }`}
              placeholder="Nhập tiêu đề cho file"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Mô tả
            </label>
            <textarea
              value={metadata.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              placeholder="Nhập mô tả cho file"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              placeholder="Nhập tags phân cách bằng dấu phẩy (ví dụ: football, premier league, logo)"
            />
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--sidebar-border)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--muted)] hover:bg-[var(--muted)]/80 rounded-md transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent)]/90 rounded-md transition-colors disabled:opacity-50"
            disabled={loading || !selectedFile}
          >
            {loading ? 'Đang upload...' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
