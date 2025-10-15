import { Match, MatchListResponse, MatchQueryParams, MatchStatus, StreamUrlResponse } from '@/types/match';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class MatchService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { 
        ...defaultOptions, 
        ...options,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors, timeouts, and other connection issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('CONNECTION_REFUSED');
      }
      throw error;
    }
  }

  // Get all matches with pagination and filters
  async getMatches(params: MatchQueryParams = {}): Promise<MatchListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.league_id) queryParams.append('league_id', params.league_id);
    if (params.team_id) queryParams.append('team_id', params.team_id);
    if (params.search) queryParams.append('search', params.search);
    if (params.date) queryParams.append('date', params.date);
    if (params.is_featured !== undefined) queryParams.append('featured', params.is_featured.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.has_commentator) queryParams.append('has_commentator', params.has_commentator);

    const queryString = queryParams.toString();
    const endpoint = `/matches${queryString ? `?${queryString}` : ''}`;
    
    
    const response = await this.makeRequest<MatchListResponse>(endpoint);
    
    // Transform the response to ensure proper data structure
    return {
      matches: response.matches || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 27,
      totalPages: response.totalPages || 1,
      hasNext: response.hasNext || false,
      hasPrev: response.hasPrev || false
    };
  }

  // Get matches by status
  async getMatchesByStatus(status: MatchStatus): Promise<Match[]> {
    const response = await this.getMatches({ status });
    return response.matches;
  }

  // Get featured matches
  async getFeaturedMatches(): Promise<Match[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('featured', 'true');
    queryParams.append('limit', '8');
    queryParams.append('sortBy', 'match_time');
    
    const endpoint = `/matches?${queryParams.toString()}`;
    const response = await this.makeRequest<MatchListResponse>(endpoint);
    return response.matches;
  }

  // Get live matches
  async getLiveMatches(): Promise<Match[]> {
    return this.getMatchesByStatus(MatchStatus.LIVE);
  }

  // Get upcoming matches
  async getUpcomingMatches(): Promise<Match[]> {
    return this.getMatchesByStatus(MatchStatus.NOT_STARTED);
  }

  // Get finished matches
  async getFinishedMatches(): Promise<Match[]> {
    return this.getMatchesByStatus(MatchStatus.FINISHED);
  }

  // Get match by ID
  async getMatchById(id: string): Promise<Match> {
    const response = await this.makeRequest<Match>(`/matches/${id}`);
    return response;
  }

  // Get stream URL for a match
  async getStreamUrl(matchId: string): Promise<StreamUrlResponse> {
    const response = await this.makeRequest<StreamUrlResponse>(`/matches/${matchId}/stream`);
    return response;
  }

  // Get secure stream URLs from security API
  async getSecureStreamUrls(id: string, ttl: number = 120): Promise<{
    success: boolean;
    data: {
      flv: {
        url: string;
        token: string;
        time: number;
        expiresAt: string;
      };
      m3u8: {
        url: string;
        token: string;
        time: number;
        expiresAt: string;
      };
    };
  }> {
    const securityApiUrl = `${API_BASE_URL}/security/cdn/${id}`;
    const url = `${securityApiUrl}/urls`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formats: ['flv', 'm3u8'],
        ttl: ttl
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Search matches
  async searchMatches(query: string): Promise<Match[]> {
    const response = await this.getMatches({ search: query });
    return response.matches;
  }
}

export const matchService = new MatchService();