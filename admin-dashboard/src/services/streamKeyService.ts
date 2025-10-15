import { StreamKey, CreateStreamKeyDto, UpdateStreamKeyDto, StreamKeyQueryDto, StreamKeyListResponse } from '@/types/stream-key';
import { getCookie } from '../utils/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api/v1';

class StreamKeyService {
  private async request<T>(endpoint: string, options: RequestInit = {}, retryable: boolean = true): Promise<T> {
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
      return this.withRetry(makeRequest, 3, 1000, `StreamKeyService.request(${endpoint})`);
    } else {
      return this.withErrorHandling(makeRequest, `StreamKeyService.request(${endpoint})`);
    }
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context: string = 'StreamKeyService'
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Không retry cho một số lỗi cụ thể
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as Error & { status: number }).status;
          if (status === 401 || status === 403 || status === 404 || status >= 500) {
            if (status >= 500 && attempt < maxRetries) {
              if (process.env.NODE_ENV === 'development') {
                // Silently handle retry
              }
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
              continue;
            }
          }
        }
        
        // Nếu không phải lỗi có thể retry, throw ngay
        throw error;
      }
    }
    
    throw lastError!;
  }

  private async withErrorHandling<T>(fn: () => Promise<T>, context: string = 'StreamKeyService'): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // Silently handle error
      }
      throw error;
    }
  }

  async getAll(query: StreamKeyQueryDto = {}): Promise<StreamKeyListResponse> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.match_id) params.append('match_id', query.match_id);
    if (query.user_id) params.append('user_id', query.user_id);
    if (query.status) params.append('status', query.status);

    const queryString = params.toString();
    return this.request<StreamKeyListResponse>(`/stream-keys${queryString ? `?${queryString}` : ''}`, {}, false); // Disable retry
  }

  async getById(id: string): Promise<StreamKey> {
    return this.request<StreamKey>(`/stream-keys/${id}`);
  }

  async getByMatchId(matchId: string): Promise<StreamKey[]> {
    return this.request<StreamKey[]>(`/stream-keys/match/${matchId}`);
  }

  async getActiveByMatchId(matchId: string): Promise<StreamKey | null> {
    return this.request<StreamKey | null>(`/stream-keys/match/${matchId}/active`);
  }

  async create(data: CreateStreamKeyDto): Promise<StreamKey> {
    return this.request<StreamKey>('/stream-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false); // Don't retry create operations
  }

  // Create stream key with match assignment in one step
  async createWithMatchAssignment(data: CreateStreamKeyDto & { match_id?: string }): Promise<StreamKey> {
    return this.request<StreamKey>('/stream-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false); // Don't retry create operations
  }

  async update(id: string, data: UpdateStreamKeyDto): Promise<StreamKey> {
    return this.request<StreamKey>(`/stream-keys/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, false); // Don't retry update operations
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/stream-keys/${id}`, {
      method: 'DELETE',
    });
  }

  async revoke(id: string): Promise<StreamKey> {
    return this.request<StreamKey>(`/stream-keys/${id}/revoke`, {
      method: 'PATCH',
    });
  }

  async regenerate(id: string): Promise<StreamKey> {
    return this.request<StreamKey>(`/stream-keys/${id}/regenerate`, {
      method: 'PATCH',
    });
  }

  async startStream(streamKeyId: string, matchId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/stream-keys/start', {
      method: 'POST',
      body: JSON.stringify({ stream_key_id: streamKeyId, match_id: matchId }),
    }, false); // Don't retry start operations
  }

  async stopStream(streamKeyId: string, matchId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/stream-keys/stop', {
      method: 'POST',
      body: JSON.stringify({ stream_key_id: streamKeyId, match_id: matchId }),
    }, false); // Don't retry stop operations
  }


  async updateMatchStatus(matchId: string, status: string, statusCode: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/stream-keys/match/${matchId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, status_code: statusCode }),
    });
  }

  // Assign stream key to match using PATCH endpoint với validation
  async assignStreamKeyToMatch(streamKeyId: string, matchId: string): Promise<StreamKey> {
    try {
      return await this.request<StreamKey>(`/stream-keys/${streamKeyId}`, {
        method: 'PATCH',
        body: JSON.stringify({ match_id: matchId }),
      }, false); // Don't retry assignment operations
    } catch (error) {
      // Handle specific validation errors từ backend
      if (error instanceof Error) {
        if (error.message.includes('Match is already assigned to another active stream key')) {
          // Extract stream key name from error message nếu có
          const match = error.message.match(/\(([^)]+)\)/);
          const conflictStreamKey = match ? match[1] : 'stream key khác';
          throw new Error(`Match đã được gán cho ${conflictStreamKey}. Stream key này sẽ thay thế match hiện tại.`);
        }
        if (error.message.includes('Match not found')) {
          throw new Error('Không tìm thấy trận đấu này. Vui lòng kiểm tra lại.');
        }
        if (error.message.includes('Stream key not found')) {
          throw new Error('Không tìm thấy stream key này.');
        }
      }
      throw error; // Re-throw original error nếu không match patterns
    }
  }

  // Unassign stream key from match using POST endpoint /remove-matches
  async unassignStreamKeyFromMatch(streamKeyId: string, matchId: string): Promise<StreamKey> {
    return this.request<StreamKey>(`/stream-keys/${streamKeyId}/remove-matches`, {
      method: 'POST',
      body: JSON.stringify({ match_ids: [matchId] }),
    }, false); // Don't retry unassignment operations
  }

  // Update stream key với UpdateStreamKeyDto (chỉ key_value và description)
  async updateStreamKey(streamKeyId: string, data: UpdateStreamKeyDto): Promise<StreamKey> {
    try {
      return await this.request<StreamKey>(`/stream-keys/${streamKeyId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }, false);
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error) {
        if (error.message.includes('key_value already exists')) {
          throw new Error('Key value này đã được sử dụng. Vui lòng chọn key value khác.');
        }
      }
      throw error;
    }
  }

  // Add matches to stream key
  async addMatchesToStreamKey(streamKeyId: string, matchIds: string[]): Promise<StreamKey> {
    try {
      return await this.request<StreamKey>(`/stream-keys/${streamKeyId}/add-matches`, {
        method: 'POST',
        body: JSON.stringify({ match_ids: matchIds }),
      }, false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Match') && error.message.includes('is already assigned to another active stream key')) {
          // Extract match ID and stream key from error message
          const matchMatch = error.message.match(/Match\s+([^\s]+)/);
          const streamKeyMatch = error.message.match(/\(([^)]+)\)/);
          const matchId = matchMatch ? matchMatch[1] : 'này';
          const conflictStreamKey = streamKeyMatch ? streamKeyMatch[1] : 'stream key khác';
          throw new Error(`Trận đấu ${matchId} đã được gán cho ${conflictStreamKey}.`);
        }
        if (error.message.includes('is already in this stream key')) {
          throw new Error('Một số trận đấu đã có trong lịch stream key này.');
        }
        if (error.message.includes('Match') && error.message.includes('not found')) {
          const matchMatch = error.message.match(/Match\s+([^\s]+)/);
          const matchId = matchMatch ? matchMatch[1] : '';
          throw new Error(`Không tìm thấy trận đấu ${matchId}.`);
        }
      }
      throw error;
    }
  }

  // Remove matches from stream key
  async removeMatchesFromStreamKey(streamKeyId: string, matchIds: string[]): Promise<StreamKey> {
    return this.request<StreamKey>(`/stream-keys/${streamKeyId}/remove-matches`, {
      method: 'POST',
      body: JSON.stringify({ match_ids: matchIds }),
    }, false);
  }

  // Search methods for matches and users
  async searchMatches(searchTerm: string, limit: number = 10): Promise<unknown[]> {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    params.append('limit', limit.toString());
    
    const response = await this.request<{ matches: unknown[] }>(`/matches?${params.toString()}`, {}, false);
    return response?.matches || [];
  }

  async searchUsers(searchTerm: string, limit: number = 10): Promise<unknown[]> {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    params.append('limit', limit.toString());
    
    const response = await this.request<{ users: unknown[] }>(`/users?${params.toString()}`, {}, false);
    return response?.users || [];
  }

  async getMatchesByStreamKey(streamKeyId: string): Promise<{ matches: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.request<{ matches: unknown[]; total: number; page: number; limit: number; totalPages: number }>(`/matches/stream-key/${streamKeyId}`, {
      method: 'GET',
    });
  }

  async getStreamKeysByUser(userId: string): Promise<StreamKeyListResponse> {
    return this.request<StreamKeyListResponse>(`/stream-keys?user_id=${userId}&limit=100`, {
      method: 'GET',
    });
  }


  // Get all casters with stream keys (for scheduling matches)
  async getCastersWithAvailableStreamKeys(): Promise<{
    user: unknown;
    streamKey: StreamKey;
  }[]> {
    try {
      // Get all active stream keys (không filter theo matches vì có thể lên lịch nhiều matches)
      const streamKeysResponse = await this.getAll({ 
        limit: 1000,
        status: 'active'
      });
      
      // Chỉ filter stream keys chưa bị revoked
      const availableStreamKeys = streamKeysResponse.streamKeys.filter(sk => 
        !sk.revoked_at
      );

      // Return stream keys with user info, prioritize 'user' object từ backend
      return availableStreamKeys.map(sk => ({
        user: (sk as StreamKey & { user?: unknown }).user || sk.user_id, // Prioritize 'user' object
        streamKey: sk
      })).filter(item => 
        typeof item.user === 'object' && 
        item.user && 
        (item.user as { role?: string }).role?.toLowerCase() === 'caster'
      );
    } catch (error) {
      return [];
    }
  }
}

export const streamKeyService = new StreamKeyService();
