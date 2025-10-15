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

export interface Team {
  id: string;
  name: string;
  logo: string;
  link?: string;
  coach?: string;
  slug?: string;
}

export interface League {
  id: string;
  name: string;
  logo: string;
  color?: string;
  code?: string;
}

export interface Match {
  _id: string;
  id: string; // Backend trả về 'id' thay vì '_id' trong MatchResponseDto
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
  description?: string; // Backend có thể không có field này
  tags?: string[]; // Backend có thể không có field này
  stream_keys?: string[]; // Array of StreamKey IDs - optional
  stream_key?: {
    id: string;
    key_value: string;
    rtmp_url: string;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      display_name?: string;
    };
  }; // Stream key info with caster details
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateMatchDto {
  home_team: Team;
  away_team: Team;
  league: League;
  match_time: string;
  match_date: string;
  status: MatchStatus;
  status_code?: string;
  type?: MatchType;
  home_score?: number;
  away_score?: number;
  venue?: string;
  is_active?: boolean;
  is_featured?: boolean;
  description?: string;
  tags?: string[];
  // Stream key assignment
  assignToCaster?: boolean;
  selectedCasterId?: string;
  streamKeyId?: string;
}

export interface UpdateMatchDto {
  home_team?: Team;
  away_team?: Team;
  league?: League;
  match_time?: string;
  match_date?: string;
  status?: MatchStatus;
  status_code?: string;
  type?: MatchType;
  home_score?: number;
  away_score?: number;
  venue?: string;
  is_active?: boolean;
  is_featured?: boolean;
  description?: string;
  tags?: string[];
}

export interface MatchFilters {
  page?: number;
  limit?: number;
  status?: MatchStatus;
  type?: MatchType;
  league_id?: string;
  team_id?: string;
  is_active?: string;
  featured?: boolean;
  date?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string; // 'asc' or 'desc'
  sort_by?: string; // Field to sort by
  has_commentator?: string; // 'true' or 'false' - filter matches có bình luận viên
}

export interface MatchStats {
  total: number;
  scheduled: number;
  live: number;
  finished: number;
  cancelled: number;
  not_started: number;
  featured: number;
  active: number;
}
