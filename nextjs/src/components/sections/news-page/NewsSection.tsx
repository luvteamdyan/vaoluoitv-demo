"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { articleService } from '@/services/articleService';
import { NewsArticle } from '@/types/article';

export default function NewsSection() {
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [latestArticles, setLatestArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        setLoading(true);
        
        // Fetch 2 loại tin tức riêng biệt
        const [featuredResponse, eventResponse] = await Promise.all([
          // Featured: 5 tin nổi bật mới nhất (có featured: true)
          articleService.getArticles({
            pageSize: 5,
            featured: true,
            sort: 'publishedAt:desc'
          }),
          // Latest: Sự kiện mới nhất (có hashtag "Event")
          articleService.getArticlesByTag('Event', 4)
        ]);
        
        // Convert featured articles
        const featuredArticles = featuredResponse.data.map(article =>
          articleService.convertToLegacyFormat(article) as NewsArticle
        );
        setFeaturedArticles(featuredArticles);
        
        // Convert event articles
        const eventArticles = eventResponse.data.map(article =>
          articleService.convertToLegacyFormat(article) as NewsArticle
        );
        setLatestArticles(eventArticles);
        
        // Debug log để kiểm tra
        
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllArticles();
  }, []);

  return (
    <div className="bg-transparent">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-32 pt-4 pb-4 md:pt-6 md:pb-6 lg:pt-8 lg:pb-8">
      
        {/* Featured News Section */}
        <div className="mb-12">
          {/* Header with Button */}
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-1 h-10 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Tin Nổi Bật</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent"></div>
            </div>
            
            {/* Button on the right */}
            <Link
              href="/news/all"
              className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 hover:border-yellow-400 whitespace-nowrap"
            >
              <span>Xem tất cả tin tức</span>
            </Link>
          </div>
        
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Featured Skeleton */}
              <div className="lg:col-span-1">
                <div className="h-[612px]">
                  <div className="animate-pulse bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-full flex flex-col">
                    <div className="relative flex-1 bg-gray-700 flex-shrink-0"></div>
                    <div className="p-8 h-48 flex flex-col justify-center">
                      <div>
                        <div className="h-8 bg-gray-700 rounded mb-4 w-3/4"></div>
                        <div className="h-6 bg-gray-700 rounded mb-2 w-full"></div>
                        <div className="h-6 bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Featured Skeletons */}
              <div className="lg:col-span-1 flex flex-col justify-start space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-36">
                    <div className="animate-pulse flex gap-2 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20 h-full items-center">
                      <div className="relative w-56 h-full flex-shrink-0 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center p-2 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : featuredArticles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Featured Article */}
              <div className="lg:col-span-1">
                {featuredArticles[0] && (
                  <Link href={`/news/${featuredArticles[0].id}`} className="block group h-[400px] sm:h-[500px] md:h-[550px] lg:h-[612px]">
                    <div className="relative bg-gradient-to-br from-gray-900 to-red-700 backdrop-blur-sm rounded-2xl overflow-hidden border border-yellow-500 hover:border-yellow-300 hover:shadow-xl hover:shadow-yellow-400/30 transition-all duration-300 h-full flex flex-col">
                      <div className="relative flex-1 overflow-hidden flex-shrink-0">
                        <img
                          src={featuredArticles[0].picture}
                          alt={featuredArticles[0].title}
                          className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>
                      <div className="p-4 sm:p-6 h-32 sm:h-40 md:h-48 flex flex-col justify-center flex-shrink-0">
                        <div>
                          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-yellow-500 group-hover:text-yellow-300 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] transition-all duration-300 mb-2 sm:mb-3 line-clamp-2">
                            {featuredArticles[0].title}
                          </h3>
                          <p className="text-gray-300 text-sm sm:text-base md:text-lg group-hover:text-white transition-all duration-300 line-clamp-2">
                            {featuredArticles[0].subTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {/* Secondary Featured Articles */}
              <div className="lg:col-span-1 flex flex-col justify-start space-y-2 sm:space-y-3">
                {featuredArticles.length > 1 ? (
                  featuredArticles.slice(1, 5).map((article) => (
                    <Link key={article.id} href={`/news/${article.id}`} className="block group h-28 sm:h-32 md:h-36">
                      <div className="flex gap-2 bg-gradient-to-r from-gray-900 to-red-700 backdrop-blur-sm rounded-xl p-1 border border-yellow-500 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 h-full items-center overflow-hidden">
                        <div className="relative w-32 sm:w-40 md:w-56 h-full flex-shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={article.picture}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out focus:outline-none rounded-sm"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center p-2 pr-3">
                          <h4 className="text-xs sm:text-sm md:text-base font-semibold text-yellow-500 group-hover:text-yellow-300 group-hover:drop-shadow-[0_0_6px_rgba(250,204,21,0.7)] transition-all duration-300 line-clamp-2 mb-1">
                            {article.title}
                          </h4>
                          <p className="text-gray-300 text-xs sm:text-xs md:text-sm group-hover:text-white transition-all duration-300 line-clamp-2">
                            {article.subTitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-sm">Không có tin tức phụ</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">Không có tin tức nào</div>
            </div>
          )}
        </div>

        {/* Latest News Section */}
        <div className="mb-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Sự Kiện Mới Nhất</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent"></div>
          </div>
        
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64">
                  <div className="animate-pulse bg-white/10 backdrop-blur-md rounded-xl border border-white/20 h-full flex flex-col">
                    <div className="relative flex-1 bg-gray-700 flex-shrink-0 rounded-t-xl"></div>
                    <div className="p-4 flex flex-col justify-center">
                      <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestArticles.map((article) => (
                <Link key={article.id} href={`/news/${article.id}`} className="block group h-48 sm:h-56 md:h-60 lg:h-64">
                  <div className="relative bg-gradient-to-br from-gray-900 to-red-700 backdrop-blur-sm rounded-xl overflow-hidden border border-red-500 hover:border-red-300 hover:shadow-lg hover:shadow-red-400/20 transition-all duration-300 h-full flex flex-col">
                    <div className="relative flex-1 overflow-hidden flex-shrink-0">
                      <img
                        src={article.picture}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col justify-center flex-shrink-0">
                      <h3 className="text-xs sm:text-sm md:text-base font-semibold text-red-400 group-hover:text-red-300 group-hover:drop-shadow-[0_0_6px_rgba(248,113,113,0.7)] transition-all duration-300 line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-gray-300 text-xs group-hover:text-white transition-all duration-300 line-clamp-2">
                        {article.subTitle}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-base">Không có sự kiện nào</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
