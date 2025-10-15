'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from '@/types/user';
import { authService } from '@/services/authService';
import { setUserData } from '@/utils/cookies';
import { AuthContextType, NetworkErrorType, UpdateProfileData } from '@/types/auth';
import logger from '@/utils/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const userProfile = await authService.getProfile();
      setUser(userProfile);
      setError(null);
    } catch (error) {
      logger.error('Failed to refresh user data', 'AuthContext', error);
      setError('Failed to refresh user data');
    }
  }, []);

  // Login function
  const login = useCallback((user: User) => {
    setUser(user);
    setError(null);
    // Save user data to cookie for cross-subdomain access
    setUserData(user);
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      logger.error('Logout failed', 'AuthContext', error);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
      // Refresh page to ensure token is properly removed from cookie
      window.location.reload();
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call API to update profile
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      
      // Update cookie with new user data (cross-subdomain)
      setUserData(updatedUser);
    } catch (error) {
      logger.error('Update profile failed', 'AuthContext', error);
      setError('Cập nhật hồ sơ thất bại');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = authService.getToken();
        if (!token) {
          setUser(null);
          return;
        }

        try {
          // Call API to get user profile and verify token
          const userProfile = await authService.getProfile();
          setUser(userProfile);
        } catch (apiError: unknown) {
          // Handle connection refused errors gracefully
          if (apiError instanceof Error && apiError.message === 'CONNECTION_REFUSED') {
            logger.warn('API server not available, treating user as guest', 'AuthContext');
            setUser(null);
            setError(null); // Don't show error for connection issues
            return;
          }
          
          logger.warn('Get profile failed', 'AuthContext', apiError);
          
          // Handle different types of errors
          if (apiError && typeof apiError === 'object' && 'type' in apiError) {
            const error = apiError as { type: NetworkErrorType };
            if (error.type === NetworkErrorType.AUTHENTICATION_ERROR) {
              // Token is invalid, clear everything
              authService.logout();
              setUser(null);
              setError('Session expired. Please login again.');
            } else if (error.type === NetworkErrorType.NETWORK_ERROR) {
              // Network error, keep user logged in but show warning
              setError('Network error. Some features may not work properly.');
            } else {
              // Other errors, clear auth state
              authService.logout();
              setUser(null);
              setError('Authentication failed. Please login again.');
            }
          } else {
            // Unknown error, clear auth state
            authService.logout();
            setUser(null);
            setError('Authentication failed. Please login again.');
          }
        }
      } catch (error) {
        logger.error('Auth check failed', 'AuthContext', error);
        setUser(null);
        setError('Authentication check failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Auto-refresh user data periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [user, refreshUser]);

  // Handle visibility change to refresh auth when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, refreshUser]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}