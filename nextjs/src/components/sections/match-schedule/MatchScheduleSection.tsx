"use client";
import { useState, useEffect } from 'react';
import MatchScheduleCard from '@/components/ui/cards/MatchScheduleCard';
import { MATCHES_PER_PAGE } from '@/constants/match-schedule.constants';
import { Match, MatchStatus } from '@/types/match';
import { matchService } from '@/services/matchService';
import logger from '@/utils/logger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/sellects/select';

export default function MatchScheduleSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  
  // League filter states
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [availableLeagues, setAvailableLeagues] = useState<{id: string, name: string}[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);

  // Generate 7 days starting from today
  const generateNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const next7Days = generateNext7Days();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentPage(1);
    setContentLoading(true);
    setSelectedLeagueId(null); // Reset league filter when date changes
  };

  // Fetch leagues for filter (20 matches to get comprehensive league list)
  useEffect(() => {
    const fetchLeaguesForFilter = async () => {
      try {
        setLoadingLeagues(true);
        
        // Format date for API
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        // Fetch 20 LIVE matches
        const liveResponse = await matchService.getMatches({
          page: 1,
          limit: 20,
          status: MatchStatus.LIVE,
          date: dateString,
        });

        // Fetch 20 NOT_STARTED matches (sắp diễn ra)
        const notStartedResponse = await matchService.getMatches({
          page: 1,
          limit: 20,
          status: MatchStatus.NOT_STARTED,
          date: dateString,
        });

        const scheduledResponse = await matchService.getMatches({
          page: 1,
          limit: 20,
          status: MatchStatus.SCHEDULED,
          date: dateString,
        });

        // Combine matches and extract unique leagues
        let allMatches: Match[] = [];
        if (liveResponse && liveResponse.matches) {
          allMatches = allMatches.concat(liveResponse.matches);
        }
        if (scheduledResponse && scheduledResponse.matches) {
          allMatches = allMatches.concat(scheduledResponse.matches);
        }
        if (notStartedResponse && notStartedResponse.matches) {
          allMatches = allMatches.concat(notStartedResponse.matches);
        }

        // Extract unique leagues
        const uniqueLeagues = Array.from(
          new Map(
            allMatches.map(match => [match.league.id, {
              id: match.league.id,
              name: match.league.name
            }])
          ).values()
        );

        setAvailableLeagues(uniqueLeagues);
      } catch (err) {
        logger.error('Error fetching leagues for filter:', err);
        setAvailableLeagues([]);
      } finally {
        setLoadingLeagues(false);
      }
    };

    fetchLeaguesForFilter();
  }, [selectedDate]);

  // Fetch matches for selected date and current page
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        // Format date for API - simple date format without timezone conversion
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        // Fetch LIVE matches for current page first
        const liveResponse = await matchService.getMatches({
          date: dateString,
          page: currentPage,
          limit: MATCHES_PER_PAGE,
          league_id: selectedLeagueId || undefined,
          status: MatchStatus.LIVE
        });

        // Fetch SCHEDULED matches for current page
        const scheduledResponse = await matchService.getMatches({
          date: dateString,
          page: currentPage,
          limit: MATCHES_PER_PAGE,
          league_id: selectedLeagueId || undefined,
          status: MatchStatus.SCHEDULED
        });

        // Fetch NOT_STARTED matches for current page
        const notStartedResponse = await matchService.getMatches({
          date: dateString,
          page: currentPage,
          limit: MATCHES_PER_PAGE,
          league_id: selectedLeagueId || undefined,
          status: MatchStatus.NOT_STARTED
        });

        // Combine matches from all three statuses
        const allActiveMatches = [
          ...(liveResponse.matches || []),
          ...(scheduledResponse.matches || []),
          ...(notStartedResponse.matches || [])
        ];

        // Calculate total active matches for pagination
        const totalActiveMatches = (liveResponse.total || 0) + (scheduledResponse.total || 0) + (notStartedResponse.total || 0);

        const activeMatches = allActiveMatches;
        
        // Sort matches with priority: LIVE → BLV → SCHEDULED → NOT_STARTED
        const sortedMatches = activeMatches.sort((a, b) => {
          // 1. LIVE matches always come first
          if (a.status === MatchStatus.LIVE && b.status !== MatchStatus.LIVE) {
            return -1;
          }
          if (a.status !== MatchStatus.LIVE && b.status === MatchStatus.LIVE) {
            return 1;
          }
          
          // 2. If both are NOT_LIVE, prioritize matches with BLV (trận nào có BLV thì được đẩy lên)
          if (a.status !== MatchStatus.LIVE && b.status !== MatchStatus.LIVE) {
            const aHasBLV = a.stream_key?.user ? 1 : 0;
            const bHasBLV = b.stream_key?.user ? 1 : 0;
            
            if (aHasBLV !== bHasBLV) {
              return bHasBLV - aHasBLV; // BLV matches come first
            }
          }
          
          // 3. If both have same BLV status, prioritize SCHEDULED over NOT_STARTED
          if (a.status !== MatchStatus.LIVE && b.status !== MatchStatus.LIVE) {
            const aHasBLV = a.stream_key?.user ? 1 : 0;
            const bHasBLV = b.stream_key?.user ? 1 : 0;
            
            // Only compare by status if both have same BLV status
            if (aHasBLV === bHasBLV) {
              if (a.status === MatchStatus.SCHEDULED && b.status === MatchStatus.NOT_STARTED) {
                return -1;
              }
              if (a.status === MatchStatus.NOT_STARTED && b.status === MatchStatus.SCHEDULED) {
                return 1;
              }
            }
          }
          
          // 4. If same status and BLV status, maintain backend order
          return 0;
        });

        // Log API response for debugging (only in development)
        logger.api('Fetched matches for date', { 
          date: dateString, 
          totalActiveMatches: totalActiveMatches,
          liveCount: liveResponse.total || 0,
          scheduledCount: scheduledResponse.total || 0,
          notStartedCount: notStartedResponse.total || 0,
          currentPageMatches: sortedMatches.length,
          page: currentPage
        });
        logger.table(sortedMatches.map(m => ({ 
          id: m.id, 
          status: m.status, 
          name: `${m.home_team.name} vs ${m.away_team.name}`,
          league: m.league.name,
          hasBLV: !!m.stream_key?.user
        })), 'Current Page Matches (LIVE → BLV → SCHEDULED → NOT_STARTED)');

        setMatches(sortedMatches);
        setTotalMatches(totalActiveMatches);
      } catch (err) {
        logger.error('Error fetching matches:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch matches');
        setMatches([]);
      } finally {
        setLoading(false);
        setContentLoading(false);
      }
    };

    fetchMatches();
  }, [selectedDate, currentPage, selectedLeagueId]);

  // Current matches (already sorted)
  const currentMatches = matches;

  // Calculate total pages based on backend response
  const totalPages = Math.ceil(totalMatches / MATCHES_PER_PAGE);



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


  // Error state - only show if there's an error and no matches
  if (error && matches.length === 0) {
    return (
      <section className="w-full py-3 md:py-6 lg:py-8">
        <div className="container mx-auto px-0 sm:px-2 md:px-6 lg:px-8 xl:px-32">
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
    <section className="w-full px-0 sm:px-2 relative">

      <div className="container mx-auto px-0 sm:px-2 md:px-6 lg:px-8 xl:px-32 relative z-10 ">
        <div className="bg-gradient-to-br from-red-700/60 to-red-700 px-2 rounded-sm rounded-tl-lg rounded-tr-lg border-t-6 pb-[5px] mb-4 mr-2 ml-2 relative overflow-hidden">
          {/* Background Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none z-0">
            <img
              src="https://cdn.vaoluoitv.com/images/luck8.png"
              alt="VaoluoiTV Logo"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
          
          {/* Header */}
          <div className="text-center mb-4 md:mb-6 relative z-10">
            <h1 className="relative mb-2">
              {/* Main Title with Gradient Effect */}
              <span className="block text-3xl md:text-4xl lg:text-5xl font-black mb-4 mt-8">
                LỊCH THI ĐẤU
              </span>

              {/* Subtitle with Glow Effect */}
              <span className="block text-sm md:text-base lg:text-lg font-bold mt-1">
                <span className="text-white drop-shadow-lg" style={{
                  textShadow: '0 0 10px #ff6b6b, 0 0 20px #ff6b6b, 0 0 30px #ff6b6b, 0 0 40px #ff6b6b'
                }}>
                  MỚI NHẤT HÔM NAY 24H
                </span>
              </span>
            </h1>
            {/* Decorative Line */}
            <div className="w-full max-w-xl mt-4 mx-auto h-[2px] bg-gradient-to-r from-transparent via-yellow-400/90 to-transparent rounded-full opacity-80"></div>

          </div>
                
          {/* Filter Section - 7 Days */}
          <div className="w-full mb-8 md:mb-10 lg:mb-12">
            <div
              className="flex overflow-x-auto gap-3 sm:gap-5 md:gap-7 w-full justify-start lg:justify-center xl:justify-center px-0 sm:px-6 scrollbar-hide"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE 10+
              }}
            >
              <div className="flex gap-3 sm:gap-5 md:gap-7 min-w-max">
                {next7Days.map((date, index) => {
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  const isToday = index === 0;

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={`group relative overflow-hidden px-3 py-2 sm:px-5 sm:py-3 md:px-7 md:py-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 flex flex-col items-center justify-center flex-shrink-0 min-w-[70px] sm:min-w-[90px] md:min-w-[110px]
              ${isSelected
                          ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] border border-yellow-400/60"
                          : "bg-black text-gray-300 border border-yellow-500/40 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                        }`}
                    >
                      {/* Slice hover effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></span>

                      {/* Content */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <div
                          className={`text-[9px] sm:text-[11px] md:text-[12px] uppercase tracking-wide ${isToday
                            ? "text-yellow-400 font-bold drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]"
                            : "text-gray-400"
                            }`}
                        >
                          {isToday
                            ? "HÔM NAY"
                            : date.toLocaleDateString("vi-VN", {
                              weekday: "short",
                            })}
                        </div>
                        <div className="font-extrabold text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight">
                          {date.getDate()}
                        </div>
                        <div className="text-[9px] sm:text-[11px] md:text-[12px] text-gray-400">
                          {date.toLocaleDateString("vi-VN", { month: "short" })}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>


          </div>
        </div>

        {/* Content Section */}
        <div className="w-full shadow-lg">
          {/* League Header with Filter */}
          <div className="mb-2 md:mb-4">
            <div className="flex flex-col px-2 sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xs md:text-base lg:text-lg font-semibold text-white">
                  {selectedLeagueId ? 
                    availableLeagues.find(l => l.id === selectedLeagueId)?.name || 'Giải đấu' : 
                    'Tất cả giải đấu'
                  } - {selectedDate.toLocaleDateString('vi-VN')}
                </h2>
              </div>
              
              {/* League Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs md:text-sm text-gray-300 whitespace-nowrap font-semibold">
                  Lọc giải đấu:
                </label>
                <Select
                  value={selectedLeagueId || "all"}
                  onValueChange={(value) => {
                    setSelectedLeagueId(value === "all" ? null : value);
                    setCurrentPage(1); // Reset page when league filter changes
                  }}
                >
                  <SelectTrigger className="w-[180px] bg-black border border-yellow-500/50 text-gray-300 rounded-lg md:rounded-xl text-xs font-semibold h-9 md:h-10">
                    <SelectValue placeholder="Chọn giải đấu" />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-gray-800 border border-yellow-500/50 text-gray-300 max-h-[240px] overflow-y-auto"
                    position="popper"
                    side="bottom"
                    align="start"
                  >
                    <SelectItem value="all">Tất cả giải đấu</SelectItem>
                    {loadingLeagues ? (
                      <SelectItem value="loading" disabled>Đang tải giải đấu...</SelectItem>
                    ) : (
                      availableLeagues.map((league) => (
                        <SelectItem key={league.id} value={league.id}>
                          {league.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Content Loading State */}
          {contentLoading || loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-300 text-sm">Đang tải dữ liệu...</p>
            </div>
          ) : (
            /* Match Cards - Display in sorted order */
            currentMatches.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currentMatches.map((match, matchIndex) => (
                  <MatchScheduleCard
                    key={matchIndex}
                    match={match}
                  />
                ))}
              </div>
            </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Không có trận đấu</h3>
                    <p className="text-gray-400 text-sm">
                      Không có trận đấu nào diễn ra vào ngày {selectedDate.toLocaleDateString('vi-VN')}.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
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
    </section>
  );
}