'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Gift, 
  Calendar, 
  Clock, 
  UserPlus, 
  X,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { validateDisplayName, validatePhoneNumber, validateAddress } from '@/utils/auth.utils';

interface UserData {
  id: string;
  username: string;
  display_name?: string;
  email: string;
  phone_number?: string;
  address?: string;
  sms_verified: boolean;
  referral_code: string;
  points: number;
  createdAt?: string;
  updatedAt?: string;
  invited_by?: string;
}

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
}

export default function UserInfoModal({ isOpen, onClose, user }: UserInfoModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    phone_number: '',
    address: '',
    referral_code: '',
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        display_name: user.display_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        referral_code: user.referral_code || '',
      });
    }
  }, [user]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsEditing(false);
      onClose();
    }, 300);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validate display name
    const displayNameError = validateDisplayName(formData.display_name);
    if (displayNameError) {
      newErrors.display_name = displayNameError;
    }

    // Validate phone number
    const phoneError = validatePhoneNumber(formData.phone_number);
    if (phoneError) {
      newErrors.phone_number = phoneError;
    }

    // Validate address
    const addressError = validateAddress(formData.address);
    if (addressError) {
      newErrors.address = addressError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      // Validation failed, stay in edit mode
      return;
    }
    
    // TODO: Implement update logic
    setIsEditing(false);
  };

  // Handle edit toggle
  const handleEditToggle = () => {
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form data
    if (user) {
      setFormData({
        username: user.username || '',
        display_name: user.display_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        referral_code: user.referral_code || '',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-2xl mx-4 bg-gradient-to-br from-red-900 via-red-800 to-red-700 rounded-2xl shadow-2xl border border-yellow-400/30 transition-all duration-300 transform ${
        isClosing 
          ? 'opacity-0 scale-95 translate-y-4' 
          : 'opacity-100 scale-100 translate-y-0'
      }`}>
        
        {/* Header */}
        <div className="relative p-6 border-b border-yellow-400/30">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-yellow-400/20 rounded-full transition-colors duration-200 z-10"
          >
            <X className="w-5 h-5 text-yellow-400" />
          </button>
          
          {/* Title */}
          <div className="text-center pr-12">
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">
              Thông tin cá nhân
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-black/20 max-h-[80vh] overflow-y-auto">
          {/* Points Display */}
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-400 rounded-full p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-red-800" />
                <div className="text-center">
                  <p className="text-xs font-semibold text-red-800">Điểm số</p>
                  <p className="text-lg font-bold text-red-800">{user?.points || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-3">
                {/* Username */}
                <div className="space-y-1">
                  <label htmlFor="username" className="flex items-center text-xs font-medium text-yellow-400">
                    <User className="w-3 h-3 mr-1" />
                    Tên đăng nhập
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    placeholder="Tên đăng nhập"
                  />
                </div>

                {/* Display Name */}
                <div className="space-y-1">
                  <label htmlFor="display_name" className="flex items-center text-xs font-medium text-yellow-400">
                    <User className="w-3 h-3 mr-1" />
                    Tên hiển thị
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <input
                    id="display_name"
                    name="display_name"
                    type="text"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    placeholder="Tên hiển thị"
                  />
                  {errors.display_name && (
                    <p className="text-xs text-red-400" role="alert" aria-live="polite">
                      {errors.display_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="flex items-center text-xs font-medium text-yellow-400">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 cursor-not-allowed opacity-70 text-sm"
                    placeholder="Email"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label htmlFor="phone_number" className="flex items-center text-xs font-medium text-yellow-400">
                    <Phone className="w-3 h-3 mr-1" />
                    Số điện thoại
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    placeholder="0901234567 hoặc +84901234567"
                  />
                  {errors.phone_number && (
                    <p className="text-xs text-red-400" role="alert" aria-live="polite">
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label htmlFor="address" className="flex items-center text-xs font-medium text-yellow-400">
                    <MapPin className="w-3 h-3 mr-1" />
                    Địa chỉ
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    placeholder="Địa chỉ"
                  />
                  {errors.address && (
                    <p className="text-xs text-red-400" role="alert" aria-live="polite">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                {/* SMS Verification Status */}
                <div className="space-y-1">
                  <label className="flex items-center text-xs font-medium text-yellow-400">
                    <Shield className="w-3 h-3 mr-1" />
                    Xác thực SMS
                  </label>
                  <div className={`px-2 py-2 rounded-lg text-xs font-medium flex items-center space-x-1 ${
                    user?.sms_verified 
                      ? 'bg-green-900/50 border border-green-500/50 text-green-300' 
                      : 'bg-red-900/50 border border-red-500/50 text-red-300'
                  }`}>
                    {user?.sms_verified ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Đã xác thực</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Chưa xác thực</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Referral Code */}
                <div className="space-y-1">
                  <label htmlFor="referral_code" className="flex items-center text-xs font-medium text-yellow-400">
                    <Gift className="w-3 h-3 mr-1" />
                    Mã giới thiệu
                  </label>
                  <input
                    id="referral_code"
                    name="referral_code"
                    type="text"
                    value={formData.referral_code}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    placeholder="Mã giới thiệu"
                  />
                </div>

                {/* Created At */}
                <div className="space-y-1">
                  <label htmlFor="createdAt" className="flex items-center text-xs font-medium text-yellow-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Ngày tạo
                  </label>
                  <input
                    id="createdAt"
                    name="createdAt"
                    type="text"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : ''}
                    readOnly
                    className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 cursor-not-allowed opacity-70 text-xs"
                    placeholder="Ngày tạo"
                  />
                </div>

                {/* Updated At */}
                <div className="space-y-1">
                  <label htmlFor="updatedAt" className="flex items-center text-xs font-medium text-yellow-400">
                    <Clock className="w-3 h-3 mr-1" />
                    Cập nhật
                  </label>
                  <input
                    id="updatedAt"
                    name="updatedAt"
                    type="text"
                    value={user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : ''}
                    readOnly
                    className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 cursor-not-allowed opacity-70 text-xs"
                    placeholder="Cập nhật"
                  />
                </div>

                {/* Invited By */}
                <div className="space-y-1">
                  <label htmlFor="invited_by" className="flex items-center text-xs font-medium text-yellow-400">
                    <UserPlus className="w-3 h-3 mr-1" />
                    Mời bởi
                  </label>
                  <input
                    id="invited_by"
                    name="invited_by"
                    type="text"
                    value={user?.invited_by || 'Không có'}
                    readOnly
                    className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 cursor-not-allowed opacity-70 text-xs"
                    placeholder="Người mời"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-yellow-400/30">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="w-full py-2 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:brightness-110 text-red-800 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  Cập nhật thông tin cá nhân
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-2 px-4 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 font-medium text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:brightness-110 text-red-800 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                  >
                    Cập nhật
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
