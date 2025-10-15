'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      // Chỉ cho phép admin, caster và staff truy cập
      if (user && user.role !== 'admin' && user.role !== 'caster' && user.role !== 'staff') {
        router.push('/login');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Hiển thị loading spinner khi đang kiểm tra authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Không hiển thị gì nếu chưa authenticated hoặc không phải admin/caster/staff
  if (!isAuthenticated || (user && user.role !== 'admin' && user.role !== 'caster' && user.role !== 'staff')) {
    return null;
  }

  return <>{children}</>;
}