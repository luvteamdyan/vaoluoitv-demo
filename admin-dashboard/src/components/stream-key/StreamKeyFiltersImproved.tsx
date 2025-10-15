'use client';

import { useState, useEffect } from 'react';
import { StreamKeyQueryDto } from '@/types/stream-key';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, List, Activity } from 'lucide-react';

interface StreamKeyFiltersProps {
  filters: StreamKeyQueryDto;
  onFiltersChange: (filters: StreamKeyQueryDto) => void;
  onReset: () => void;
  onCreateStreamKey: () => void;
}

export default function StreamKeyFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  onCreateStreamKey 
}: StreamKeyFiltersProps) {
  const [localFilters, setLocalFilters] = useState<StreamKeyQueryDto>(filters);

  // Đồng bộ localFilters với filters prop khi filters thay đổi
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field: keyof StreamKeyQueryDto, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [field]: value, page: 1 };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters); // Auto-apply filters
  };

  const handleReset = () => {
    const resetFilters: StreamKeyQueryDto = {
      page: 1,
      limit: 10,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            <Activity className="w-4 h-4 inline mr-1" />
            Trạng thái
          </label>
          <Select
            value={localFilters.status || 'all'}
            onValueChange={(value) => handleInputChange('status', value === 'all' ? undefined : value as 'active' | 'revoked')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent style={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="revoked">Đã thu hồi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Limit Filter */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            <List className="w-4 h-4 inline mr-1" />
            Hiển thị
          </label>
          <Select
            value={localFilters.limit?.toString() || '10'}
            onValueChange={(value) => handleInputChange('limit', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent style={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
