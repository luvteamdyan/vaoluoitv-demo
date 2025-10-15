'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: Record<string, string | boolean | number | UserRole>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  open?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, loading = false, open = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    sms_verified: false,
    points: 0,
    referral_code: '',
    invited_by: '',
    role: UserRole.USER,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        display_name: user.display_name || '',
        full_name: user.full_name || '',
        email: user.email,
        password: '', // Không hiển thị password cũ
        phone_number: user.phone_number || '',
        address: user.address || '',
        sms_verified: user.sms_verified,
        points: user.points,
        referral_code: user.referral_code,
        invited_by: user.invited_by || '',
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Bỏ validation phone number để tránh lỗi backend
    // if (formData.phone_number && !/^\+84[0-9]{9,10}$/.test(formData.phone_number)) {
    //   newErrors.phone_number = 'Số điện thoại không đúng định dạng';
    // }

    if (formData.points < 0) {
      newErrors.points = 'Điểm không được âm';
    }

    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = isEditMode 
        ? {
            username: formData.username,
            ...(formData.display_name && { display_name: formData.display_name }),
            email: formData.email,
            ...(formData.phone_number && { phone_number: formData.phone_number }),
            ...(formData.address && { address: formData.address }),
            sms_verified: formData.sms_verified,
            points: formData.points,
            referral_code: formData.referral_code,
            ...(formData.invited_by && { invited_by: formData.invited_by }),
            is_active: formData.is_active,
            role: formData.role, // Gửi role để check xem có thay đổi không
            ...(formData.password && { password: formData.password }),
          }
        : {
            username: formData.username,
            ...(formData.display_name && { display_name: formData.display_name }),
            email: formData.email,
            password: formData.password,
            ...(formData.phone_number && { phone_number: formData.phone_number }),
            ...(formData.address && { address: formData.address }),
            sms_verified: formData.sms_verified,
            points: formData.points,
            referral_code: formData.referral_code,
            ...(formData.invited_by && { invited_by: formData.invited_by }),
            role: formData.role,
            is_active: formData.is_active,
          };

      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? 'Chỉnh sửa User' : 'Tạo User mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Cập nhật thông tin người dùng' : 'Thêm người dùng mới vào hệ thống'}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Tên đăng nhập *
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.username ? 'border-red-500' : 'border-[var(--sidebar-border)]'
            }`}
            placeholder="Nhập tên đăng nhập"
          />
          {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Tên hiển thị
          </label>
          <input
            type="text"
            id="display_name"
            value={formData.display_name}
            onChange={(e) => handleInputChange('display_name', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            placeholder="Nhập tên hiển thị (tùy chọn)"
          />
        </div>

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Họ và tên đầy đủ
          </label>
          <input
            type="text"
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            placeholder="Nhập họ và tên đầy đủ (tùy chọn)"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.email ? 'border-red-500' : 'border-[var(--sidebar-border)]'
            }`}
            placeholder="Nhập email"
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Mật khẩu {!isEditMode && '*'}
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.password ? 'border-red-500' : 'border-[var(--sidebar-border)]'
            }`}
            placeholder={isEditMode ? "Để trống nếu không muốn thay đổi" : "Nhập mật khẩu"}
          />
          {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Số điện thoại
          </label>
          <input
            type="tel"
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.phone_number ? 'border-red-500' : 'border-[var(--sidebar-border)]'
            }`}
            placeholder="+84901234567"
          />
          {errors.phone_number && <p className="mt-1 text-sm text-red-400">{errors.phone_number}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Địa chỉ
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.address ? 'border-red-500' : 'border-[var(--sidebar-border)]'
            }`}
            placeholder="Nhập địa chỉ"
            rows={3}
          />
          {errors.address && <p className="mt-1 text-sm text-red-400">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="points" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Điểm
          </label>
          <input
            type="number"
            id="points"
            value={formData.points}
            onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.points ? 'border-red-500' : 'border-[var(--sidebar-border)]'
            }`}
            placeholder="0"
            min="0"
          />
          {errors.points && <p className="mt-1 text-sm text-red-400">{errors.points}</p>}
        </div>

        <div>
          <label htmlFor="referral_code" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Mã giới thiệu
          </label>
          <input
            type="text"
            id="referral_code"
            value={formData.referral_code}
            onChange={(e) => handleInputChange('referral_code', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.referral_code ? 'border-red-500' : 'border-[var(--sidebar-border)]'
            }`}
            placeholder="VNLZHX0W"
            maxLength={8}
          />
          {errors.referral_code && <p className="mt-1 text-sm text-red-400">{errors.referral_code}</p>}
        </div>

        <div>
          <label htmlFor="invited_by" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Mã người mời
          </label>
          <input
            type="text"
            id="invited_by"
            value={formData.invited_by}
            onChange={(e) => handleInputChange('invited_by', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.invited_by ? 'border-red-500' : 'border-[var(--sidebar-border)]'
            }`}
            placeholder="VNLZHX0W"
            maxLength={8}
          />
          {errors.invited_by && <p className="mt-1 text-sm text-red-400">{errors.invited_by}</p>}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Vai trò
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
            className="w-full px-3 py-2 border border-[var(--sidebar-border)] bg-[var(--background)] text-[var(--foreground)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
          >
            <option value={UserRole.USER} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>User</option>
            <option value={UserRole.CASTER} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Caster</option>
            <option value={UserRole.STAFF} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Staff</option>
            <option value={UserRole.ADMIN} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Admin</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="sms_verified"
            checked={formData.sms_verified}
            onChange={(e) => handleInputChange('sms_verified', e.target.checked)}
            className="h-4 w-4 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--sidebar-border)] rounded bg-[var(--background)]"
          />
          <label htmlFor="sms_verified" className="ml-2 block text-sm text-[var(--foreground)]">
            Xác thực SMS
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleInputChange('is_active', e.target.checked)}
            className="h-4 w-4 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--sidebar-border)] rounded bg-[var(--background)]"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-[var(--foreground)]">
            Kích hoạt tài khoản
          </label>
        </div>

        </form>

        <DialogFooter className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={isSubmitting || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
