'use client';

import { useState } from 'react';
import { LoginRequest } from '@/types/auth';
import { AlertTriangle, XCircle } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Partial<LoginRequest>>({});

  const validateForm = (): boolean => {
    const errors: Partial<LoginRequest> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch {
      // Error được handle bởi parent component
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error khi user bắt đầu nhập
    if (validationErrors[name as keyof LoginRequest]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-[var(--foreground)] mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-[var(--card-bg)] text-gray-900 dark:text-[var(--foreground)] placeholder-gray-500 dark:placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
            validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-400'
          }`}
          placeholder="Nhập email của bạn"
          disabled={isLoading}
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-[var(--foreground)] mb-2">
          Mật khẩu
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-[var(--card-bg)] text-gray-900 dark:text-[var(--foreground)] placeholder-gray-500 dark:placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
            validationErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-400'
          }`}
          placeholder="Nhập mật khẩu của bạn"
          disabled={isLoading}
        />
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`rounded-lg p-4 ${
          error.includes('Admin') 
            ? 'bg-orange-50 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20' 
            : 'bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
        }`}>
          <div className="flex items-center">
            <div className={`w-5 h-5 mr-3 ${
              error.includes('Admin') ? 'text-orange-600 dark:text-orange-500' : 'text-red-600 dark:text-red-500'
            }`}>
              {error.includes('Admin') ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <p className={`text-sm font-medium ${
              error.includes('Admin') ? 'text-orange-600 dark:text-orange-500' : 'text-red-600 dark:text-red-500'
            }`}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[var(--accent)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--accent)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Đang đăng nhập...
          </div>
        ) : (
          'Đăng nhập'
        )}
      </button>
    </form>
  );
}
