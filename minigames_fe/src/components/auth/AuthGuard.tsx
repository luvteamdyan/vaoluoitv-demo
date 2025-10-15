'use client';

import React, { useEffect, ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * AuthGuard Component
 * 
 * Protects routes and shows loading/redirect based on authentication status
 * - Shows loading spinner while waiting for auth
 * - Redirects to luck8event.com after 10s if no auth received
 * - Shows children when authenticated
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading, isPostMessageListening } = useAuth();

  useEffect(() => {
    // Redirect to luck8event.com after 10 seconds if no authentication
    // DISABLED FOR DEVELOPMENT - Không redirect khi đang test ở localhost
    const isDevelopment = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (isDevelopment) {
      console.log('[AuthGuard] Development mode - auto redirect disabled');
      return;
    }
    
    const redirectTimeout = setTimeout(() => {
      if (!isAuthenticated && !isLoading) {
        console.log('[AuthGuard] No authentication received, redirecting to luck8event.com');
        window.location.href = 'https://luck8event.com';
      }
    }, 10000);

    return () => clearTimeout(redirectTimeout);
  }, [isAuthenticated, isLoading]);

  // Show loading spinner while waiting for authentication
  if (isLoading || (!isAuthenticated && isPostMessageListening)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin">
              <svg 
                className="h-16 w-16 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Đang xác thực...
          </h1>
          
          <p className="text-gray-600 mb-6">
            Vui lòng đợi trong khi chúng tôi xác thực tài khoản của bạn
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show fallback if not authenticated and not loading
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <div className="mb-4">
            <svg 
              className="h-16 w-16 text-red-600 mx-auto" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Xác thực thất bại
          </h1>
          
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập trên luck8event.com để tiếp tục
          </p>
          
          <button
            onClick={() => {
              // DISABLED FOR DEVELOPMENT - Không redirect khi đang test ở localhost
              const isDevelopment = typeof window !== 'undefined' && 
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
              
              if (!isDevelopment) {
                window.location.href = 'https://luck8event.com';
              } else {
                console.log('[AuthGuard] Development mode - manual redirect disabled');
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Quay lại luck8event.com
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated, show children
  return <>{children}</>;
};

export default AuthGuard;
