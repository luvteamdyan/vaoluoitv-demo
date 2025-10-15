'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, CreateUserRequest, UpdateUserRequest, UserFilters, UserRole } from '@/types/user';
import { userService } from '@/services/userService';
import UserFiltersComponent from '@/components/user/UserFilters';
import UserTable from '@/components/user/UserTable';
import UserForm from '@/components/user/UserForm';
import { useErrorToast } from '@/components/common/ErrorToast';
import { ErrorHandler } from '@/utils/errorHandler';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    sortOrder: 'desc', // Mặc định sắp xếp mới nhất trước
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [error, setError] = useState<string | null>(null);
  
  // Error toast hook
  const { showError, ErrorToastComponent } = useErrorToast();

  // Load users
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load users với filter cho table
      const response = await userService.searchUsers(filters);
      
      // Handle pagination response
      setUsers(response.users);
      setPagination({
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.page || 1,
        limit: response.limit || 10,
      });
    } catch (err) {
      const apiError = ErrorHandler.handleFetchError(err);
      setError(ErrorHandler.getErrorMessage(apiError));
      
      // Show error toast for retryable errors
      if (ErrorHandler.isRetryableError(apiError) && ErrorHandler.shouldShowErrorToast(apiError)) {
        showError(apiError);
      }
      
      // Handle authentication errors
      if (apiError.type === 'AUTHENTICATION_ERROR') {
        // Redirect to login or refresh token
        window.location.href = '/login';
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [filters]); // Remove showError from dependencies to prevent infinite loop


  useEffect(() => {
    loadData();
  }, [loadData]); // Depend on loadData function


  // Xử lý tạo user mới
  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      await userService.createUser(userData);
      setShowForm(false);
      await loadData(); // Reload data
    } catch (err) {
      const apiError = ErrorHandler.handleFetchError(err);
      setError(ErrorHandler.getErrorMessage(apiError));
      
      // Show error toast
      if (ErrorHandler.shouldShowErrorToast(apiError)) {
        showError(apiError);
      }
      
      throw err; // Re-throw để UserForm có thể xử lý
    }
  };

  // Xử lý cập nhật user
  const handleUpdateUser = async (userData: UpdateUserRequest) => {
    
    if (!editingUser) {
      return;
    }
    
    try {
      // Lấy ID từ user.id hoặc user._id
      const userId = editingUser.id || editingUser._id;
      
      if (!userId) {
        setError('Không tìm thấy ID người dùng');
        return;
      }
      
      // Gửi toàn bộ userData (bao gồm role) trong một request
      await userService.updateUser(userId, userData);
      
      setEditingUser(null);
      setShowForm(false);
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật user');
      throw err; // Re-throw để UserForm có thể xử lý
    }
  };

  // Xử lý xóa user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa user này?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa user');
    }
  };

  // Xử lý cập nhật role
  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'user' | 'caster') => {
    try {
      await userService.updateUserRole(userId, newRole);
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật role');
    }
  };

  // Xử lý cập nhật điểm
  const handleUpdatePoints = async (userId: string, points: number) => {
    try {
      await userService.updateUserPoints(userId, points);
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật điểm');
    }
  };

  // Xử lý xác thực SMS
  const handleVerifySms = async (userId: string) => {
    try {
      await userService.verifyUserSms(userId);
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác thực SMS');
    }
  };

  // Xử lý chỉnh sửa user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Xử lý hủy form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 })); // Reset về trang 1
  };

  // Xử lý reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortOrder: 'desc', // Reset về mặc định
    });
  };

  // Xử lý thay đổi filters
  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Xử lý thay đổi sort
  const handleSortChange = (field: keyof User, direction: 'asc' | 'desc') => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1, // Reset về trang 1 khi sort
      sortOrder: direction 
    }));
  };



  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          User Management
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Quản lý người dùng và phân quyền trong hệ thống
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg" style={{ 
          backgroundColor: 'var(--card-bg)', 
          border: '1px solid var(--destructive)',
          color: 'var(--destructive)'
        }}>
          <div className="flex items-center justify-between">
            <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{ color: 'var(--destructive)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            ×
          </button>
          </div>
        </div>
      )}


      {/* User Table with Integrated Filters */}
      <div className="rounded-2xl overflow-hidden" style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--border)' 
      }}>
        {/* Filters Header */}
        <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-end gap-4">
            <div className="flex-1">
      <UserFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)',
                border: '1px solid var(--primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
            >
              <Plus className="w-4 h-4" />
              Tạo User mới
            </button>
          </div>
        </div>
        
        {/* Table Content */}
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onUpdateRole={handleUpdateRole}
          onUpdatePoints={handleUpdatePoints}
          onVerifySms={handleVerifySms}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
        />
      </div>

      {/* User Form Modal */}
            <UserForm
              user={editingUser}
              onSubmit={editingUser ? 
                (userData: Record<string, string | boolean | number | UserRole>) => handleUpdateUser(userData as unknown as UpdateUserRequest) :
                (userData: Record<string, string | boolean | number | UserRole>) => handleCreateUser(userData as unknown as CreateUserRequest)
              }
              onCancel={handleCancelForm}
              loading={loading}
        open={showForm}
            />
      
      {/* Error Toast */}
      <ErrorToastComponent onRetry={loadData} />
    </div>
  );
}
