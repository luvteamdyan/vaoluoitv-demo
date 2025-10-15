'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, UserFilters as UserFiltersType } from '@/types/user';
import { Search, Users, Activity, List, ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onSearch?: () => void;
  onReset: () => void;
}

export default function UserFilters({ 
  filters, 
  onFiltersChange, 
  onSearch,
  onReset 
}: UserFiltersProps) {
  const [searchInput, setSearchInput] = useState<string>(filters.search || '');

  // Sync searchInput với filters từ parent
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters]);

  const handleInputChange = (field: keyof UserFiltersType, value: string | boolean | number | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  // Handler riêng cho search input (chỉ update local state)
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  // Handler cho search khi nhấn Enter
  const handleSearchSubmit = () => {
    onFiltersChange({
      ...filters,
      search: searchInput || undefined,
    });
  };

  // Handler cho Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Search */}
      <div className="flex-1 min-w-0">
        <label htmlFor="search" className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
          <Search className="w-4 h-4" />
          Tìm kiếm
        </label>
        <input
          type="text"
          id="search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full h-12 inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ 
            backgroundColor: 'var(--input)', 
            color: 'var(--foreground)',
            border: '1px solid var(--border)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--input)';
          }}
          placeholder="Username, email..."
        />
      </div>

      {/* Role Filter */}
      <div className="w-32">
        <label className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
          <Users className="w-4 h-4" />
          Vai trò
        </label>
        <Select
          value={filters.role || 'all'}
          onValueChange={(value) => handleInputChange('role', value === 'all' ? undefined : value as UserRole)}
        >
          <SelectTrigger className="w-full h-12" style={{ 
            backgroundColor: 'var(--input)', 
            color: 'var(--foreground)',
            border: '1px solid var(--border)'
          }}>
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
            <SelectItem value={UserRole.CASTER}>Caster</SelectItem>
            <SelectItem value={UserRole.USER}>User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="w-32">
        <label className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
          <Activity className="w-4 h-4" />
          Trạng thái
        </label>
        <Select
          value={filters.is_active === undefined ? 'all' : filters.is_active.toString()}
          onValueChange={(value) => {
            handleInputChange('is_active', value === 'all' ? undefined : value === 'true');
          }}
        >
          <SelectTrigger className="w-full h-12" style={{ 
            backgroundColor: 'var(--input)', 
            color: 'var(--foreground)',
            border: '1px solid var(--border)'
          }}>
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Hoạt động</SelectItem>
            <SelectItem value="false">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="w-32">
        <label className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
          <ArrowUpDown className="w-4 h-4" />
          Sắp xếp
        </label>
        <Select
          value={filters.sortOrder || 'desc'}
          onValueChange={(value) => handleInputChange('sortOrder', value as 'asc' | 'desc')}
        >
          <SelectTrigger className="w-full h-12" style={{ 
            backgroundColor: 'var(--input)', 
            color: 'var(--foreground)',
            border: '1px solid var(--border)'
          }}>
            <SelectValue placeholder="Mới nhất" />
          </SelectTrigger>
          <SelectContent style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <SelectItem value="desc">Mới nhất</SelectItem>
            <SelectItem value="asc">Cũ nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Limit */}
      <div className="w-24">
        <label className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
          <List className="w-4 h-4" />
          Hiển thị
        </label>
        <Select
          value={filters.limit?.toString() || '10'}
          onValueChange={(value) => handleInputChange('limit', parseInt(value))}
        >
          <SelectTrigger className="w-full h-12" style={{ 
            backgroundColor: 'var(--input)', 
            color: 'var(--foreground)',
            border: '1px solid var(--border)'
          }}>
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border)' 
          }}>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <div className="flex flex-col">
        <div className="h-5 mb-1"></div>
        <button
          onClick={onReset}
          className="h-12 inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ 
            backgroundColor: 'var(--secondary)', 
            color: 'var(--secondary-foreground)',
            border: '1px solid var(--border)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--secondary)';
          }}
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
}
