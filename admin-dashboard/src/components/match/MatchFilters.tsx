'use client';

import React, { useState, useEffect } from 'react';
import { MatchFilters as MatchFiltersType, MatchStatus, MatchType } from '@/types/match';
import { Search, RotateCcw, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MatchFiltersProps {
  filters: MatchFiltersType;
  onFiltersChange: (filters: MatchFiltersType) => void;
  onReset: () => void;
  onCreateMatch?: () => void;
}

export default function MatchFilters({ 
  filters, 
  onFiltersChange, 
  onReset,
  // onCreateMatch
}: MatchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<MatchFiltersType>(filters);

  // Đồng bộ localFilters với filters prop khi filters thay đổi
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field: keyof MatchFiltersType, value: string | number | boolean | undefined) => {
    const newFilters = { ...localFilters, [field]: value, page: 1 };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters); // Auto-apply filters
  };

  const handleReset = () => {
    const resetFilters: MatchFiltersType = {
      page: 1,
      limit: 10,
      sort: 'asc',
      sort_by: 'match_date',
      has_commentator: 'true', // Reset về default: chỉ hiển thị trận có bình luận viên
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  return (
    <div className="flex gap-3 items-end">
      {/* Search */}
      <div className="w-80">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          <Search className="w-4 h-4 inline mr-1" />
          Tìm kiếm
        </label>
        <Input
          value={localFilters.search || ''}
          onChange={(e) => handleInputChange('search', e.target.value || undefined)}
          placeholder="Tìm theo tên đội, giải đấu..."
          className="h-10"
        />
      </div>
      
      {/* Status Filter */}
      <div className="w-32">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Trạng thái
        </label>
        <Select
          value={localFilters.status || 'all'}
          onValueChange={(value) => handleInputChange('status', value === 'all' ? undefined : value as MatchStatus)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value={MatchStatus.SCHEDULED}>Đã lên lịch</SelectItem>
            <SelectItem value={MatchStatus.LIVE}>Đang diễn ra</SelectItem>
            <SelectItem value={MatchStatus.FINISHED}>Đã kết thúc</SelectItem>
            <SelectItem value={MatchStatus.CANCELLED}>Đã hủy</SelectItem>
            <SelectItem value={MatchStatus.NOT_STARTED}>Chưa bắt đầu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      <div className="w-32">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Loại
        </label>
        <Select
          value={localFilters.type || 'all'}
          onValueChange={(value) => handleInputChange('type', value === 'all' ? undefined : value as MatchType)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value={MatchType.LEAGUE}>Giải đấu</SelectItem>
            <SelectItem value={MatchType.CUP}>Cúp</SelectItem>
            <SelectItem value={MatchType.FRIENDLY}>Giao hữu</SelectItem>
            <SelectItem value={MatchType.CHAMPIONSHIP}>Championship</SelectItem>
            <SelectItem value={MatchType.INTERNATIONAL}>Quốc tế</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Filter */}
      <div className="w-40">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Ngày thi đấu
        </label>
        <Input
          type="date"
          value={localFilters.date ? localFilters.date.split('/').reverse().join('-') : ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              // Convert YYYY-MM-DD to DD/MM/YYYY
              const [year, month, day] = value.split('-');
              const formattedDate = `${day}/${month}/${year}`;
              handleInputChange('date', formattedDate);
            } else {
              handleInputChange('date', undefined);
            }
          }}
          className="h-10"
        />
      </div>

      {/* Featured Filter */}
      <div className="w-24">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Nổi bật
        </label>
        <Select
          value={localFilters.featured === undefined ? 'all' : localFilters.featured.toString()}
          onValueChange={(value) => handleInputChange('featured', value === 'all' ? undefined : value === 'true')}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Có</SelectItem>
            <SelectItem value="false">Không</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filter */}
      <div className="w-32">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Trạng thái
        </label>
        <Select
          value={localFilters.is_active === undefined ? 'all' : localFilters.is_active.toString()}
          onValueChange={(value) => handleInputChange('is_active', value === 'all' ? undefined : value === 'true')}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đang hoạt động</SelectItem>
            <SelectItem value="false">Đã dừng hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Commentator Filter */}
      <div className="w-40">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Bình luận viên
        </label>
        <Select
          value={localFilters.has_commentator === undefined ? 'all' : localFilters.has_commentator.toString()}
          onValueChange={(value) => handleInputChange('has_commentator', value === 'all' ? undefined : value === 'true')}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Có bình luận viên</SelectItem>
            <SelectItem value="false">Chưa có bình luận viên</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={handleReset}
          className="h-10 px-3 flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}

