import { Match, CreateMatchDto, UpdateMatchDto, MatchFilters, MatchStats, MatchStatus } from '@/types/match';
import { getCookie } from '@/utils/cookies';
import { withErrorHandling, withRetry } from '@/utils/errorHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api/v1';

interface MatchListResponse {
  matches: Match[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Service class để quản lý tất cả các API calls liên quan đến matches
 */
class MatchService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryable: boolean = true
  ): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const token = getCookie('access_token');
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
          (error as Error & { status: number; statusCode: number }).status = response.status;
          (error as Error & { status: number; statusCode: number }).statusCode = response.status;
          throw error;
        }

        // Kiểm tra xem response có content không
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        // Nếu response rỗng hoặc không phải JSON, trả về undefined
        if (!contentType || !contentType.includes('application/json') || contentLength === '0') {
          return undefined as T;
        }
        
        try {
          return await response.json();
        } catch {
          // Nếu parse JSON thất bại, trả về undefined
          return undefined as T;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    if (retryable) {
      return withRetry(makeRequest, 3, 1000);
    } else {
      return withErrorHandling(makeRequest, `MatchService.request(${endpoint})`);
    }
  }

  // Lấy danh sách tất cả matches với paging và filter
  async getAllMatches(filters: MatchFilters = {}): Promise<MatchListResponse> {
    return withErrorHandling(async () => {
      const params = new URLSearchParams();
      
      // Dựa trên MatchQueryDto từ backend
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.league_id) params.append('league_id', filters.league_id);
      if (filters.team_id) params.append('team_id', filters.team_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
      if (filters.date) params.append('date', filters.date);
      if (filters.type) params.append('type', filters.type);
      
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.has_commentator) params.append('has_commentator', filters.has_commentator);
    
    const queryString = params.toString();
      const endpoint = queryString ? `/matches?${queryString}` : '/matches';
      
      return this.request<MatchListResponse>(endpoint, {}, false); // Disable retry
    }, 'MatchService.getAllMatches');
  }

  /**
   * Lấy thông tin match theo ID
   */
  async getMatchById(id: string): Promise<Match> {
    return withErrorHandling(async () => {
      return this.request<Match>(`/matches/${id}`);
    }, 'MatchService.getMatchById');
  }

  /**
   * Tạo match mới
   */
  async createMatch(matchData: CreateMatchDto): Promise<Match> {
    return withErrorHandling(async () => {
      return this.request<Match>('/matches', {
        method: 'POST',
        body: JSON.stringify(matchData),
      }, false); // Don't retry create operations
    }, 'MatchService.createMatch');
  }

  /**
   * Cập nhật match
   */
  async updateMatch(id: string, matchData: UpdateMatchDto): Promise<Match> {
    return withErrorHandling(async () => {
      return this.request<Match>(`/matches/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(matchData),
      }, false); // Don't retry update operations
    }, 'MatchService.updateMatch');
  }

  /**
   * Cập nhật điểm số match
   */
  async updateMatchScore(id: string, homeScore: number, awayScore: number): Promise<Match> {
    return this.updateMatch(id, {
      home_score: homeScore,
      away_score: awayScore,
    });
  }

  /**
   * Cập nhật trạng thái match
   */
  async updateMatchStatus(id: string, status: MatchStatus): Promise<Match> {
    return this.updateMatch(id, { status });
  }

  /**
   * Xóa match
   */
  async deleteMatch(id: string): Promise<void> {
    return this.request<void>(`/matches/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Lấy URL stream cho trận đấu đang live
   */
  async getMatchStream(id: string): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/matches/${id}/stream`);
  }

  /**
   * Bulk delete matches theo filter (Admin only)
   */
  async bulkDeleteMatches(filter: {
    status?: string;
    type?: string;
    league_id?: string;
    team_id?: string;
    start_date?: string;
    end_date?: string;
    inactive_only?: boolean;
    non_featured_only?: boolean;
    match_ids?: string[];
    confirm: boolean;
  }): Promise<{ message: string; deletedCount: number }> {
    return this.request<{ message: string; deletedCount: number }>('/matches/bulk', {
      method: 'DELETE',
      body: JSON.stringify(filter),
    });
  }

  /**
   * Lấy thống kê matches đầy đủ - dành cho trang matches
   * 8 requests song song, mỗi request chỉ lấy 1 record để lấy total count
   */
  async getMatchStats(): Promise<MatchStats> {
    try {
      const [
        totalResponse,
        liveResponse,
        scheduledResponse,
        finishedResponse,
        cancelledResponse,
        notStartedResponse,
        featuredResponse,
        activeResponse
      ] = await Promise.all([
        this.getAllMatches({ limit: 1 }),
        this.getAllMatches({ limit: 1, status: MatchStatus.LIVE }),
        this.getAllMatches({ limit: 1, status: MatchStatus.SCHEDULED }),
        this.getAllMatches({ limit: 1, status: MatchStatus.FINISHED }),
        this.getAllMatches({ limit: 1, status: MatchStatus.CANCELLED }),
        this.getAllMatches({ limit: 1, status: MatchStatus.NOT_STARTED }),
        this.getAllMatches({ limit: 1, featured: true }),
        this.getAllMatches({ limit: 1, is_active: 'true' }),
      ]);
      
      return {
        total: totalResponse.total,
        live: liveResponse.total,
        scheduled: scheduledResponse.total,
        finished: finishedResponse.total,
        cancelled: cancelledResponse.total,
        not_started: notStartedResponse.total,
        featured: featuredResponse.total,
        active: activeResponse.total,
      };
    } catch (error) {
      return this.getDefaultStats();
    }
  }

  /**
   * Lấy chỉ total count - tối ưu cho dashboard
   * Chỉ 1 request duy nhất
   */
  async getMatchTotal(): Promise<{ total: number }> {
    try {
      const response = await this.getAllMatches({ limit: 1 });
      return { total: response.total };
    } catch (error) {
      return { total: 0 };
    }
  }

  /**
   * Tìm kiếm matches với filters (client-side filtering)
   */
  async searchMatchesWithFilters(filters: MatchFilters): Promise<Match[]> {
    const result = await this.getAllMatches(filters);
    return result.matches;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Trả về stats mặc định khi có lỗi
   */
  private getDefaultStats(): MatchStats {
    return {
      total: 0,
      live: 0,
      scheduled: 0,
      finished: 0,
      cancelled: 0,
      not_started: 0,
      featured: 0,
      active: 0,
    };
  }
}

export const matchService = new MatchService();
