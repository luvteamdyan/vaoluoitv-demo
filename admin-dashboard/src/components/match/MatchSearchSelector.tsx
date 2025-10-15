'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/types/match';
import { matchService } from '@/services/matchService';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { formatMatchDateTime } from '@/utils/dateFormatter';

interface MatchSearchSelectorProps {
  onMatchSelect: (match: Match | null) => void;
  selectedMatch?: Match | null;
  placeholder?: string;
  includeMatchesWithoutCommentator?: boolean; // Cho phép tìm kiếm trận đấu chưa có bình luận viên
}

/**
 * Component đơn giản cho phép search và select match
 * TODO: Sẽ được cập nhật với tính năng search/filtering đầy đủ trong phiên bản tiếp theo
 */
export default function MatchSearchSelector({
  onMatchSelect,
  selectedMatch,
  placeholder = 'Tìm kiếm trận đấu...',
  includeMatchesWithoutCommentator = false,
}: MatchSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const searchMatches = async () => {
      if (searchTerm.trim().length < 2) {
        setMatches([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const searchParams: {
          search: string;
          limit: number;
          page: number;
          has_commentator?: string;
        } = {
          search: searchTerm,
          limit: 10,
          page: 1,
        };
        
        // Chỉ thêm filter has_commentator nếu không cho phép tìm kiếm trận đấu chưa có bình luận viên
        if (!includeMatchesWithoutCommentator) {
          searchParams.has_commentator = 'true';
        }
        
        const response = await matchService.getAllMatches(searchParams);
        setMatches(response.matches || []);
        setShowDropdown(true);
      } catch (error) {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMatches, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, includeMatchesWithoutCommentator]);

  const handleSelectMatch = (match: Match) => {
    onMatchSelect(match);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
        />
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-[var(--muted-foreground)]">
              <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Đang tìm kiếm...
            </div>
          ) : matches.length > 0 ? (
            <div className="py-1">
              {matches.map((match) => (
                <button
                  key={match.id || match._id}
                  type="button"
                  onClick={() => handleSelectMatch(match)}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)] last:border-b-0"
                >
                  <div className="font-medium text-sm">
                    {match.home_team.name} vs {match.away_team.name}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    {formatMatchDateTime(match.match_date, match.match_time)} • {match.status}
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-[var(--muted-foreground)] text-sm">
              Không tìm thấy trận đấu nào
            </div>
          ) : null}
        </div>
      )}

      {/* Selected match display */}
      {selectedMatch && (
        <div className="mt-2 p-3 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
          <div className="text-sm font-medium">
            {selectedMatch.home_team.name} vs {selectedMatch.away_team.name}
          </div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">
            {formatMatchDateTime(selectedMatch.match_date, selectedMatch.match_time)}
          </div>
        </div>
      )}
    </div>
  );
}

