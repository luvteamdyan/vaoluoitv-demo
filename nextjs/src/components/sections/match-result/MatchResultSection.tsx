"use client";

import React, { useState, useCallback } from 'react';
// import MatchResultCard from '@/components/ui/MatchResultCard';
import { useFilteredMatchResults } from '@/hooks/useFilteredMatchResults';
import { Search, Clock, Trophy } from 'lucide-react';
import { MATCHES_PER_PAGE } from '@/constants/match-schedule.constants';
import { getVietnamToday, getVietnamYesterday } from '@/utils/dateUtils';
import { Match } from '@/types/match';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/sellects/select';

const MatchResultSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(getVietnamToday());
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllMatches, setShowAllMatches] = useState(true); // Default to show all finished matches
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Local state for search input
  const [selectedQuickDate, setSelectedQuickDate] = useState<string | null>(null);
  const [, setAllMatchesCache] = useState<Match[]>([]);

  const { displayMatches, loading, error, totalMatches } = useFilteredMatchResults(
    selectedDate,
    'all', // Always show all leagues
    showAllMatches,
    searchTerm,
    currentPage
  );

  // Cache all matches to preserve league logos across pages
  React.useEffect(() => {
    if (displayMatches.length > 0) {
      setAllMatchesCache(prev => {
        const newMatches = displayMatches.filter(newMatch => 
          !prev.some(cachedMatch => cachedMatch.id === newMatch.id)
        );
        return [...prev, ...newMatches];
      });
    }
  }, [displayMatches]);


  // Pagination calculations (server-side pagination)
  const totalPages = Math.ceil(totalMatches / MATCHES_PER_PAGE);
  const currentMatches = displayMatches; // Server already returns the correct matches for current page

  // Event handlers
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowAllMatches(false);
    setCurrentPage(1);
    // Don't clear cache when changing date - we want to preserve logos
  }, []);

  const handleQuickDateClick = useCallback((dateType: string, date: Date) => {
    setSelectedQuickDate(dateType);
    setShowAllMatches(false);
    setCurrentPage(1); // Reset to page 1 when changing date
    handleDateChange(date);
  }, [handleDateChange]);



  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value); // Only update local state
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setSearchTerm(searchInput); // Update actual search term
    setCurrentPage(1);
  }, [searchInput]);

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  // Only show full page loading on initial load, not on filter changes
  if (loading && currentMatches.length === 0) {
    return (
      <section className="w-full py-3 md:py-6 lg:py-8">
        <div className="container mx-auto px-2 md:px-6 lg:px-8 xl:px-32">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-300 text-sm">Đang tải dữ liệu...</p>
          </div>
        </div>
      </section>
    );
  }

  // Only show full page error on initial load, not on filter changes
  if (error && currentMatches.length === 0) {
    return (
      <section className="w-full py-3 md:py-6 lg:py-8">
        <div className="container mx-auto px-2 md:px-6 lg:px-8 xl:px-32">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center max-w-md">
              <p className="text-red-400 text-sm mb-2">Lỗi tải dữ liệu</p>
              <p className="text-gray-300 text-xs">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-4 md:py-6 lg:py-8 relative bg-gradient-to-b from-gray-900/50 to-black/80">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-32 relative z-10">
        {/* Header with modern design */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2" style={{
            textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)'
          }}>
            KẾT QUẢ TRẬN ĐẤU
          </h1>
        </div>

        {/* Filter Section - Modern Card Design */}
        <div className="w-full mb-3">
          <div className="bg-gradient-to-br from-red-700/60 to-red-700 rounded-sm rounded-tl-lg rounded-tr-lg border-t-6 p-1.5 md:p-4 shadow-md shadow-red-500 ">
            <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center justify-between min-h-[45px] md:min-h-[55px] lg:min-h-[70px]">
              {/* Ngày - Left side */}
              <div className="flex items-center gap-1 sm:gap-2 w-full md:w-auto">
                <label className="text-xs md:text-sm text-gray-300 whitespace-nowrap font-bold h-9 md:h-10 flex items-center">Chọn ngày:</label>
                <input
                  type="date"
                  value={showAllMatches ? "" : selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setSelectedQuickDate(null); // Reset quick date selection
                      handleDateChange(newDate);
                    }
                  }}
                  className="px-2 sm:px-3 py-2 md:px-4 md:py-2.5 bg-black border border-yellow-500/50 text-gray-300 
                 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 
                 hover:bg-red-600 focus:border-red-500 focus:outline-none 
                 h-9 md:h-10 w-28 sm:w-32 md:w-40 flex items-center"
                />

                {/* Quick Date Buttons */}
                <div className="flex gap-0.5 sm:gap-1">
                  <button
                    onClick={() => {
                      const yesterday = getVietnamYesterday();
                      handleQuickDateClick('yesterday', yesterday);
                    }}
                    className={`hidden sm:block px-1.5 sm:px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 border border-yellow-500/50 shadow-sm h-9 md:h-10 whitespace-nowrap min-w-0 ${selectedQuickDate === 'yesterday'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                      : 'bg-black text-gray-300 hover:bg-gray-800'
                      }`}
                  >
                    <span className="truncate">Hôm qua</span>
                  </button>
                  <button
                    onClick={() => {
                      const today = getVietnamToday();
                      handleQuickDateClick('today', today);
                    }}
                    className={`px-1.5 sm:px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 border border-yellow-500/50 shadow-sm h-9 md:h-10 whitespace-nowrap min-w-0 ${selectedQuickDate === 'today'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                      : 'bg-black text-gray-300 hover:bg-gray-800'
                      }`}
                  >
                    <span className="truncate">Hôm nay</span>
                  </button>
                </div>
              </div>

              {/* Search - Right side */}
              <div className="flex items-center gap-1 sm:gap-2 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                    <input
                      type="text"
                      placeholder="Tìm đội..."
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      className="w-full pl-6 sm:pl-8 pr-2 sm:pr-3 py-2 bg-black border border-yellow-500/50 text-gray-300 
                     rounded-l-lg md:rounded-l-xl text-xs font-semibold transition-all duration-300 
                     hover:bg-gray-900 focus:border-red-500 focus:outline-none 
                     h-9 md:h-10"
                    />
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="px-2 sm:px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-r-lg md:rounded-r-xl 
                   transition-all duration-300 h-9 md:h-10 flex items-center justify-center"
                    title="Tìm kiếm"
                  >
                    <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>        </div>

        {/* Content Section - Timeline Layout */}
        <div className="w-full">
          {/* League Header - Enhanced */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white mt-2">
                  Tất cả giải đấu
                </h2>
                <p className="text-sm text-gray-400">
                  {totalMatches} trận đấu
                </p>
              </div>
            </div>
          </div>
          
          {/* Match Cards - Timeline Layout */}
          <div>
            {loading ? (
              // Loading state for content only
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-gray-300 text-sm">Đang tải kết quả trận đấu...</p>
              </div>
            ) : error ? (
              // Error state for content only
              <div className="text-center py-12">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center max-w-md mx-auto">
                  <p className="text-red-400 text-sm mb-2">Lỗi tải dữ liệu</p>
                  <p className="text-gray-300 text-xs">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : currentMatches.length > 0 ? (
              <div className="relative">
                {/* Match Cards Grid - 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentMatches.map((match, matchIndex) => (
                    <div key={matchIndex} className="relative">
                      <TimelineMatchCard match={match} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-yellow-500/30">
                    <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-xl font-bold text-white mb-3">Không có kết quả trận đấu</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {searchTerm
                        ? `Không tìm thấy trận đấu nào với từ khóa "${searchTerm}".`
                        : showAllMatches
                          ? "Không có trận đấu đã hoàn thành nào."
                          : `Không có kết quả trận đấu nào diễn ra vào ngày ${selectedDate.toLocaleDateString('vi-VN')}.`
                      }
                      {!searchTerm && !showAllMatches && " Vui lòng chọn ngày khác để xem kết quả."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="mt-8 md:mt-12 flex flex-col items-center space-y-4">
                {/* Pagination Navigation */}
                <div className="flex items-center space-x-1 md:space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${currentPage === 1
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
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${page === currentPage
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
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 shadow-sm hover:shadow-md"
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
                              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${page === currentPage
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
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 shadow-sm hover:shadow-md"
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
                    className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${currentPage === totalPages
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

        </div>
      </div>
    </section>
  );
};

// Timeline Match Card Component
interface TimelineMatchCardProps {
  match: Match;
}

const TimelineMatchCard: React.FC<TimelineMatchCardProps> = ({ match }) => {
  // Helper function to format match date
  const formatMatchDate = (dateString: string) => {
    try {
      // Check if dateString is already in DD/MM/YYYY format (from new API)
      if (dateString.includes('/') && dateString.length === 10) {
        // Already in DD/MM/YYYY format, use directly
        return dateString;
      }
      
      // Legacy format: Parse the date
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      // Fallback if date parsing fails
      return dateString;
    }
  };

  // Helper function to get status config
  const getStatusConfig = (status: string) => {
    const STATUS_CONFIG = {
      'Kết thúc': { color: 'text-green-400', label: 'Kết thúc' },
      'Trực tiếp': { color: 'text-red-400', label: 'Trực tiếp' },
      'Hủy bỏ': { color: 'text-orange-400', label: 'Hủy bỏ' },
      'Sắp diễn ra': { color: 'text-blue-400', label: 'Sắp diễn ra' }
    };
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || null;
  };

  // Helper function to get match status text
  const getMatchStatus = (status: string): string => {
    const statusMap = {
      'finished': 'Kết thúc',
      'live': 'Trực tiếp',
      'cancelled': 'Hủy bỏ',
      'scheduled': 'Sắp diễn ra'
    };
    return statusMap[status as keyof typeof statusMap] || 'Sắp diễn ra';
  };

  // Get status config
  const matchStatus = getMatchStatus(match.status);
  const statusConfig = getStatusConfig(matchStatus);

  return (
    <div className="group relative bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 md:p-6 transition-all duration-300 hover:from-gray-700/60 hover:to-gray-800/60 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10">
      {/* Header with League and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {match.league?.logo ? (
            <img
              src={match.league.logo}
              alt={`${match.league.name} logo`}
              className="w-4 h-4 object-contain flex-shrink-0"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold text-gray-300 truncate max-w-[120px] sm:max-w-none">{match.league?.name || 'Giải đấu'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">{match.match_time} {formatMatchDate(match.match_date)}</span>
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${statusConfig?.color || 'text-slate-400'} bg-gray-800/50`}>
            {statusConfig?.label || matchStatus}
          </div>
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {match.home_team.logo && (
            <img
              src={match.home_team.logo}
              alt={`${match.home_team.name} logo`}
              className="w-8 h-8 object-contain flex-shrink-0"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <span className="text-white font-semibold text-sm md:text-base truncate" title={match.home_team.name}>
            {match.home_team.name}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center space-x-4 mx-4">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {match.home_score}
            </div>
          </div>
          <div className="text-gray-400 text-lg font-bold">-</div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {match.away_score}
            </div>
          </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center space-x-3 flex-1 justify-end min-w-0">
          <span className="text-white font-semibold text-sm md:text-base truncate text-right" title={match.away_team.name}>
            {match.away_team.name}
          </span>
          {match.away_team.logo && (
            <img
              src={match.away_team.logo}
              alt={`${match.away_team.name} logo`}
              className="w-8 h-8 object-contain flex-shrink-0"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
        </div>
      </div>

      {/* Match Type */}
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Loại trận đấu:</span>
          <span className="text-xs text-gray-300 capitalize font-medium">{match.type}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchResultSection;
