'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileForm from '@/components/forms/ProfileForm';
import { useProfileForm } from '@/hooks/useProfileForm';
import Logo from '@/app/favicon.ico';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePopup({ isOpen, onClose }: ProfilePopupProps) {
  const { user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);
  const {
    formData,
    loading,
    errors,
    handleInputChange,
    handlePhoneBlur,
    handleSubmit,
    resetForm,
    validateForm,
  } = useProfileForm(user);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSubmit();
      // Don't close popup, just let the form handle success state
    } catch (error) {
      // Don't close popup if there's an error or validation fails
      console.error('Form submit failed:', error);
    }
  };

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 300);
  }, [onClose, resetForm]);

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

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 bg-black to-red-700 rounded-2xl shadow-2xl transition-all duration-300 transform ${
        isClosing 
          ? 'opacity-0 scale-95 translate-y-4' 
          : 'opacity-100 scale-100 translate-y-0'
      }`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-900 via-red-700 to-red-900 p-4 text-white border-t-3 border-red-600 rounded-t-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors duration-200 z-10 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              Thông tin cá nhân
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="relative p-6 space-y-6 bg-gradient-to-br from-dark to-red-700 rounded-b-2xl">
          {/* Background Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none" style={{ transform: 'translateY(-35px)' }}>
            <img
              src={Logo.src}
              alt="VaoluoiTV Logo"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>

          {/* Profile Form */}
          <div className="relative z-10">
            <ProfileForm
              formData={formData}
              errors={errors}
              loading={loading}
              onInputChange={handleInputChange}
              onPhoneBlur={handlePhoneBlur}
              onSubmit={handleFormSubmit}
              onReset={resetForm}
              validateForm={validateForm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}