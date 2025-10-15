'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthUser, LoginResponse } from '@/types/auth';
import { setCookie, getCookie, clearAllAuthCookies } from '@/utils/cookies';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getCookie('access_token');
        const storedUser = getCookie('user');

        if (storedToken) {
          setToken(storedToken);
          
          if (storedUser) {
            // Nếu có user data trong cookie, sử dụng nó
            const userData = JSON.parse(decodeURIComponent(storedUser));
            setUser(userData);
            
            // Redirect dựa trên role nếu đang ở trang login
            if (typeof window !== 'undefined' && window.location.pathname === '/login') {
              if (userData.role === 'caster') {
                router.push('/caster');
              } else {
                router.push('/');
              }
            }
          } else {
            // Nếu không có user data, gọi API để lấy thông tin user
            try {
              const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
              const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: {
                  'Authorization': `Bearer ${storedToken}`,
                },
              });

              if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                // Lưu user data vào cookie để lần sau không cần gọi API
                setCookie('user', encodeURIComponent(JSON.stringify(userData)), 7);
                
                // Redirect dựa trên role nếu đang ở trang login
                if (typeof window !== 'undefined' && window.location.pathname === '/login') {
                  if (userData.role === 'caster') {
                    router.push('/caster');
                  } else {
                    router.push('/');
                  }
                }
              } else {
                // Token không hợp lệ, clear cookies và redirect đến login
                clearAllAuthCookies();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                  router.push('/login');
                }
              }
            } catch (apiError) {
              if (process.env.NODE_ENV === 'development') {
                // Silently handle error
              }
              // Clear invalid data và redirect đến login
              clearAllAuthCookies();
              if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                router.push('/login');
              }
            }
          }
        } else {
          // Không có token, redirect đến login nếu không phải trang login
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // Silently handle error
        }
        // Clear invalid data và redirect đến login
        clearAllAuthCookies();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }

      const result: LoginResponse = await response.json();
      
      // Kiểm tra role admin, caster hoặc staff
      if (result.user.role !== 'admin' && result.user.role !== 'caster' && result.user.role !== 'staff') {
        throw new Error('Chỉ User có quyền Admin, Caster hoặc Staff mới có thể đăng nhập');
      }
      
      // Lưu vào state và cookie
      setToken(result.access_token);
      setUser(result.user);
      
      // Set cookies với expiration 7 ngày
      setCookie('access_token', result.access_token, 7);
      setCookie('user', encodeURIComponent(JSON.stringify(result.user)), 7);
      
      // Redirect đến dashboard dựa trên role
      if (result.user.role === 'caster') {
        router.push('/caster');
      } else {
        router.push('/');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear cookies
    clearAllAuthCookies();
    
    // Redirect đến login page
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
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
