'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import AllNewsCard from '@/components/ui/cards/AllNewsCard';
import { useArticles, useHashtags } from '@/hooks/useArticles';
import { articleService } from '@/services/articleService';
import { NewsArticle } from '@/types/article';
import { FileText, Video, Hash, Tag } from 'lucide-react';
import SkeletonNewsCard from '@/components/ui/cards/SkeletonNewsCard';

interface AllNewsSectionProps {
  articlesPerPage?: number;
  showFilters?: boolean;
  showPagination?: boolean;
}

export default function AllNewsSection({ 
  articlesPerPage = 8, // ✅ Giảm từ 12 → 8
  showFilters = true, 
  showPagination = true 
}: AllNewsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHashtag, setSelectedHashtag] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Fetch articles and hashtags from API
  const { 
    articles, 
    loading, 
    pagination, 
    fetchArticles 
  } = useArticles();

  const { hashtags } = useHashtags();
  
  // Memoize query params to prevent unnecessary re-fetches
  const queryParams = useMemo(() => ({
    page: currentPage,
    pageSize: articlesPerPage,
    tag: selectedHashtag !== 'all' ? selectedHashtag : undefined,
    type: selectedType !== 'all' ? selectedType as 'article' | 'video' : undefined,
  }), [currentPage, articlesPerPage, selectedHashtag, selectedType]);

  // Convert articles to legacy format for compatibility
  const articlesLegacy = articles.map(article => 
    articleService.convertToLegacyFormat(article) as NewsArticle
  );

  // Get unique hashtags for filtering
  const hashtagOptions = ['all', ...(Array.isArray(hashtags) && hashtags.length > 0 ? hashtags.map(tag => tag.hashtag) : [])];
  const typeOptions = ['all', 'article', 'video'];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleHashtagChange = useCallback((hashtag: string) => {
    setSelectedHashtag(hashtag);
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  }, []);

  // ✅ FIX: Fetch when queryParams change (not fetchArticles)
  useEffect(() => {
    fetchArticles(queryParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);


  return (
    <div className="bg-transparent">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-32 pt-4 pb-2 md:pt-6 md:pb-4 lg:pt-8 lg:pb-6">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Tất Cả Tin Tức
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Khám phá tất cả các bài viết và tin tức mới nhất
          </p>
        </div>

        {/* Filters and Controls */}
        {showFilters && (
          <div className="mb-8">
            <div className="flex flex-col gap-8">
              {/* Type Filter - Row 1 */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 w-24 sm:w-28 lg:w-32">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400" />
                </div>
                
                {/* All screen sizes: Show as clickable text */}
                <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6">
                  {typeOptions.map((type) => (
                    <span
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`cursor-pointer flex items-center gap-2 text-sm sm:text-base lg:text-lg font-medium transition-all duration-300 hover:scale-105 px-3 py-1.5 rounded-lg ${
                        selectedType === type
                          ? 'text-blue-400 underline underline-offset-4 bg-blue-400/10'
                          : 'text-gray-300 hover:text-white hover:bg-blue-400/20'
                      }`}
                    >
                      {type === 'all' && <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {type === 'article' && <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {type === 'video' && <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {type === 'all' ? 'Tất cả' : type === 'article' ? 'Bài viết' : 'Video'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hashtag Filter - Row 2 */}
              <div className="flex flex-wrap gap-4 items-start">
                <div className="flex items-center gap-2 w-24 sm:w-28 lg:w-32">
                  <Hash className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-400" />
                  <span className="text-white font-medium text-sm sm:text-base lg:text-lg">Hashtag:</span>
                </div>
                
                {/* All screen sizes: Show as clickable text with auto-wrap */}
                <div className="flex flex-wrap gap-x-5 gap-y-4 flex-1">
                  {hashtagOptions.map((hashtag) => (
                    <span
                      key={hashtag}
                      onClick={() => handleHashtagChange(hashtag)}
                      className={`cursor-pointer flex items-center gap-1.5 text-sm sm:text-base lg:text-lg font-medium transition-all duration-300 hover:scale-105 px-3 py-1.5 rounded-lg ${
                        selectedHashtag === hashtag
                          ? 'text-red-400 underline underline-offset-4 bg-red-400/10'
                          : 'text-gray-300 hover:text-white hover:bg-red-400/20'
                      }`}
                    >
                      <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                      {hashtag === 'all' ? 'Tất cả' : `#${hashtag}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {Array.from({ length: articlesPerPage }).map((_, index) => (
                <div key={index} className="col-span-1">
                  <SkeletonNewsCard variant="default" />
                </div>
              ))}
            </div>
          ) : articlesLegacy.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {articlesLegacy.map((article) => (
                <div key={article.id} className="col-span-1">
                  <AllNewsCard article={article} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                Không tìm thấy bài viết nào
              </div>
              <p className="text-gray-500">
                Hãy thử thay đổi bộ lọc hoặc hashtag
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {showPagination && pagination && pagination.pageCount > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current page
                if (
                  page === 1 ||
                  page === pagination.pageCount ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`flex items-center px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                          : 'bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pageCount}
              className="flex items-center px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
