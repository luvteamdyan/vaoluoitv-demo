'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { EmailField, NameField, DisplayNameField, PhoneField, AddressField, ReferralCodeField } from '@/components/forms/FormField';
import { AuthMode, LoginFormData, RegisterFormData, ValidationError } from '@/types/auth';
import { LoginRequest, RegisterRequest } from '@/types/user';
import { validateRegisterForm } from '@/utils/auth.utils';
import Logo from '@/app/favicon.ico';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError>({});
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);


  // Form data
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    username: '',
    display_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    address: '',
    referral_code: '',
  });

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrors({});
      setShakeFields(new Set());
      setShowPassword(false);
      setShowConfirmPassword(false);
      setLoginData({ email: '', password: '' });
      setRegisterData({ 
        username: '', 
        display_name: '', 
        email: '', 
        password: '', 
        confirmPassword: '',
        phone_number: '', 
        address: '', 
        referral_code: '' 
      });
      setIsClosing(false);
      setIsTransitioning(false);
    }
  }, [isOpen, initialMode]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (mode === 'login') {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email là bắt buộc';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email không hợp lệ';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Mật khẩu là bắt buộc';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};
    const newShakeFields = new Set<string>();

    if (mode === 'login') {
      const emailError = validateEmail(loginData.email);
      const passwordError = validatePassword(loginData.password);

      if (emailError) {
        newErrors.email = emailError;
        newShakeFields.add('email');
      }
      if (passwordError) {
        newErrors.password = passwordError;
        newShakeFields.add('password');
      }
    } else {
      // Use centralized validation function for register form
      const registerErrors = validateRegisterForm(registerData);
      Object.assign(newErrors, registerErrors);
      Object.keys(registerErrors).forEach(field => newShakeFields.add(field));
    }

    setErrors(newErrors);
    setShakeFields(newShakeFields);

    // Clear shake animation after delay
    if (newShakeFields.size > 0) {
      setTimeout(() => setShakeFields(new Set()), 500);
    }

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    

    try {
      if (mode === 'login') {
        const loginRequest: LoginRequest = {
          email: loginData.email,
          password: loginData.password,
        };

        const response = await authService.login(loginRequest);
        login(response.user);
        onClose();
      } else {
        const registerRequest: RegisterRequest = {
          username: registerData.username,
          display_name: registerData.display_name,
          email: registerData.email,
          password: registerData.password,
          phone_number: registerData.phone_number,
          address: registerData.address,
          referral_code: registerData.referral_code,
        };

        await authService.register(registerRequest);
        // Switch to login mode after successful registration
        setMode('login');
        setLoginData({ email: registerData.email, password: '' });
        setErrors({ success: 'Đăng ký thành công! Vui lòng đăng nhập.' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // Xử lý lỗi từ webhook và backend - sử dụng message trực tiếp
      let errorMessage = 'Có lỗi xảy ra';
      const fieldErrors: ValidationError = {};
      
      if (error instanceof Error) {
        const message = error.message;
        
        // Kiểm tra xem có phải lỗi field-specific không
        if (message.includes(':')) {
          // Format: "field_name: error message"
          const [fieldName, ...errorParts] = message.split(':');
          const fieldError = errorParts.join(':').trim();
          
          // Map field name từ backend sang frontend
          const fieldMapping: { [key: string]: string } = {
            'phone_number': 'phone_number',
            'email': 'email', 
            'username': 'username',
            'password': 'password',
            'display_name': 'display_name',
            'address': 'address',
            'referral_code': 'referral_code'
          };
          
          const mappedField = fieldMapping[fieldName.trim()];
          if (mappedField) {
            fieldErrors[mappedField] = fieldError;
          } else {
            // Nếu không map được field, hiển thị như general error
            errorMessage = message;
          }
        } else {
          // Sử dụng message trực tiếp cho general errors
          errorMessage = message;
        }

        // Nếu có field errors, hiển thị ở field cụ thể
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setShakeFields(new Set(Object.keys(fieldErrors)));
          // Clear shake animation after delay
          setTimeout(() => setShakeFields(new Set()), 500);
          return;
        }
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mode switch with animation
  const switchMode = (newMode: AuthMode) => {
    setIsTransitioning(true);
    
    // First phase: collapse current form
    setTimeout(() => {
      setMode(newMode);
      setErrors({});
      setShakeFields(new Set());
      
      // Clear form data when switching modes
      if (newMode === 'login') {
        setLoginData({ email: registerData.email, password: '' });
      } else {
        setRegisterData({ 
          username: '', 
          display_name: '', 
          email: loginData.email, 
          password: '', 
          confirmPassword: '',
          phone_number: '', 
          address: '', 
          referral_code: '' 
        });
      }
      
      // Second phase: expand new form
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 200);
  };

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md lg:max-w-lg mx-auto bg-black to-red-700 rounded-2xl shadow-2xl transition-all duration-300 transform max-h-[90vh] overflow-hidden flex flex-col ${
        isClosing 
          ? 'opacity-0 scale-95 translate-y-4' 
          : 'opacity-100 scale-100 translate-y-0'
      }`}>
        {/* Header - Sticky */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-red-900 via-red-700 to-red-900 p-3 sm:p-4 text-white border-t-3 border-red-600 rounded-t-2xl flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-full transition-colors duration-200 z-10 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <h2 className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
            }`}>
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </h2>
            <p className={`text-red-100 text-sm sm:text-base transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
            }`}>
              {mode === 'login' 
                ? 'Chào mừng bạn quay trở lại!' 
                : 'Tạo tài khoản mới để trải nghiệm'
              }
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-dark to-red-700 rounded-b-2xl">
          <form onSubmit={handleSubmit} className={`relative p-4 sm:p-6 space-y-2 sm:space-y-3 transition-all duration-300 min-h-full pb-20 ${
            isTransitioning ? 'animate-slide-down' : 'animate-slide-up'
          }`}>
          {/* Background Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none" style={{ transform: 'translateY(-35px)' }}>
            <img
              src={Logo.src}
              alt="VaoluoiTV Logo"
              width={200}
              height={200}
              className="object-contain sm:w-[300px] sm:h-[300px]"
            />
          </div>
          {/* Success message */}
          {errors.success && (
            <div className="relative z-10 p-3 sm:p-4 bg-green-900/50 border border-green-500/50 rounded-lg animate-fade-in">
              <p className="text-green-300 text-xs sm:text-sm">{errors.success}</p>
            </div>
          )}

          {/* General error */}
          {errors.general && (
            <div className="relative z-10 p-3 sm:p-4 bg-red-900/50 border border-red-500/50 rounded-lg animate-fade-in">
              <p className="text-red-300 text-xs sm:text-sm">{errors.general}</p>
            </div>
          )}


          {/* Username field (register only) */}
          {mode === 'register' && (
            <div className={`relative z-10 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
            }`} style={{ transitionDelay: isTransitioning ? '0ms' : '100ms' }}>
              <NameField
                name="username"
                value={registerData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên người dùng"
                error={errors.username}
                shouldShake={shakeFields.has('username')}
              />
            </div>
          )}

          {/* Display Name field (register only) */}
          {mode === 'register' && (
            <div className={`relative z-10 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
            }`} style={{ transitionDelay: isTransitioning ? '0ms' : '120ms' }}>
              <DisplayNameField
                name="display_name"
                value={registerData.display_name}
                onChange={handleInputChange}
                placeholder="Nhập tên hiển thị"
                error={errors.display_name}
                shouldShake={shakeFields.has('display_name')}
              />
            </div>
          )}

          {/* Email field */}
          <div className={`relative z-10 transition-all duration-300 ${
            isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
          }`} style={{ transitionDelay: isTransitioning ? '0ms' : '150ms' }}>
            <EmailField
              name="email"
              value={mode === 'login' ? loginData.email : registerData.email}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ email"
              error={errors.email}
              shouldShake={shakeFields.has('email')}
            />
          </div>

          {/* Password field */}
          <div className={`relative z-10 transition-all duration-300 ${
            isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
          }`} style={{ transitionDelay: isTransitioning ? '0ms' : '200ms' }}>
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-300">
                Mật khẩu
                <span className="text-red-500 ml-1" aria-label="required">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={mode === 'login' ? loginData.password : registerData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  autoComplete={mode === 'login' ? "current-password" : "new-password"}
                  className={`
                    w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 bg-black/50 border rounded-lg shadow-sm text-white text-sm sm:text-base
                    focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 
                    transition-all duration-200
                    ${errors.password 
                      ? 'border-red-500 placeholder-red-400' 
                      : 'border-gray-600 placeholder-gray-400'
                    }
                    ${shakeFields.has('password') ? 'animate-shake' : ''}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors duration-200 cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs sm:text-sm text-red-400" role="alert" aria-live="polite">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Confirm password field (register only) */}
          {mode === 'register' && (
            <div className={`relative z-10 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
            }`} style={{ transitionDelay: isTransitioning ? '0ms' : '250ms' }}>
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-300">
                  Xác nhận mật khẩu
                  <span className="text-red-500 ml-1" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Xác nhận mật khẩu"
                    autoComplete="new-password"
                    className={`
                      w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 bg-black/50 border rounded-lg shadow-sm text-white text-sm sm:text-base
                      focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 
                      transition-all duration-200
                      ${errors.confirmPassword 
                        ? 'border-red-500 placeholder-red-400' 
                        : 'border-gray-600 placeholder-gray-400'
                      }
                      ${shakeFields.has('confirmPassword') ? 'animate-shake' : ''}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs sm:text-sm text-red-400" role="alert" aria-live="polite">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Phone Number field (register only) */}
          {mode === 'register' && (
            <div className={`relative z-10 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
            }`} style={{ transitionDelay: isTransitioning ? '0ms' : '280ms' }}>
              <PhoneField
                name="phone_number"
                value={registerData.phone_number}
                onChange={handleInputChange}
                error={errors.phone_number}
                shouldShake={shakeFields.has('phone_number')}
              />
            </div>
          )}

          {/* Address field (register only) */}
          {mode === 'register' && (
            <div className={`relative z-10 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
            }`} style={{ transitionDelay: isTransitioning ? '0ms' : '300ms' }}>
              <AddressField
                name="address"
                value={registerData.address}
                onChange={handleInputChange}
                error={errors.address}
                shouldShake={shakeFields.has('address')}
              />
            </div>
          )}

          {/* Referral Code field (register only) */}
          {mode === 'register' && (
            <div className={`relative z-10 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
            }`} style={{ transitionDelay: isTransitioning ? '0ms' : '320ms' }}>
              <ReferralCodeField
                name="referral_code"
                value={registerData.referral_code}
                onChange={handleInputChange}
                error={errors.referral_code}
                shouldShake={shakeFields.has('referral_code')}
              />
            </div>
          )}

          {/* Sticky Bottom Section */}
          <div className={`sticky bottom-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 pb-2 ${
            mode === 'register' 
              ? 'bg-gradient-to-t from-black/95 via-red-700/95 to-transparent backdrop-blur-sm border-t border-gray-600/50' 
              : ''
          }`}>
            {/* Submit button */}
            <div className={`transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
            }`} style={{ transitionDelay: isTransitioning ? '0ms' : '300ms' }}>
              <button
                type="submit"
                disabled={isLoading}
                className={`cursor-pointer w-full py-2 sm:py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base ${
                  isLoading ? 'animate-pulse' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  mode === 'login' ? 'Đăng nhập' : 'Đăng ký'
                )}
              </button>
            </div>

            {/* Mode switch */}
            <div className="text-center pt-3 sm:pt-4 transition-all duration-300">
              <p className="text-gray-300 text-xs sm:text-sm">
                {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="ml-2 text-yellow-400 hover:text-yellow-300 cursor-pointer font-medium transition-all duration-200 hover:underline hover:scale-102"
                >
                  {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </p>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
