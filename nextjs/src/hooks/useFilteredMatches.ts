import { useState, useEffect, useRef } from 'react';
import { matchService } from '@/services/matchService';
import { Match, MatchStatus } from '@/types/match';

interface FilterParams {
  page: number;
  limit: number;
  status?: MatchStatus;
  date?: string;
  league?: string;
  search?: string;
}

export const useFilteredMatches = (
  selectedDate: Date,
  selectedLeague: string,
  showAllMatches: boolean,
  showLiveMatches: boolean = false,
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

  // Fetch leagues once when component mounts
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await matchService.getMatches({
          page: 1,
          limit: 20 // Get enough matches to build league list
        });
        
        if (response && response.matches) {
          // Create a map to get unique leagues with their IDs
          const leagueMap = new Map();
          response.matches.forEach(match => {
            if (!leagueMap.has(match.league.name)) {
              leagueMap.set(match.league.name, {
                id: match.league.id,
                name: match.league.name
              });
            }
          });
          
          const newLeagues = [
            { value: 'all', label: 'Tất cả giải đấu', id: '' },
            ...Array.from(leagueMap.values()).map(league => ({
              value: league.name.toLowerCase().replace(/\s+/g, '-'),
              label: league.name,
              id: league.id
            }))
          ];
          setAvailableLeagues(newLeagues);
        }
      } catch (err) {
        console.error('Error fetching leagues:', err);
      }
    };

    fetchLeagues();
  }, []); // Only fetch once when component mounts

  // Fetch schedule matches from API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare filter parameters for server
        const filterParams: FilterParams = {
          page: currentPage,
          limit: 8
        };

        // Add status filter for live matches
        if (showLiveMatches) {
          filterParams.status = MatchStatus.LIVE;
        }


        // Add date filter (always works when not showing all matches)
        if (!showAllMatches) {
          filterParams.date = selectedDate.toISOString().split('T')[0];
        }

        // Add league filter - use league_id instead of league
        if (selectedLeague !== 'all') {
          const selectedLeagueData = availableLeaguesRef.current.find(league => league.value === selectedLeague);
          if (selectedLeagueData && selectedLeagueData.id) {
            filterParams.league = selectedLeagueData.id;
          }
        }

        // Fetch matches for current page with filters
        const response = await matchService.getMatches(filterParams);
        
        // Ensure we have the matches array
        if (response && response.matches) {
          setMatches(response.matches);
          setTotalMatches(response.total || 0);
        } else {
          setMatches([]);
          setTotalMatches(0);
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch matches');
        setMatches([]);
        setTotalMatches(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentPage, selectedDate, selectedLeague, showAllMatches, showLiveMatches]); // Remove availableLeagues from dependencies

  // For server-side pagination, we don't filter on frontend
  // The server should handle filtering and return the correct matches
  const displayMatches = matches;

  return { displayMatches, loading, error, availableLeagues, matches, totalMatches };
};