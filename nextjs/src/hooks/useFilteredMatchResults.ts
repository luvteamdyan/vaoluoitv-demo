import { useState, useEffect, useRef } from 'react';
import { matchService } from '@/services/matchService';
import { Match, MatchStatus } from '@/types/match';
import { toVietnamDateString } from '@/utils/dateUtils';

interface FilterParams {
  page: number;
  limit: number;
  status: MatchStatus;
  date?: string;
  league_id?: string;
  search?: string;
}

export const useFilteredMatchResults = (
  selectedDate: Date,
  selectedLeague: string,
  showAllMatches: boolean,
  searchTerm: string = '',
  currentPage: number = 1
) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [availableLeagues, setAvailableLeagues] = useState([{ value: 'all', label: 'Tất cả giải đấu', id: '' }]);
  
  // Use ref to store availableLeagues to avoid dependency loop
  const availableLeaguesRef = useRef(availableLeagues);
  availableLeaguesRef.current = availableLeagues;

  // Fetch match results from API (only finished matches)
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare filter parameters for server
        const filterParams: FilterParams = {
          page: currentPage,
          limit: 8,
          status: MatchStatus.FINISHED
        };

        // Add date filter
        if (!showAllMatches) {
          filterParams.date = toVietnamDateString(selectedDate);
        }

        // Add league filter - use league_id instead of league
        if (selectedLeague !== 'all') {
          const selectedLeagueData = availableLeaguesRef.current.find(league => league.value === selectedLeague);
          if (selectedLeagueData && selectedLeagueData.id) {
            filterParams.league_id = selectedLeagueData.id;
          }
        }

        // Add search filter
        if (searchTerm.trim()) {
          filterParams.search = searchTerm.trim();
        }

        // Fetch matches for current page with filters
        const response = await matchService.getMatches(filterParams);
        
        if (response && response.matches) {
          setMatches(response.matches);
          setTotalMatches(response.total || 0);
          
          // If we have matches and selectedLeague is 'all', update available leagues with leagues from current matches
          // This ensures we have all leagues available for the selected date
          if (selectedLeague === 'all' && response.matches.length > 0) {
            const currentLeagueMap = new Map();
            response.matches.forEach(match => {
              if (!currentLeagueMap.has(match.league.name)) {
                currentLeagueMap.set(match.league.name, {
                  id: match.league.id,
                  name: match.league.name
                });
              }
            });
            
            // Merge with existing leagues
            const existingLeagues = availableLeaguesRef.current;
            const newLeagues = [
              { value: 'all', label: 'Tất cả giải đấu', id: '' },
              ...Array.from(currentLeagueMap.values()).map(league => ({
                value: league.name.toLowerCase().replace(/\s+/g, '-'),
                label: league.name,
                id: league.id
              }))
            ];
            
            // Only update if we have new leagues
            const hasNewLeagues = newLeagues.some(newLeague => 
              !existingLeagues.some(existingLeague => existingLeague.id === newLeague.id)
            );
            
            if (hasNewLeagues) {
              setAvailableLeagues(newLeagues);
            }
          }
        } else {
          setMatches([]);
          setTotalMatches(0);
        }
      } catch (err) {
        console.error('Error fetching match results:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch match results');
        setMatches([]);
        setTotalMatches(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentPage, selectedDate, selectedLeague, showAllMatches, searchTerm]); // Remove availableLeagues to prevent infinite loop

  // For server-side pagination, we don't filter on frontend
  // The server should handle filtering and return the correct matches
  const displayMatches = matches;

  return { displayMatches, loading, error, availableLeagues, totalMatches };
};