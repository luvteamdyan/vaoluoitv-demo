'use client';

import Link from 'next/link';
import { NewsArticle } from '@/types/article';

interface AllNewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'large' | 'small';
}

export default function AllNewsCard({ article, variant = 'default' }: AllNewsCardProps) {
  const baseClasses = "rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl group cursor-pointer";
  const hasSubtitle = article.subTitle && article.subTitle.trim() !== '';

  // Video Badge Component - Removed
  // const VideoBadge = () => null;

  // Play Icon Overlay - Removed
  // const PlayOverlay = () => null;

  switch (variant) {
    case 'large':
      return (
        <Link href={`/news/${article.id}`} className="block">
          <div className={`${baseClasses} bg-gradient-to-br from-gray-900 to-red-700 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-yellow-500 hover:border-yellow-300 hover:shadow-xl hover:shadow-yellow-400/30 h-[560px] flex flex-col`}>
            <div className="relative h-80 sm:h-88 md:h-80 lg:h-88 overflow-hidden flex-shrink-0">
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                <img
                  src={article.picture}
                  alt={article.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
            <div className="pt-4 flex-1 flex flex-col justify-between min-h-0">
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-500 group-hover:text-yellow-300 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] transition-all duration-300 mb-3 line-clamp-2">
                  {article.title}
                </h3>
                {hasSubtitle && (
                  <p className="text-gray-300 text-xs sm:text-sm md:text-sm group-hover:text-white transition-all duration-300 overflow-hidden text-ellipsis line-clamp-2">
                    {article.subTitle}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between flex-shrink-0">
                <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                  {new Date(article.publishDate).toLocaleDateString('vi-VN')}
                </span>
                <div className="flex items-center text-yellow-500 group-hover:text-yellow-300 transition-colors duration-300">
                  <span className="text-sm font-medium">Đọc thêm</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      );

    case 'small':
      return (
        <Link href={`/news/${article.id}`} className="block">
          <div className={`${baseClasses} bg-gradient-to-br from-gray-900 to-red-700 backdrop-blur-sm rounded-2xl p-2 sm:p-4 border border-yellow-500 hover:border-yellow-300 hover:shadow-xl hover:shadow-yellow-400/30 h-[320px] flex flex-col`}>
            <div className="relative h-40 sm:h-44 md:h-40 overflow-hidden flex-shrink-0">
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                <img
                  src={article.picture}
                  alt={article.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
            <div className="pt-3 flex-1 flex flex-col justify-between min-h-0">
              <div>
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-yellow-500 group-hover:text-yellow-300 group-hover:drop-shadow-[0_0_6px_rgba(250,204,21,0.7)] transition-all duration-300 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                {hasSubtitle && (
                  <p className="text-gray-300 text-xs group-hover:text-white transition-all duration-300 overflow-hidden text-ellipsis line-clamp-2">
                    {article.subTitle}
                  </p>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between flex-shrink-0">
                <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                  {new Date(article.publishDate).toLocaleDateString('vi-VN')}
                </span>
                <div className="flex items-center text-yellow-500 group-hover:text-yellow-300 transition-colors duration-300">
                  <span className="text-xs font-medium mr-1">Đọc</span>
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      );

    default:
      return (
        <Link href={`/news/${article.id}`} className="block group">
          <div className={`${baseClasses} bg-gradient-to-r from-gray-900 to-red-700 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-yellow-500 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20 h-[220px] flex gap-4 items-center`}>
            <div className="relative w-36 md:w-44 lg:w-48 h-32 sm:h-36 md:h-32 lg:h-36 flex-shrink-0 rounded-lg overflow-hidden min-w-36">
              <img
                src={article.picture}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-yellow-500 group-hover:text-yellow-300 group-hover:drop-shadow-[0_0_6px_rgba(250,204,21,0.7)] transition-all duration-300 line-clamp-2 mb-2">
                {article.title}
              </h3>
              {hasSubtitle && (
                <p className="text-gray-300 text-xs sm:text-xs md:text-sm group-hover:text-white transition-all duration-300 overflow-hidden text-ellipsis line-clamp-2 mb-3">
                  {article.subTitle}
                </p>
              )}
              <div className="flex items-center justify-between flex-shrink-0">
                <span className="text-xs md:text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                  {new Date(article.publishDate).toLocaleDateString('vi-VN')}
                </span>
                <div className="flex items-center text-yellow-500 group-hover:text-yellow-300 transition-colors duration-300">
                  <span className="text-xs md:text-sm font-medium">Đọc thêm</span>
                  <svg className="w-3 h-3 md:w-4 md:h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      );
  }
}
