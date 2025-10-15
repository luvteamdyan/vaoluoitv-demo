import { useMemo, useState, useEffect } from 'react';
import { matchService } from '@/services/matchService';
import { Match } from '@/types/match';

export const useMatchResults = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch matches from API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await matchService.getMatches();
        setMatches(response.matches);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const availableLeagues = useMemo(() => {
    if (matches.length === 0) return [{ value: 'all', label: 'Tất cả giải đấu' }];
    
    const leagues = [...new Set(matches.map(match => match.league.name))];
    return [
      { value: 'all', label: 'Tất cả giải đấu' },
      ...leagues.map(league => ({
        value: league.toLowerCase().replace(/\s+/g, '-'),
        label: league
      }))
    ];
  }, [matches]);

  return { 
    matches, 
    loading, 
    error, 
    availableLeagues 
  };
};
