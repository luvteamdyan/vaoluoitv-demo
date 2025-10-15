'use client';

import { useState } from 'react';
import { ProfileFormData, ProfileFormErrors } from '@/hooks/useProfileForm';
import { User, Mail, Phone, MapPin, Coins, CheckCircle, Gift, Calendar, Clock, UserPlus } from 'lucide-react';

interface ProfileFormProps {
  formData: ProfileFormData;
  errors: ProfileFormErrors;
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneBlur: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  validateForm: () => boolean;
}

export default function ProfileForm({
  formData,
  errors,
  loading,
  onInputChange,
  onPhoneBlur,
  onSubmit,
  onReset,
  validateForm,
}: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(true);
    setShowSuccessMessage(false); // Hide success message when starting to edit
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowSuccessMessage(false);
    onReset(); // Reset form data to original values
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      // Validation failed, stay in edit mode
      return;
    }
    
    try {
      await onSubmit(e);
      // If we reach here, submit was successful
      setIsEditing(false);
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      // Stay in edit mode if there's an error or validation fails
      console.error('Submit failed:', error);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(100vh-300px)] overflow-hidden">
      {/* Points Section */}
      <div className="flex items-center justify-center mb-4 flex-shrink-0">
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg w-full py-1">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Coins className="w-4 h-4 text-yellow-300 mr-2" />
              <p className="text-sm text-yellow-300 font-semibold">Điểm số</p>
            </div>
            <p className="text-xl font-bold text-yellow-400">{formData.points || 0}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Thông tin cơ bản</h3>
          
          {/* Username and Display Name Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Username Field - Read Only */}
            <div className="space-y-2">
              <label htmlFor="username" className="flex items-center text-sm font-medium text-gray-300">
                <User className="w-4 h-4 mr-2" />
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                readOnly
                className={`w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 cursor-not-allowed text-sm transition-all duration-300 ${
                  isEditing 
                    ? 'bg-gray-700/30 opacity-40' 
                    : 'bg-black/50 opacity-100'
                }`}
                placeholder="Tên đăng nhập sẽ hiển thị ở đây"
              />
            </div>

            {/* Display Name Field */}
            <div className="space-y-2">
              <label htmlFor="display_name" className="flex items-center text-sm font-medium text-gray-300">
                <User className="w-4 h-4 mr-2" />
                Tên hiển thị
                <span className="text-red-500 ml-1" aria-label="required">*</span>
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                value={formData.display_name}
                onChange={onInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm text-white placeholder-gray-400 transition-all duration-200 text-sm ${
                  isEditing
                    ? 'bg-black/50 border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
                    : 'bg-black/50 border-gray-600 cursor-not-allowed'
                }`}
                placeholder="Nhập tên hiển thị"
              />
              {errors.display_name && (
                <p className="text-xs text-red-400" role="alert" aria-live="polite">
                  {errors.display_name}
                </p>
              )}
            </div>
          </div>

          {/* Email Field - Read Only */}
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-300">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              readOnly
              className={`w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 cursor-not-allowed text-sm transition-all duration-300 ${
                isEditing 
                  ? 'bg-gray-700/30 opacity-40' 
                  : 'bg-black/50 opacity-100'
              }`}
              placeholder="Email sẽ hiển thị ở đây"
            />
          </div>

          {/* Phone Field - Editable */}
          <div className="space-y-2">
            <label htmlFor="phone_number" className="flex items-center text-sm font-medium text-gray-300">
              <Phone className="w-4 h-4 mr-2" />
              Số điện thoại
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            </label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={onInputChange}
              onBlur={onPhoneBlur}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm text-white placeholder-gray-400 transition-all duration-200 text-sm ${
                isEditing
                  ? 'bg-black/50 border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
                  : 'bg-black/50 border-gray-600 cursor-not-allowed'
              }`}
              placeholder="Nhập số điện thoại (0901234567 hoặc +84901234567)"
            />
            {errors.phone_number && (
              <p className="text-xs text-red-400" role="alert" aria-live="polite">
                {errors.phone_number}
              </p>
            )}
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <label htmlFor="address" className="flex items-center text-sm font-medium text-gray-300">
              <MapPin className="w-4 h-4 mr-2" />
              Địa chỉ
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={onInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm text-white placeholder-gray-400 transition-all duration-200 text-sm ${
                isEditing
                  ? 'bg-black/50 border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
                  : 'bg-black/50 border-gray-600 cursor-not-allowed'
              }`}
              placeholder="Nhập địa chỉ"
            />
            {errors.address && (
              <p className="text-xs text-red-400" role="alert" aria-live="polite">
                {errors.address}
              </p>
            )}
          </div>
        </div>


        {/* Account Info Section - Hidden when editing */}
        <div className={`space-y-4 transition-all duration-500 ease-in-out overflow-hidden ${
          isEditing 
            ? 'max-h-0 opacity-0 -mt-4' 
            : 'max-h-[1000px] opacity-100 mt-0'
        }`}>
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Thông tin tài khoản</h3>
          
          {/* Referral Code */}
          <div className="space-y-2">
            <label htmlFor="referral_code" className="flex items-center text-sm font-medium text-gray-300">
              <Gift className="w-4 h-4 mr-2" />
              Mã giới thiệu
            </label>
            <input
              id="referral_code"
              name="referral_code"
              type="text"
              value={formData.referral_code}
              readOnly
              className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 cursor-not-allowed bg-black/50 text-sm"
              placeholder="Mã giới thiệu sẽ hiển thị ở đây"
            />
          </div>

          {/* Created At and Updated At Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Created At */}
            <div className="space-y-2">
              <label htmlFor="createdAt" className="flex items-center text-sm font-medium text-gray-300">
                <Calendar className="w-4 h-4 mr-2" />
                Ngày tạo tài khoản
              </label>
              <input
                id="createdAt"
                name="createdAt"
                type="text"
                value={formData.createdAt ? new Date(formData.createdAt).toLocaleString('vi-VN') : ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 cursor-not-allowed bg-black/50 text-sm"
                placeholder="Ngày tạo sẽ hiển thị ở đây"
              />
            </div>

            {/* Updated At */}
            <div className="space-y-2">
              <label htmlFor="updatedAt" className="flex items-center text-sm font-medium text-gray-300">
                <Clock className="w-4 h-4 mr-2" />
                Lần cập nhật cuối
              </label>
              <input
                id="updatedAt"
                name="updatedAt"
                type="text"
                value={formData.updatedAt ? new Date(formData.updatedAt).toLocaleString('vi-VN') : ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 cursor-not-allowed bg-black/50 text-sm"
                placeholder="Lần cập nhật cuối sẽ hiển thị ở đây"
              />
            </div>
          </div>

          {/* Invited By */}
          <div className="space-y-2">
            <label htmlFor="invited_by" className="flex items-center text-sm font-medium text-gray-300">
              <UserPlus className="w-4 h-4 mr-2" />
              Được mời bởi
            </label>
            <input
              id="invited_by"
              name="invited_by"
              type="text"
              value={formData.invited_by || 'Không có'}
              readOnly
              className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 cursor-not-allowed bg-black/50 text-sm"
              placeholder="Người mời sẽ hiển thị ở đây"
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-700">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="p-3 bg-green-900/50 border border-green-500/50 rounded-lg animate-fade-in mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-green-300 text-sm">Cập nhật thông tin thành công!</p>
            </div>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg animate-fade-in mb-4">
            <p className="text-red-300 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isEditing ? (
            // Single button when not editing
            <button
              type="button"
              onClick={handleEditToggle}
              className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-102 text-sm"
            >
              Cập nhật thông tin cá nhân
            </button>
          ) : (
            // Two buttons when editing
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 px-4 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm ${
                  loading ? 'animate-pulse' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang cập nhật...</span>
                  </div>
                ) : (
                  'Cập nhật'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}