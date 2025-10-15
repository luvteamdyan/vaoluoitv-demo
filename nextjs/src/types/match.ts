// Enums matching backend schema
export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  NOT_STARTED = 'not_started',
}

export enum MatchType {
  LEAGUE = 'league',
  CUP = 'cup',
  FRIENDLY = 'friendly',
  CHAMPIONSHIP = 'championship',
  INTERNATIONAL = 'international',
}

// Team interface matching backend schema
export interface Team {
  id: string;
  name: string;
  logo: string;
  link?: string;
  coach?: string;
  slug?: string;
}

// League interface matching backend schema
export interface League {
  id: string;
  name: string;
  logo: string;
  color?: string;
  code?: string;
}

// Stream Key User interface
export interface StreamKeyUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  display_name?: string;
}

// Stream Key Match interface
export interface StreamKeyMatch {
  _id: string;
  home_team: Team;
  away_team: Team;
  match_time: string;
  match_date: string;
  status: string;
  status_code: string;
}

// Stream Key interface
export interface StreamKey {
  id: string;
  matches: StreamKeyMatch[];
  user: StreamKeyUser | null;
  created_at: string;
  revoked_at: string | null;
  description: string;
}

// Main Match interface matching backend schema
export interface Match {
  id: string;
  home_team: Team;
  away_team: Team;
  league: League;
  match_time: string;
  match_date: string; // ISO date string
  status: MatchStatus;
  status_code?: string;
  type: MatchType;
  home_score: number;
  away_score: number;
  venue?: string;
  is_active: boolean;
  is_featured: boolean;
  description: string;
  tags: string[];
  stream_key?: StreamKey | null;
  createdAt: string;
  updatedAt: string;
}

// API Response interfaces
export interface MatchListResponse {
  matches: Match[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Query parameters for API calls
export interface MatchQueryParams {
  page?: number;
  limit?: number;
  status?: MatchStatus;
  league_id?: string;
  team_id?: string;
  search?: string;
  date?: string;
  is_featured?: boolean; // Keep for frontend compatibility, will be mapped to 'featured' in API calls
  sort?: string; // 'asc' or 'desc'
  has_commentator?: string; // 'true' or 'false' - filter matches có bình luận viên
}

// Stream URL response
export interface StreamUrlResponse {
  url: string;
}

// Legacy interfaces for backward compatibility (can be removed later)
export interface MatchStats {
  homeTeam: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
  };
  awayTeam: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
  };
}

export interface LiveMatch extends Match {
  stats: MatchStats;
  events: MatchEvent[];
  currentTime?: string;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty';
  team: 'home' | 'away';
  player: string;
  minute: number;
  description?: string;
}
