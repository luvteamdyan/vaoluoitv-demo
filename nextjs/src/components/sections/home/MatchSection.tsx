"use client";
import { useState, useEffect, useCallback } from 'react';
import MatchCard from '../../ui/cards/MatchCard';
import { matchService } from '@/services/matchService';
import { Match, MatchStatus } from '@/types/match';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/sellects/select';

export default function MatchSection() {
  // State management
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState("Trận Hot");
  const filters = ["Trận Hot", "Trực tiếp", "Sắp diễn ra", "Kết thúc", "Tất cả"];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 8;
  
  
  // Calculate pagination
  const totalPages = Math.ceil(totalMatches / matchesPerPage);

  // Fetch matches based on active filter with server-side pagination
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response: { matches: Match[]; total: number } = { matches: [], total: 0 };
      const today = new Date().toISOString().split('T')[0];
      
      switch (activeFilter) {
        case "Trận Hot":
          const featuredResponse = await matchService.getMatches({ 
            page: currentPage, 
            limit: matchesPerPage,
            is_featured: true 
          });
          response = featuredResponse;
          break;
        case "Trực tiếp":
          const liveResponse = await matchService.getMatches({ 
            page: currentPage, 
            limit: matchesPerPage,
            status: MatchStatus.LIVE 
          });
          response = liveResponse;
          break;
        case "Sắp diễn ra":
          const upcomingResponse = await matchService.getMatches({ 
            page: currentPage, 
            limit: matchesPerPage,
            status: MatchStatus.SCHEDULED,
            has_commentator: 'true',
            date: today
          });
          response = upcomingResponse;
          break;
        case "Kết thúc":
          const finishedResponse = await matchService.getMatches({ 
            page: currentPage, 
            limit: matchesPerPage,
            status: MatchStatus.FINISHED,
            date: today
          });
          response = finishedResponse;
          break;
        case "Tất cả":
          const allResponse = await matchService.getMatches({ 
            page: currentPage, 
            limit: matchesPerPage 
          });
          response = allResponse;
          break;
        default:
          const defaultResponse = await matchService.getMatches({ 
            page: currentPage, 
            limit: matchesPerPage 
          });
          const defaultFeaturedMatches = defaultResponse.matches.filter(match => match.is_featured);
          response = { matches: defaultFeaturedMatches, total: defaultFeaturedMatches.length };
      }
      
      setMatches(response.matches);
      setTotalMatches(response.total);
    } catch (err) {
      console.warn('Error fetching matches:', err);
      // Handle connection refused errors gracefully
      if (err instanceof Error && err.message === 'CONNECTION_REFUSED') {
        setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
      } else {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  }, [activeFilter, currentPage, matchesPerPage]);

  // Fetch matches on component mount and when filter or page changes
  useEffect(() => {
    fetchMatches();
  }, [activeFilter, currentPage, matchesPerPage, fetchMatches]);
  
  // Handle filter change - reset to page 1
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };
  
  // Navigation functions
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-32 md:mt-1">
      {/* Filter Section */}
      <div className="relative mb-2">
        {/* Filter Background */}
        <div className="bg-gradient-to-br from-red-700/60 to-red-700 rounded-sm rounded-tl-lg rounded-tr-lg border-t-6 shadow-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                Trận đấu hôm nay
              </h2>
              <p className="text-xs md:text-sm text-gray-300">
                Chọn loại trận đấu bạn muốn xem
              </p>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`relative cursor-pointer px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeFilter === filter
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                    : "bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50"
                }`}
              >
                {activeFilter === filter && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-lg md:rounded-xl opacity-90"></div>
                )}
                <span className="relative z-10 flex items-center">
                  {(filter === "Trận Hot" || filter === "Trực tiếp") && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full mr-1 md:mr-2 animate-pulse"></div>
                  )}
                  {filter}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
            
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-300">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchMatches}
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-3">
          {matches.length > 0 ? (
            matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                backgroundImage="https://i.pinimg.com/736x/2d/d2/d2/2dd2d2715e027ec861e9acdfe08f5c9d.jpg"
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">Không có trận đấu nào</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-8 md:mt-12 flex flex-col items-center space-y-4">
          {/* Pagination Navigation */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Previous Button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                currentPage === 1
                  ? 'bg-black text-gray-600 cursor-not-allowed'
                  : 'bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 shadow-sm hover:shadow-md'
              }`}
            >
              ← Trước
            </button>

            {/* Page Indicators - Hide some on mobile if too many */}
            <div className="flex items-center space-x-1">
              {totalPages <= 5 ? (
                // Show all pages if 5 or fewer
                Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                      page === currentPage
                        ? 'bg-yellow-500 text-black shadow-lg transform scale-110'
                        : 'bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {page}
                  </button>
                ))
              ) : (
                // Show limited pages on mobile
                <>
                  {currentPage > 2 && (
                    <>
                      <button
                        onClick={() => goToPage(1)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 shadow-sm hover:shadow-md cursor-pointer"
                      >
                        1
                      </button>
                      {currentPage > 3 && <span className="text-gray-500">...</span>}
                    </>
                  )}
                  
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - 1) + i;
                    if (page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                          page === currentPage
                            ? 'bg-yellow-500 text-black shadow-lg transform scale-110'
                            : 'bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && <span className="text-gray-500">...</span>}
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 shadow-sm hover:shadow-md cursor-pointer"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                currentPage === totalPages
                  ? 'bg-black text-gray-600 cursor-not-allowed'
                  : 'bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 shadow-sm hover:shadow-md'
              }`}
            >
              Sau →
            </button>
          </div>

          {/* Quick Jump */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Chuyển đến:</span>
            <Select value={currentPage.toString()} onValueChange={(value) => goToPage(Number(value))}>
              <SelectTrigger className="w-[120px] h-8 px-2 py-1 bg-black border border-yellow-500/50 text-gray-300 text-xs rounded-lg">
                <SelectValue placeholder="Chọn trang" />
              </SelectTrigger>
              <SelectContent 
                className="bg-black border border-yellow-500/50 max-h-[240px] overflow-y-auto"
                position="popper"
                side="bottom"
                align="start"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <SelectItem 
                    key={page} 
                    value={page.toString()}
                    className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                  >
                    Trang {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="mt-12 border-b border-gray-400"></div>   
    </div>
  );
}