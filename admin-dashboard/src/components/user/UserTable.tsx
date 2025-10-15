'use client';

import React, { useState } from 'react';
import { User, UserRole } from '@/types/user';
import { Users } from 'lucide-react';

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit?: number;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onUpdateRole: (userId: string, role: 'admin' | 'user' | 'caster') => void;
  onUpdatePoints?: (userId: string, points: number) => void;
  onVerifySms?: (userId: string) => void;
  loading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSortChange?: (field: keyof User, direction: 'asc' | 'desc') => void;
}

export default function UserTable({ 
  users, 
  onEdit, 
  onDelete, 
  onUpdateRole, 
  loading = false,
  pagination,
  onPageChange,
  onSortChange
}: UserTableProps) {
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof User) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    
    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    setSortField(field);
    setSortDirection(newDirection);
    
    // Notify parent component about sort change
    if (onSortChange) {
      onSortChange(field, newDirection);
    }
  };

  // Note: Sorting is now handled by the backend API, so we don't need client-side sorting
  // This is kept for backward compatibility but should be removed in future versions
  const sortedUsers = users;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (role: UserRole) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (role) {
      case UserRole.ADMIN:
        return `${baseClasses} bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-100`;
      case UserRole.STAFF:
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400`;
      case UserRole.CASTER:
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400`;
      case UserRole.USER:
      default:
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400`;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    return isActive 
      ? `${baseClasses} bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-100`
      : `${baseClasses} bg-gray-50 text-gray-900 dark:bg-gray-900/30 dark:text-gray-100`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  // Pagination component
  const PaginationComponent = () => {
    if (!pagination || !onPageChange || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, total } = pagination;
    const pages = [];
    
    // Generate page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('...');
      }
    }

    return (
      <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Hiển thị {((currentPage - 1) * (pagination.limit || 10)) + 1}-{Math.min(currentPage * (pagination.limit || 10), total)} trong tổng số {total} người dùng
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              color: 'var(--text-muted)', 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
              }
            }}
          >
            Trước
          </button>
          
          {pages.map((page, index) => (
            <button
              key={`page-${index}-${page}`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                page === currentPage
                  ? ''
                  : page === '...'
                  ? 'cursor-default'
                  : ''
              }`}
              style={page === currentPage ? {
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              } : page === '...' ? {
                color: 'var(--text-muted)'
              } : {
                color: 'var(--foreground)',
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => {
                if (page !== '...' && page !== currentPage) {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== '...' && page !== currentPage) {
                  e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                }
              }}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              color: 'var(--text-muted)', 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
              }
            }}
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{ backgroundColor: 'var(--muted)' }}>
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onClick={() => handleSort('username')}
              >
                Tên đăng nhập
                {sortField === 'username' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onClick={() => handleSort('email')}
              >
                Email
                {sortField === 'email' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onClick={() => handleSort('phone_number')}
              >
                Số điện thoại
                {sortField === 'phone_number' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onClick={() => handleSort('points')}
              >
                Điểm
                {sortField === 'points' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onClick={() => handleSort('role')}
              >
                Vai trò
                {sortField === 'role' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onClick={() => handleSort('sms_verified')}
              >
                SMS
                {sortField === 'sms_verified' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onClick={() => handleSort('is_active')}
              >
                Trạng thái
                {sortField === 'is_active' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onClick={() => handleSort('createdAt')}
              >
                Ngày tạo
                {sortField === 'createdAt' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-48" style={{ color: 'var(--text-muted)' }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--background)' }}>
            {sortedUsers.map((user, index) => {
              // Lấy ID từ user.id hoặc user._id
              const userId = user.id || user._id;
              return (
              <tr key={userId || `user-${index}`} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--background)';
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {user.display_name || user.username}
                  </div>
                  {user.display_name && (
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      @{user.username}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm" style={{ color: 'var(--foreground)' }}>{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm" style={{ color: 'var(--foreground)' }}>{user.phone_number || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm" style={{ color: 'var(--foreground)' }}>{user.points}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getRoleBadge(user.role)}>
                    {user.role === UserRole.ADMIN ? 'Admin' : user.role === UserRole.CASTER ? 'Caster' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(user.sms_verified)}>
                    {user.sms_verified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(user.is_active)}>
                    {user.is_active ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-48">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded-md text-xs font-medium transition-colors w-12"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => {
                        if (userId) {
                          // Gửi string 'admin' hoặc 'user' thay vì enum
                          const newRole = user.role === UserRole.ADMIN ? 'user' : 'admin';
                          onUpdateRole(userId, newRole);
                        }
                      }}
                      className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400 dark:hover:text-purple-300 px-2 py-1 rounded-md text-xs font-medium transition-colors w-12"
                    >
                      {user.role === UserRole.ADMIN ? 'Hạ' : 'Nâng'}
                    </button>
                    <button
                      onClick={() => {
                        if (userId) {
                          onDelete(userId);
                        }
                      }}
                      className="text-red-800 hover:text-red-900 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-100 dark:hover:text-red-200 px-2 py-1 rounded-md text-xs font-medium transition-colors w-12"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <Users className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">Không có người dùng nào</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc tạo người dùng mới</p>
          </div>
        </div>
      )}

      <PaginationComponent />
    </div>
  );
}
