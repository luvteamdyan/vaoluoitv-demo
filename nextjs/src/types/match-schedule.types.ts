// Simplified types for Match Schedule Section
export interface FilterOption {
  value: string;
  label: string;
}

export interface MatchSchedule {
  _id: string;
  home_team: {
    id: string;
    name: string;
    logo: string;
  };
  away_team: {
    id: string;
    name: string;
    logo: string;
  };
  league: {
    id: string;
    name: string;
    logo: string;
  };
  match_date: string;
  match_time: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled' | 'not_started';
  home_score: number;
  away_score: number;
}

export interface EmptyStateProps {
  showAllMatches: boolean;
  selectedLeague: string;
  selectedDate: Date;
}
