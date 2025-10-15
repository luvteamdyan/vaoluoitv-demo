export interface StreamKey {
  id: string;
  key_value: string;
  rtmp_url: string;
  // Backend trả về match object (singular) khi có gán match
  match?: {
    _id: string;
    id?: string;
    home_team: {
      id: string;
      name: string;
      logo: string;
      link?: string;
      coach?: string;
      slug?: string;
    };
    away_team: {
      id: string;
      name: string;
      logo: string;
      link?: string;
      coach?: string;
      slug?: string;
    };
    match_date: string;
    match_time: string;
    status: string;
    status_code?: string;
    assigned_at?: string;
    is_active?: boolean;
    home_score?: number;
    away_score?: number;
  };
  // Giữ lại matches array cho backward compatibility
  matches?: Array<{
    _id: string;
    id?: string;
    home_team: {
      id: string;
      name: string;
      logo: string;
      link?: string;
      coach?: string;
      slug?: string;
    };
    away_team: {
      id: string;
      name: string;
      logo: string;
      link?: string;
      coach?: string;
      slug?: string;
    };
    match_date: string;
    match_time: string;
    status: string;
    status_code?: string;
    assigned_at?: string;
    is_active?: boolean;
    home_score?: number;
    away_score?: number;
  }>;
  user?: { // Primary - user object từ backend
    _id: string;
    username: string;
    display_name?: string;
    email: string;
    role: string;
  };
  user_id?: string | { // Backward compatibility
    _id: string;
    id?: string;
    username: string;
    display_name?: string;
    email: string;
    role: string;
  };
  created_at: string;
  revoked_at: string | null;
  description?: string;
}

export interface CreateStreamKeyDto {
  key_value: string;
  user_id: string;
  matches?: string[]; // Array of match IDs để lên lịch
  description?: string;
}

export interface UpdateStreamKeyDto {
  key_value?: string;
  match_id?: string | null;
  description?: string;
}

// Separate DTOs for match management
export interface AddMatchesToStreamKeyDto {
  match_ids: string[];
}

export interface RemoveMatchesFromStreamKeyDto {
  match_ids: string[];
}

export interface StreamKeyQueryDto {
  page?: number;
  limit?: number;
  user_id?: string;
  match_id?: string;
  status?: 'active' | 'revoked';
}

export interface StreamKeyListResponse {
  streamKeys: StreamKey[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StreamKeyStats {
  total: number;
  active: number;
  revoked: number;
  byMatch: Array<{
    match_id: string;
    match_name: string;
    count: number;
  }>;
}
