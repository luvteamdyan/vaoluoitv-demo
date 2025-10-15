'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {House} from 'lucide-react';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export default function NotFoundPage({ 
  title = "404 - Không tìm thấy trang",
  message = "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
  showBackButton = true,
  showHomeButton = true
}: NotFoundPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-black text-red-500/20 select-none">404</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {title}
        </h1>

        {/* Message */}
        <p className="text-gray-300 text-sm md:text-base mb-8 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium"
            >
              ← Quay lại
            </button>
          )}
          
          {showHomeButton && (
            <Link
              href="/"
              className="px-6 py-3 flex bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium"
            >
              <House className="w-4 h-6 mr-2" /> Về trang chủ
            </Link>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-xs text-gray-500">
          <p>Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với chúng tôi.</p>
        </div>
      </div>
    </div>
  );
}

// Predefined variants for common use cases
export const NotFoundVariants = {
  // Default 404 page
  default: NotFoundPage,
  
  // Live stream not found
  liveStream: (props?: Partial<NotFoundPageProps>) => (
    <NotFoundPage
      title="404 - Không tìm thấy trang"
      message="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
      {...props}
    />
  ),
  
  // Match not found
  matchNotFound: (props?: Partial<NotFoundPageProps>) => (
    <NotFoundPage
      title="404 - Không tìm thấy trang"
      message="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
      {...props}
    />
  ),
  
  // User profile not found
  userNotFound: (props?: Partial<NotFoundPageProps>) => (
    <NotFoundPage
      title="404 - Không tìm thấy trang"
      message="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
      {...props}
    />
  ),
  
  // Generic error page
  error: (props?: Partial<NotFoundPageProps>) => (
    <NotFoundPage
      title="404 - Không tìm thấy trang"
      message="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
      {...props}
    />
  )
};
