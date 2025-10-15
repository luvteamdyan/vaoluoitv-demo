'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/auth.service';
import { setAuthToken, setUserData } from '../utils/cookies';
import { usePostMessage } from '../hooks/usePostMessage';
import { PostMessageAuthData } from '../services/postmessage.service';
import { decodeJWT, validateJWT, extractUserFromPayload } from '../utils/jwt';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  tokenSource: 'luck8event' | 'url-token' | null;
  isPostMessageListening: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenSource, setTokenSource] = useState<'luck8event' | 'url-token' | null>(null);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  /**
   * Handle authentication data from PostMessage
   */
  const handlePostMessageAuth = (data: PostMessageAuthData) => {
    try {
      // Only support luck8event source
      if (data.source !== 'luck8event' || !data.userData) {
        throw new Error('Invalid user data in PostMessage - only luck8event source supported');
      }

      const userData: User = {
        id: data.userData.id,
        email: data.userData.email,
        username: data.userData.username
      };

      // Save token and user to cookies (same-origin)
      setAuthToken(data.token);
      setUserData(userData);
      
      // Update state
      setUser(userData);
      setTokenSource('luck8event');
      setIsLoading(false);
      
      // Clear redirect timeout khi nhận được auth data thành công
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
        setRedirectTimeout(null);
      }
      
      console.log('[Auth] Successfully authenticated via PostMessage from luck8event');
      
    } catch (error) {
      console.error('Error processing PostMessage authentication:', error);
    }
  };

  /**
   * Handle authentication from URL token
   */
  const handleURLTokenAuth = (token: string) => {
    try {
      // Validate JWT token
      if (!validateJWT(token)) {
        throw new Error('Invalid or expired JWT token');
      }

      // Decode JWT to get payload
      const decoded = decodeJWT(token);
      if (!decoded) {
        throw new Error('Failed to decode JWT token');
      }

      // Extract user info from payload
      const userData = extractUserFromPayload(decoded.payload);
      if (!userData) {
        throw new Error('Failed to extract user data from JWT payload');
      }

      // Save token and user to localStorage
      authService.setToken(token);
      authService.setUser(userData);
      
      // Also save to cookies for backward compatibility
      setAuthToken(token);
      setUserData(userData);
      
      // Update state
      setUser(userData);
      setTokenSource('url-token');
      setIsLoading(false);
      
      // Clear redirect timeout khi nhận được auth data thành công
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
        setRedirectTimeout(null);
      }

      // Clean URL - remove token parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, document.title, url.toString());
      
      console.log('[Auth] Successfully authenticated via URL token');
      
    } catch (error) {
      console.error('Error processing URL token authentication:', error);
    }
  };


  // Initialize PostMessage listener
  const { state: postMessageState } = usePostMessage(handlePostMessageAuth, {
    autoStart: true,
    timeout: 0 // No timeout - wait indefinitely for PostMessage
  });

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Thứ tự ưu tiên:
        // 1. Lắng nghe PostMessage (đã được setup ở trên)
        // 2. Nếu không nhận được PostMessage, check URL token
        // 3. Nếu không có cả 2, timeout redirect

        // Check URL token ngay lập tức
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        if (urlToken) {
          console.log('[Auth] Found token in URL, processing...');
          handleURLTokenAuth(urlToken);
          return; // Exit early if URL token is processed
        }

        // Set timeout để chuyển hướng nếu không nhận được auth data
        // DISABLED FOR DEVELOPMENT - Không redirect khi đang test ở localhost
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (!isDevelopment) {
          const timeout = setTimeout(() => {
            console.log('[Auth] No authentication received after 10s, redirecting to luck8event.com');
            window.location.href = 'https://luck8event.com';
          }, 10000);
          
          setRedirectTimeout(timeout);
        } else {
          console.log('[Auth] Development mode - redirect disabled');
          setIsLoading(false); // Stop loading in development mode
        }

      } catch (error) {
        console.error('Error initializing authentication:', error);
        // Don't stop loading on error - keep trying
      }
    };

    initializeAuth();
    
    // Return cleanup function
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
        setRedirectTimeout(null);
      }
    };
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
    setTokenSource(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    tokenSource,
    isPostMessageListening: postMessageState.isListening,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
