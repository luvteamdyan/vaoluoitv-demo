'use client';

import React, { useState, useEffect } from 'react';
import { UploadFilters as UploadFiltersType, UploadStatus } from '@/types/upload';
import { Eye, FolderKanban, FolderOpenDot, Grid2x2Check, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UploadFiltersProps {
  filters: UploadFiltersType;
  onFiltersChange: (filters: UploadFiltersType) => void;
  onReset: () => void;
}

const UploadFilters: React.FC<UploadFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<UploadFiltersType>(filters);
  const [searchInput, setSearchInput] = useState<string>(filters.search || '');

  // Đồng bộ localFilters với filters prop khi filters thay đổi
  useEffect(() => {
    setLocalFilters(filters);
    setSearchInput(filters.search || '');
  }, [filters]);

  const handleInputChange = (field: keyof UploadFiltersType, value: string | boolean | number | undefined) => {
    const newFilters = { ...localFilters, [field]: value, page: 1 }; // Reset về trang 1 khi filter thay đổi
    setLocalFilters(newFilters);
    onFiltersChange(newFilters); // Tự động gửi lên parent
  };

  // Handler riêng cho search input (chỉ update local state)
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  // Handler cho search khi nhấn Enter
  const handleSearchSubmit = () => {
    const newFilters = { ...localFilters, search: searchInput || undefined, page: 1 };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handler cho Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleReset = () => {
    const resetFilters: UploadFiltersType = {
      page: 1,
      limit: 10,
    };
    setLocalFilters(resetFilters);
    setSearchInput('');
    onFiltersChange(resetFilters);
    onReset();
  };

  return (
    <div className="flex-1">
      {/* Clean Filter Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Section - Search */}
        <div className="flex-1 lg:flex-[2]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Tìm kiếm</span>
            </div>
          </label>
          <input
            type="text"
            placeholder="Tìm kiếm file, tiêu đề, mô tả... (Nhấn Enter để tìm)"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-12 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        {/* Status - TODO: Backend chưa hỗ trợ filter theo status */}
        {/* <div>
          <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
            <Grid2x2Check className="w-4 h-4" /> Trạng thái
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={UploadStatus.PENDING}>Chờ xử lý</option>
            <option value={UploadStatus.UPLOADING}>Đang upload</option>
            <option value={UploadStatus.PROCESSING}>Đang xử lý</option>
            <option value={UploadStatus.COMPLETED}>Hoàn thành</option>
            <option value={UploadStatus.FAILED}>Thất bại</option>
            <option value={UploadStatus.DELETED}>Đã xóa</option>
          </select>
        </div> */}

        {/* Type */}
        <div>
          <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
            <FolderKanban className="w-4 h-4" /> Loại file
          </label>
          <select
            value={localFilters.file_type || ''}
            onChange={(e) => handleInputChange('file_type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
          >
            <option value="" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Tất cả loại</option>
            <option value="image" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Hình ảnh</option>
            <option value="video" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Video</option>
            <option value="document" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Tài liệu</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
            <FolderOpenDot className="w-4 h-4" /> Danh mục
          </label>
          <input
            type="text"
            placeholder="Tên danh mục..."
            value={''}
            className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
        </div>

        {/* Limit Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Hiển thị</span>
            </div>
          </label>
          <Select
            value={localFilters.limit?.toString() || '10'}
            onValueChange={(value) => handleInputChange('limit', parseInt(value))}
          >
            <SelectTrigger className="w-full h-12 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <SelectItem value="10" className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">10 file</SelectItem>
              <SelectItem value="25" className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">25 file</SelectItem>
              <SelectItem value="50" className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">50 file</SelectItem>
              <SelectItem value="100" className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">100 file</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
};

export default UploadFilters;