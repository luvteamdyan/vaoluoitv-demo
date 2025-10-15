'use client';

import React from 'react';
import { Match, MatchStatus } from '@/types/match';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatMatchDateTime } from '@/utils/dateFormatter';

interface MatchTableProps {
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (match: Match) => void;
  onRestore?: (match: Match) => void;
  loading: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

const MatchTable: React.FC<MatchTableProps> = ({
  matches,
  onEdit,
  onDelete,
  onRestore,
  loading,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const getStatusWithFeatured = (status: MatchStatus, isFeatured: boolean) => {
    const statusConfig = {
      [MatchStatus.SCHEDULED]: { label: 'Sắp diễn ra', className: 'bg-blue-500/20 text-blue-400' },
      [MatchStatus.LIVE]: { label: 'Đang diễn ra', className: 'bg-red-500/20 text-red-400' },
      [MatchStatus.FINISHED]: { label: 'Đã kết thúc', className: 'bg-green-500/20 text-green-400' },
      [MatchStatus.CANCELLED]: { label: 'Đã hủy', className: 'bg-gray-500/20 text-gray-400' },
      [MatchStatus.NOT_STARTED]: { label: 'Chưa bắt đầu', className: 'bg-purple-500/20 text-purple-400' },
    };

    const config = statusConfig[status];
    
    return (
      <div className="flex flex-col gap-1">
        {/* Match Status */}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
          {config.label}
        </span>
        
        {/* Featured Status */}
        {isFeatured ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            ★ Trận nổi bật
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            Trận thường
          </span>
        )}
      </div>
    );
  };

  // Commented out unused function to avoid ESLint warning
  // const getTypeBadge = (type: MatchType) => {
  //   const typeConfig = {
  //     [MatchType.LEAGUE]: { label: 'Giải đấu', className: 'bg-blue-500/20 text-blue-400' },
  //     [MatchType.CUP]: { label: 'Cúp', className: 'bg-purple-500/20 text-purple-400' },
  //     [MatchType.FRIENDLY]: { label: 'Giao hữu', className: 'bg-orange-500/20 text-orange-400' },
  //     [MatchType.CHAMPIONSHIP]: { label: 'Championship', className: 'bg-indigo-500/20 text-indigo-400' },
  //     [MatchType.INTERNATIONAL]: { label: 'Quốc tế', className: 'bg-teal-500/20 text-teal-400' },
  //   };

  //   const config = typeConfig[type];
  //   return (
  //     <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.className}`}>
  //       {config.label}
  //     </span>
  //   );
  // };

  const renderSortableHeader = (label: string, field: string, className: string = '') => {
    const isSorted = sortBy === field;
    const SortIcon = isSorted ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : null;
    
    return (
      <th 
        className={`${className} ${onSort ? 'cursor-pointer hover:bg-[var(--muted)]/70 transition-colors' : ''}`}
        onClick={() => onSort?.(field)}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {SortIcon && <SortIcon className="w-3 h-3" />}
        </div>
      </th>
    );
  };

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--sidebar-border)]">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-[var(--muted)] rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 bg-[var(--muted)] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Không có trận đấu nào</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--muted)]/50 border-b border-gray-300 dark:border-gray-700">
            <tr>
              <th className="px-3 py-2 text-center text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider w-12">
                STT
              </th>
              {renderSortableHeader('TRẬN ĐẤU', 'match_teams', 'px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider')}
              {renderSortableHeader('GIẢI ĐẤU', 'league', 'px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider')}
              {renderSortableHeader('THỜI GIAN', 'match_date', 'px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider')}
              {renderSortableHeader('TRẠNG THÁI', 'status', 'px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider')}
              {renderSortableHeader('BÌNH LUẬN VIÊN', 'commentator', 'px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider')}
              <th className="px-3 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            {matches.map((match, index) => (
              <tr key={match.id} className="hover:bg-[var(--muted)]/20">
                <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-[var(--muted-foreground)]">
                  {index + 1}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={match.home_team?.logo || '/placeholder-team.svg'}
                        alt={match.home_team?.name || 'Unknown Team'}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-team.svg';
                        }}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-[var(--foreground)] flex-1">
                          {match.home_team?.name || 'Unknown Team'}
                        </div>
                        <span className="font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs min-w-[20px] text-center">
                          {match.home_score}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex-shrink-0 h-8 w-8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={match.away_team?.logo || '/placeholder-team.svg'}
                        alt={match.away_team?.name || 'Unknown Team'}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-team.svg';
                        }}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-[var(--foreground)] flex-1">
                          {match.away_team?.name || 'Unknown Team'}
                        </div>
                        <span className="font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs min-w-[20px] text-center">
                          {match.away_score}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="h-6 w-6 rounded-full object-cover"
                        src={match.league?.logo || '/placeholder-league.svg'}
                        alt={match.league?.name || 'Unknown League'}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-league.svg';
                        }}
                      />
                    </div>
                    <div className="ml-2">
                      <div className="text-sm text-[var(--foreground)]">{match.league?.name || 'Unknown League'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-[var(--foreground)]">
                    {formatMatchDateTime(match.match_date, match.match_time)}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {match.venue}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {getStatusWithFeatured(match.status, match.is_featured)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {match.stream_key?.user ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6">
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {match.stream_key.user.display_name || match.stream_key.user.username}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {match.stream_key.user.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6">
                        <div className="h-6 w-6 rounded-full bg-gray-500/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-2">
                        <div className="text-sm text-[var(--muted-foreground)]">
                          Chưa có bình luận viên
                        </div>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEdit(match)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors border border-blue-500/20"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Sửa
                    </button>
                    
                    {match.is_active ? (
                      // Trận đấu đang hoạt động - hiển thị nút Xóa
                      <button
                        onClick={() => onDelete(match)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa
                      </button>
                    ) : (
                      // Trận đấu đã dừng hoạt động - hiển thị nút Phục hồi
                      onRestore && (
                        <button
                          onClick={() => onRestore(match)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 transition-colors border border-green-500/20"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Phục hồi
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchTable;
