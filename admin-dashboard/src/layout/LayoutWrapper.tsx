'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from './AdminLayout';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Các trang không cần AdminLayout
  const publicPages = ['/login', '/unauthorized'];
  const isPublicPage = publicPages.includes(pathname);
  
  // Trang caster có layout riêng (không qua AdminLayout với ProtectedRoute)
  const isCasterPage = pathname === '/caster';

  // Hiển thị loading khi đang kiểm tra authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--foreground)]">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu là trang public hoặc chưa đăng nhập, hiển thị children trực tiếp
  if (isPublicPage || !isAuthenticated) {
    return <>{children}</>;
  }

  // Nếu là trang caster, hiển thị trực tiếp (không qua ProtectedRoute)
  if (isCasterPage) {
    return <>{children}</>;
  }

  // Nếu đã đăng nhập và không phải trang public/caster, sử dụng AdminLayout
  return <AdminLayout>{children}</AdminLayout>;
}
