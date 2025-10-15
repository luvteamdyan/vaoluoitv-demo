'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { ApiError, ErrorHandler, ErrorType } from '@/utils/errorHandler';

interface ErrorToastProps {
  error: ApiError | null;
  onClose: () => void;
  onRetry?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function ErrorToast({
  error,
  onClose,
  onRetry,
  autoClose = true,
  autoCloseDelay = 5000,
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoClose && ErrorHandler.shouldShowErrorToast(error)) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    handleClose();
  };

  if (!error || !isVisible) {
    return null;
  }

  const errorColor = ErrorHandler.getErrorColor(error);
  const errorIcon = ErrorHandler.getErrorIcon(error);
  const isRetryable = ErrorHandler.isRetryableError(error);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <div
        className={`border rounded-lg shadow-lg p-4 transition-all duration-300 transform ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } ${errorColor}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-lg">
            {errorIcon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">
                {error.type === ErrorType.NETWORK_ERROR && 'Lỗi kết nối'}
                {error.type === ErrorType.SERVER_ERROR && 'Lỗi server'}
                {error.type === ErrorType.AUTHENTICATION_ERROR && 'Lỗi xác thực'}
                {error.type === ErrorType.AUTHORIZATION_ERROR && 'Không có quyền'}
                {error.type === ErrorType.VALIDATION_ERROR && 'Dữ liệu không hợp lệ'}
                {error.type === ErrorType.NOT_FOUND_ERROR && 'Không tìm thấy'}
                {error.type === ErrorType.TIMEOUT_ERROR && 'Hết thời gian chờ'}
                {error.type === ErrorType.UNKNOWN_ERROR && 'Lỗi không xác định'}
              </h4>
              
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-sm font-medium mt-1 leading-relaxed">
              {ErrorHandler.getErrorMessage(error)}
            </p>
            
            {isRetryable && onRetry && (
              <button
                onClick={handleRetry}
                className="mt-3 flex items-center gap-2 text-xs font-medium hover:underline"
              >
                <RefreshCw className="h-3 w-3" />
                Thử lại
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing error toast state
export function useErrorToast() {
  const [error, setError] = useState<ApiError | null>(null);

  const showError = (apiError: ApiError) => {
    setError(apiError);
  };

  const hideError = () => {
    setError(null);
  };

  const ErrorToastComponent = ({ onRetry }: { onRetry?: () => void }) => (
    <ErrorToast
      error={error}
      onClose={hideError}
      onRetry={onRetry}
    />
  );

  return {
    showError,
    hideError,
    ErrorToastComponent,
    hasError: !!error,
  };
}
