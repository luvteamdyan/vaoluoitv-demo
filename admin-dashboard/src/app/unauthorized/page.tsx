'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="mx-auto h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        {/* Content */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-[var(--text-muted)] mb-8">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="w-full bg-[var(--accent)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-[var(--card-bg)] text-[var(--foreground)] py-3 px-4 rounded-lg font-medium border border-[var(--sidebar-border)] hover:bg-[var(--hover-bg)] transition-colors"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
}
