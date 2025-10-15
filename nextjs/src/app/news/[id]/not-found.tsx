import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="g-transparent flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          404
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-300 mb-6">
          Không tìm thấy bài viết
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <div className="space-x-4">
          <Link
            href="/news"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Về trang tin tức
          </Link>
          <Link
            href="/news/all"
            className="inline-flex items-center px-6 py-3 bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Xem tất cả tin tức
          </Link>
        </div>
      </div>
    </div>
  );
}
