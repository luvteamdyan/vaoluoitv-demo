"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Tv } from "lucide-react";
import Link from "next/link";

export default function LiveError({
  error,
  reset,
  params,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  params: { matchId: string };
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Live page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Error Container */}
        <div className="bg-gradient-to-br from-red-900/20 via-red-800/10 to-gray-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-4">
              <Tv className="w-12 h-12 text-red-300" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Lỗi tải trận đấu
            </h1>
            <p className="text-red-100 text-lg">
              Không thể tải trang trực tiếp trận đấu
            </p>
            <p className="text-red-200 text-sm mt-2 font-mono">
              Match ID: {params.matchId}
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Possible Causes */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-200 text-sm font-semibold mb-2">
                Có thể do:
              </p>
              <ul className="list-disc list-inside text-yellow-100 text-sm space-y-1">
                <li>Trận đấu không tồn tại hoặc đã kết thúc</li>
                <li>Vấn đề kết nối mạng</li>
                <li>Lỗi tải dữ liệu từ server</li>
                <li>Trận đấu đã bị hủy</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={reset}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Thử lại
              </button>

              <Link
                href="/match-schedule"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
              >
                <Tv className="w-5 h-5" />
                Lịch thi đấu
              </Link>

              <Link
                href="/"
                className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-gray-500/50 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Trang chủ
              </Link>
            </div>

            {/* Help Text */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Mẹo:</strong> Nếu vấn đề vẫn tiếp diễn, hãy thử:
              </p>
              <ul className="list-disc list-inside text-blue-100 text-sm mt-2 space-y-1">
                <li>Xóa cache trình duyệt (Ctrl+Shift+Delete)</li>
                <li>Thử trình duyệt khác</li>
                <li>Kiểm tra kết nối internet</li>
                <li>Liên hệ hỗ trợ nếu trận đấu vẫn đang diễn ra</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-900/50 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              VAOLUOITV © {new Date().getFullYear()}. Mọi quyền được bảo lưu.
            </p>
          </div>
        </div>

        {/* Technical Details (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 bg-gray-900 border border-gray-700 rounded-lg p-4">
            <summary className="cursor-pointer text-gray-400 text-sm font-semibold hover:text-gray-200">
              Chi tiết kỹ thuật (Development)
            </summary>
            <pre className="mt-4 text-xs text-gray-400 overflow-auto max-h-64">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

